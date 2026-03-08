import os

MAX_TRADE_SIZE = float(os.getenv("MAX_TRADE_SIZE", "5"))
MAX_OPEN_POSITIONS = int(os.getenv("MAX_OPEN_POSITIONS", "2"))
MIN_EDGE = float(os.getenv("MIN_EDGE", "0.02"))


def validate_trade_size(size: float) -> bool:
    return 0 < size <= MAX_TRADE_SIZE


def can_open_new_position(open_positions: int) -> bool:
    return open_positions < MAX_OPEN_POSITIONS


def meets_edge_threshold(edge_percentage: float) -> bool:
    return edge_percentage >= MIN_EDGE
