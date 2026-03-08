from __future__ import annotations

from typing import Any

import pandas as pd

from app.orderbook_reader import best_ask, fetch_orderbook


def _extract_yes_no_token_ids(market: dict[str, Any]) -> tuple[str | None, str | None]:
    tokens = market.get("tokens", []) or market.get("outcomes", [])
    yes_id, no_id = None, None

    for token in tokens:
        outcome = str(token.get("outcome", token.get("name", ""))).strip().lower()
        token_id = token.get("token_id") or token.get("id") or token.get("tokenId")
        if outcome == "yes":
            yes_id = str(token_id)
        elif outcome == "no":
            no_id = str(token_id)

    return yes_id, no_id


def find_arbitrage_signals(markets: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Detect markets where YES ask + NO ask < 1."""
    signals: list[dict[str, Any]] = []

    for market in markets:
        yes_token_id, no_token_id = _extract_yes_no_token_ids(market)
        if not yes_token_id or not no_token_id:
            continue

        try:
            yes_book = fetch_orderbook(yes_token_id)
            no_book = fetch_orderbook(no_token_id)
        except Exception:
            continue

        yes_price = best_ask(yes_book)
        no_price = best_ask(no_book)
        if yes_price is None or no_price is None:
            continue

        total = yes_price + no_price
        if total < 1:
            edge = 1 - total
            signals.append(
                {
                    "market": market.get("question", market.get("title", "Unknown Market")),
                    "token_id": yes_token_id,
                    "yes_price": yes_price,
                    "no_price": no_price,
                    "edge_percentage": edge,
                }
            )

    if not signals:
        return []

    df = pd.DataFrame(signals).sort_values(by="edge_percentage", ascending=False)
    return df.to_dict(orient="records")
