"""Configuration structures for the D7F3L9P2Q5R8 delta.

Anchors SV1/SV2/SV3/SV6/SV7/SV8 by keeping parameters explicit, tunable,
and human-readable. No hidden global state.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict


@dataclass
class LensSchedule:
    """Lens preset and timing configuration."""

    presets: Dict[str, Dict[str, float]] = field(
        default_factory=lambda: {
            "harmonic": {"human": 0.24, "predictive": 0.18, "systemic": 0.18, "harmonic": 0.40},
            "exploratory": {"human": 0.20, "predictive": 0.38, "systemic": 0.22, "harmonic": 0.20},
            "stable": {"human": 0.26, "predictive": 0.20, "systemic": 0.22, "harmonic": 0.32},
        }
    )
    cadence: int = 48  # steps between preset shifts
    blend_width: int = 8  # steps for linear interpolation between presets


@dataclass
class SimulationConfig:
    """Primary tunables for the tri-grid runner."""

    grid_size: int = 16
    flip_probability: float = 0.02
    parity_probability: float = 0.01
    path_b_probability: float = 0.65
    alpha: float = 0.18
    bias_strength: float = 0.08
    bias_decay: float = 0.9
    delay_length: int = 5
    delay_decay: float = 0.82
    coupling_echo_to_core: float = 0.12
    coupling_memory_to_core: float = 0.18
    plasticity_probability: float = 0.0015
    forgiveness_threshold: float = 0.32
    forgiveness_strength: float = 0.55
    max_steps: int = 200
    lens_schedule: LensSchedule = field(default_factory=LensSchedule)


DEFAULT_CONFIG = SimulationConfig()
