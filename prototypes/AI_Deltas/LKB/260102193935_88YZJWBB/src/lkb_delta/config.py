from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Tuple

DELTA_ID = "260102193935_88YZJWBB"


def _default_pulses(grid_size: int) -> List["BiasPulse"]:
    center = grid_size // 2
    return [
        BiasPulse(step=0, position=(center, center, center), strength=1.0, radius=1.8),
        BiasPulse(step=5, position=(max(0, center - 2), center, center + 1), strength=0.8, radius=2.4),
        BiasPulse(step=10, position=(center + 2, center + 1, max(0, center - 1)), strength=0.6, radius=2.0),
    ]


@dataclass
class BiasPulse:
    step: int
    position: Tuple[int, int, int]
    strength: float
    radius: float


@dataclass
class SimulationConfig:
    steps: int = 40
    grid_size: int = 10
    seed: int = 7
    flip_probability: float = 0.015
    parity_probability: float = 0.006
    path_b_base: float = 0.65
    path_b_span: float = 0.22
    alpha: float = 0.16
    forgiveness_threshold: float = 0.9
    forgiveness_strength: float = 0.35
    bias_decay: float = 0.93
    bias_strength: float = 0.12
    bias_radius: float = 3.0
    lens_weights: Dict[str, float] = field(
        default_factory=lambda: {
            "human": 0.25,
            "predictive": 0.25,
            "systemic": 0.25,
            "harmonic": 0.25,
        }
    )
    harmonic_clamp: Tuple[float, float] = (0.2, 0.85)
    pulses: List[BiasPulse] = field(default_factory=list)

    def with_defaults(self) -> "SimulationConfig":
        if not self.pulses:
            self.pulses = _default_pulses(self.grid_size)
        return self


DEFAULT_CONFIG = SimulationConfig().with_defaults()
