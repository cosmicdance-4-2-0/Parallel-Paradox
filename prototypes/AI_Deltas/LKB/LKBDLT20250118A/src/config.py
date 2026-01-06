"""Configuration defaults for the LKBDLT20250118A delta.

Derived from PhaseCube tunables (SV2, SV3) plus lens and forgiveness hooks
from the four-lens framework and kenotic operator (SV4, SV6).
"""
from dataclasses import dataclass


@dataclass
class SimulationConfig:
    grid_size: int = 8
    flip_p: float = 0.02
    parity_p: float = 0.01
    flip_delta: float = 0.12
    parity_boost: float = 0.13
    alpha: float = 0.18
    path_b_base: float = 0.65
    forgiveness_threshold: float = 0.35  # plasma stddev threshold
    forgiveness_floor: float = 0.5
    echo_weight: float = 0.1
    echo_decay: float = 0.08
    input_gain: float = 0.6
    max_bias: float = 0.35
    steps: int = 120
    random_seed: int | None = None


def clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    """Clamp a float into [low, high]."""
    return max(low, min(high, value))
