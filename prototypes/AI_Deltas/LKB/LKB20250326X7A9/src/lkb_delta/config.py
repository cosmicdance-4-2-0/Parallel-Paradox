from dataclasses import dataclass, field
from typing import Dict, Tuple

DELTA_ID = "LKB20250326X7A9"


@dataclass
class LensWeights:
    human: float = 0.25
    predictive: float = 0.25
    systemic: float = 0.25
    harmonic: float = 0.25

    def normalized(self) -> "LensWeights":
        total = max(self.human + self.predictive + self.systemic + self.harmonic, 1e-8)
        return LensWeights(
            human=self.human / total,
            predictive=self.predictive / total,
            systemic=self.systemic / total,
            harmonic=self.harmonic / total,
        )


@dataclass
class SimulationConfig:
    grid_size: int = 10
    flip_probability: float = 0.02
    parity_probability: float = 0.01
    base_path_b: float = 0.68
    alpha: float = 0.16
    forgiveness_threshold: float = 0.18
    forgiveness_strength: float = 0.32
    bias_decay: float = 0.93
    bias_strength: float = 0.08
    bias_radius: int = 2
    bin_count: int = 64
    steps: int = 90
    seed: int = 7
    lens_weights: LensWeights = field(default_factory=LensWeights)
    clamp_path_b: Tuple[float, float] = (0.55, 0.92)
    harmonic_clamp: Tuple[float, float] = (0.6, 1.0)


DEFAULT_CONFIG = SimulationConfig()
