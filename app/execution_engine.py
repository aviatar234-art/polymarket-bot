from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass
class ExecutionConfig:
    private_key: str = os.getenv("PRIVATE_KEY", "")
    api_key: str = os.getenv("POLYMARKET_API_KEY", "")
    api_secret: str = os.getenv("POLYMARKET_API_SECRET", "")
    passphrase: str = os.getenv("POLYMARKET_PASSPHRASE", "")


class ExecutionEngine:
    """Prepare order payloads for Polymarket CLOB client integration."""

    def __init__(self, config: ExecutionConfig | None = None) -> None:
        self.config = config or ExecutionConfig()

    def place_limit_buy(self, token_id: str, price: float, size: float) -> dict:
        return {
            "action": "place_order",
            "order_type": "limit",
            "side": "buy",
            "token_id": str(token_id),
            "price": float(price),
            "size": float(size),
            "status": "prepared",
        }

    def place_limit_sell(self, token_id: str, price: float, size: float) -> dict:
        return {
            "action": "place_order",
            "order_type": "limit",
            "side": "sell",
            "token_id": str(token_id),
            "price": float(price),
            "size": float(size),
            "status": "prepared",
        }
