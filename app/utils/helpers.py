"""
Shared utility helpers.
"""

from typing import Any


def clamp(value: float, min_val: float = 0.0, max_val: float = 10.0) -> float:
    """Clamps a value between min and max."""
    return max(min_val, min(max_val, value))


def normalize(value: float, min_val: float = 0.0, max_val: float = 10.0) -> float:
    """Normalizes a value to [0, 1] range."""
    if max_val == min_val:
        return 0.0
    return (value - min_val) / (max_val - min_val)


def score_to_label(score: float) -> str:
    """Converts a 0–1 score to a human-readable label."""
    if score >= 0.8:
        return "Excellent"
    elif score >= 0.6:
        return "Good"
    elif score >= 0.4:
        return "Moderate"
    elif score >= 0.2:
        return "Needs Work"
    return "Poor"


def safe_get(data: dict, key: str, default: Any = None) -> Any:
    """Safely retrieves a key from a dict with a default."""
    return data.get(key, default)
