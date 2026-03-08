from __future__ import annotations

import os
from typing import Any

from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

from app.database import count_open_positions, init_db, list_signals, save_signal, save_trade
from app.execution_engine import ExecutionEngine
from app.market_scanner import fetch_active_markets
from app.risk_engine import can_open_new_position, meets_edge_threshold, validate_trade_size
from app.signal_engine import find_arbitrage_signals
from app.telegram_bot import TelegramBot, format_signal_message

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
WEB_DIR = BASE_DIR / "web"

app = FastAPI(title="Polymarket Trading Bot")
app.mount("/web", StaticFiles(directory=WEB_DIR), name="web")

engine = ExecutionEngine()
telegram = TelegramBot()
trading_enabled = False


@app.on_event("startup")
def on_startup() -> None:
    init_db()


def scan_and_generate_signals() -> tuple[int, list[dict[str, Any]]]:
    markets = fetch_active_markets(limit=100)
    signals = find_arbitrage_signals(markets)
    for signal in signals:
        save_signal(signal)
    return len(markets), signals


@app.get("/")
def home() -> FileResponse:
    return FileResponse(WEB_DIR / "index.html")


@app.get("/scan")
def scan_markets() -> dict[str, Any]:
    market_count, signals = scan_and_generate_signals()
    return {"markets_scanned": market_count, "signals_found": len(signals)}


@app.get("/signals")
def get_signals() -> dict[str, Any]:
    return {"signals": list_signals()}


@app.post("/start-trading")
def start_trading() -> dict[str, Any]:
    global trading_enabled
    trading_enabled = True

    generated_trades = []
    trade_size = float(os.getenv("TRADE_SIZE", "5"))

    _, signals = scan_and_generate_signals()

    for signal in signals:
        if not meets_edge_threshold(signal["edge_percentage"]):
            continue
        if not validate_trade_size(trade_size):
            continue
        if not can_open_new_position(count_open_positions()):
            break

        trade = engine.place_limit_buy(
            token_id=signal["token_id"],
            price=signal["yes_price"],
            size=trade_size,
        )
        save_trade(trade)
        generated_trades.append(trade)
        telegram.send_alert(format_signal_message(signal))

    return {"trading_enabled": trading_enabled, "trades_prepared": generated_trades}


@app.post("/stop-trading")
def stop_trading() -> dict[str, bool]:
    global trading_enabled
    trading_enabled = False
    return {"trading_enabled": trading_enabled}
