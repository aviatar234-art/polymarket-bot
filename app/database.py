import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

DB_PATH = Path(__file__).resolve().parent.parent / "polymarket_bot.db"


@contextmanager
def get_connection() -> Iterator[sqlite3.Connection]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    with get_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS signals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                market TEXT NOT NULL,
                token_id TEXT NOT NULL,
                yes_price REAL NOT NULL,
                no_price REAL NOT NULL,
                edge_percentage REAL NOT NULL,
                detected_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS trades (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                token_id TEXT NOT NULL,
                side TEXT NOT NULL,
                price REAL NOT NULL,
                size REAL NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
            """
        )


def save_signal(signal: dict) -> None:
    with get_connection() as conn:
        conn.execute(
            """
            INSERT INTO signals (market, token_id, yes_price, no_price, edge_percentage)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                signal["market"],
                str(signal["token_id"]),
                signal["yes_price"],
                signal["no_price"],
                signal["edge_percentage"],
            ),
        )


def save_trade(trade: dict) -> None:
    with get_connection() as conn:
        conn.execute(
            """
            INSERT INTO trades (token_id, side, price, size, status)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                str(trade["token_id"]),
                trade["side"],
                trade["price"],
                trade["size"],
                trade.get("status", "prepared"),
            ),
        )


def list_signals(limit: int = 50) -> list[dict]:
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM signals ORDER BY detected_at DESC LIMIT ?", (limit,)
        ).fetchall()
        return [dict(row) for row in rows]


def count_open_positions() -> int:
    with get_connection() as conn:
        row = conn.execute(
            "SELECT COUNT(*) AS total FROM trades WHERE status IN ('prepared', 'open')"
        ).fetchone()
        return int(row["total"])
