from __future__ import annotations

from typing import Iterable


def clamp(value: float, lower: float, upper: float) -> float:
    return max(lower, min(upper, value))


def average(values: Iterable[float]) -> float:
    vals = list(values)
    return sum(vals) / len(vals) if vals else 0.0


def variance(values: Iterable[float]) -> float:
    vals = list(values)
    if not vals:
        return 0.0
    avg = average(vals)
    return sum((v - avg) ** 2 for v in vals) / len(vals)


def wrap_index(idx: int, size: int) -> int:
    return idx % size
