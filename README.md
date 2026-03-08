# Polymarket Bot

Ultra-premium FastAPI + SQLite trading bot with a live Hebrew RTL dashboard for scanning markets, tracking signals, shark radar, AI chat, and strategy controls.

## Stack

- Python
- FastAPI (+ WebSocket)
- SQLite
- requests
- pandas
- Vanilla HTML/CSS/JS frontend (modular panels)

## Project structure

```text
app/
  main.py
  market_scanner.py
  orderbook_reader.py
  signal_engine.py
  execution_engine.py
  risk_engine.py
  telegram_bot.py
  database.py
  web/
    index.html
    styles.css
    app.js
requirements.txt
README.md
```

## Run locally

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open:
- Dashboard: `http://127.0.0.1:8000`
- API docs: `http://127.0.0.1:8000/docs`

## API endpoints for dashboard integration

- `GET /status` – bot status, PnL, signals count, shark alerts, win rate, simulation mode.
- `GET /markets` – live market table data.
- `GET /signals` – latest signals from SQLite.
- `GET /scan` – run market scan and signal generation.
- `POST /start-trading` – enable trading and prepare trades.
- `POST /stop-trading` – stop trading mode.
- `POST /toggle-simulation` – switch simulation mode on/off.
- `WS /ws/live` – periodic real-time push updates (status + ticker values).

## Dashboard capabilities

- RTL Hebrew ultra-premium UI with sticky nav tabs and live ticker.
- Animated effects: shimmer title, pulse badges, floating coins, modal transitions.
- Market scanner table with AI analyze modal and edge highlighting.
- Signals feed + mixed line/candlestick canvas chart.
- Shark radar panel with live whale-style activity feed.
- AI assistant chat panel (ready for backend model integration).
- Strategies grid with animated toggles and tooltips.
- Trading controls: start/stop, simulation mode, trade-size sliders.
- Drag & drop dashboard panels and light/dark mode toggle.

## Custom domain setup (moneyprinter.trade)

1. Deploy FastAPI service on VPS/Render/Railway.
2. Configure Nginx reverse proxy to `127.0.0.1:8000`.
3. Add A/CNAME DNS record to your server.
4. Enable HTTPS via Let's Encrypt.
