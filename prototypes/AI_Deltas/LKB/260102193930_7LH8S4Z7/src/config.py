"""Configuration structures for the lens-gated echo runner."""
from __future__ import annotations

from dataclasses import dataclass, field, replace
from typing import List


@dataclass
class BiasConfig:
    decay: float = 0.94
    strength: float = 0.12
    radius: int = 3
    pulse_jitter: float = 0.12


@dataclass
class LensWeights:
    human: float = 0.18
    predictive: float = 0.22
    systemic: float = 0.22
    harmonic: float = 0.22


@dataclass
class ForgivenessConfig:
    threshold: float = 0.38
    damp: float = 0.35


@dataclass
class CouplingConfig:
    echo_gain: float = 0.08
    bias_gain: float = 0.6


@dataclass
class ScenarioPulse:
    step: int
    band: float
    strength: float
    pan: float = 0.0
    radius: int | None = None
    repeat: int | None = None


@dataclass
class SimulationConfig:
    grid_size: int = 14
    steps: int = 120
    flip_p: float = 0.013
    parity_p: float = 0.006
    alpha: float = 0.18
    path_b_base: float = 0.72
    path_b_min: float = 0.55
    path_b_max: float = 0.9
    smooth_factor: float = 0.18
    bias: BiasConfig = field(default_factory=BiasConfig)
    lens_weights: LensWeights = field(default_factory=LensWeights)
    forgiveness: ForgivenessConfig = field(default_factory=ForgivenessConfig)
    coupling: CouplingConfig = field(default_factory=CouplingConfig)
    scenario_pulses: List[ScenarioPulse] = field(default_factory=list)


def default_pulses() -> List[ScenarioPulse]:
    """Preset scenario pulses that mimic soft audio influence."""
    return [
        ScenarioPulse(step=5, band=0.18, strength=0.18, pan=-0.25, radius=3),
        ScenarioPulse(step=18, band=0.42, strength=0.16, pan=0.0, radius=4),
        ScenarioPulse(step=36, band=0.62, strength=0.14, pan=0.25, radius=3),
        ScenarioPulse(step=60, band=0.32, strength=0.2, pan=-0.4, radius=4, repeat=45),
    ]


def build_default_config() -> SimulationConfig:
    cfg = SimulationConfig()
    cfg.scenario_pulses = default_pulses()
    return cfg


def with_overrides(config: SimulationConfig, **kwargs) -> SimulationConfig:
    """Return a copy of the config with any provided overrides applied."""
    return replace(config, **kwargs)
