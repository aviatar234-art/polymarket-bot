# Polymarket Bot

A Python trading bot scaffold for Polymarket using FastAPI + SQLite.

## Stack

- Python
- FastAPI
- SQLite
- requests
- pandas

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
.env.example
README.md
```

## Setup

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Configure environment:

```bash
cp .env.example .env
```

3. Run API + web UI:

```bash
uvicorn app.main:app --reload
```

Open `http://127.0.0.1:8000` to see the website/dashboard.

## Endpoints

- `GET /` - Marketing website + dashboard UI.
- `GET /scan` - Fetch markets and store detected signals.
- `GET /signals` - List recent signals from SQLite.
- `POST /start-trading` - Scan + prepare trades when risk limits pass.
- `POST /stop-trading` - Disable trading mode.

## Connect your own domain

1. Deploy the app on a server (Render/Railway/VPS).
2. Put Nginx in front of FastAPI (reverse proxy to port `8000`).
3. Add DNS records (A/CNAME) from your domain provider to the server.
4. Enable HTTPS with Let's Encrypt.

## Signal rule

A signal is generated when:

`YES ask + NO ask < 1`

Returned signal payload includes:

- `market`
- `token_id`
- `yes_price`
- `no_price`
- `edge_percentage`

## Notes

- `execution_engine.py` prepares order payloads compatible with a future Polymarket CLOB client integration.
- `telegram_bot.py` sends alerts if Telegram credentials are configured.
