from __future__ import annotations

from typing import Any

import requests

GAMMA_API_BASE = "https://gamma-api.polymarket.com"


def fetch_active_markets(limit: int = 100) -> list[dict[str, Any]]:
    """Fetch active markets from Polymarket Gamma API."""
    response = requests.get(
        f"{GAMMA_API_BASE}/markets",
        params={"active": "true", "closed": "false", "limit": limit},
        timeout=15,
    )
    response.raise_for_status()
    data = response.json()

    if isinstance(data, list):
        return data
    if isinstance(data, dict) and "markets" in data:
        return data["markets"]
    return []
