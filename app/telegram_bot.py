from __future__ import annotations

import os

import requests


class TelegramBot:
    def __init__(self) -> None:
        self.token = os.getenv("TELEGRAM_BOT_TOKEN", "")
        self.chat_id = os.getenv("TELEGRAM_CHAT_ID", "")

    def send_alert(self, message: str) -> bool:
        if not self.token or not self.chat_id:
            return False

        response = requests.post(
            f"https://api.telegram.org/bot{self.token}/sendMessage",
            json={"chat_id": self.chat_id, "text": message},
            timeout=10,
        )
        return response.ok


def format_signal_message(signal: dict) -> str:
    return (
        "🚨 Polymarket Signal Detected\n"
        f"Market: {signal['market']}\n"
        f"Token ID: {signal['token_id']}\n"
        f"YES Ask: {signal['yes_price']:.4f}\n"
        f"NO Ask: {signal['no_price']:.4f}\n"
        f"Edge: {signal['edge_percentage']:.2%}"
    )
