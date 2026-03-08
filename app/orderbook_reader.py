from __future__ import annotations

from typing import Any

import requests

CLOB_API_BASE = "https://clob.polymarket.com"


def fetch_orderbook(token_id: str) -> dict[str, Any]:
    """Fetch orderbook for a given token from Polymarket CLOB API."""
    response = requests.get(
        f"{CLOB_API_BASE}/book",
        params={"token_id": token_id},
        timeout=15,
    )
    response.raise_for_status()
    return response.json()


def best_ask(orderbook: dict[str, Any]) -> float | None:
    """Extract best ask from a token orderbook payload."""
    asks = orderbook.get("asks") or orderbook.get("sell") or []
    if not asks:
        return None

    prices = []
    for level in asks:
        if isinstance(level, dict):
            if "price" in level:
                prices.append(float(level["price"]))
            elif "p" in level:
                prices.append(float(level["p"]))
        elif isinstance(level, (list, tuple)) and level:
            prices.append(float(level[0]))

    return min(prices) if prices else None
