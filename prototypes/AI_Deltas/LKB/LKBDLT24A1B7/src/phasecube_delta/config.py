from dataclasses import dataclass, field
from typing import Optional


@dataclass
class LensWeights:
    """Harmonic lens weights (SV4) controlling exploratory vs stabilizing bias.

    The harmonic lens acts as a damping factor; predictive biases toward
    exploration (Path B). Values do not have to sum to 1 but should stay in
    [0.0, 1.0] for clarity.
    """

    human: float = 0.25
    predictive: float = 0.30
    systemic: float = 0.25
    harmonic: float = 0.20


@dataclass
class SimulationConfig:
    """Configuration knobs (SV3) for the lattice simulator."""

    grid: int = 10
    flip_p: float = 0.02
    parity_p: float = 0.01
    path_b_p: float = 0.65
    alpha: float = 0.18
    forgiveness_threshold: float = 0.22
    forgiveness_blend: float = 0.55
    lens_weights: LensWeights = field(default_factory=LensWeights)
    seed: Optional[int] = None

    def __post_init__(self) -> None:
        if self.grid < 2:
            raise ValueError("grid must be >= 2 for neighbor wrapping")
        for name in ("flip_p", "parity_p", "path_b_p", "alpha"):
            value = getattr(self, name)
            if not 0.0 <= value <= 1.0:
                raise ValueError(f"{name} must be within [0, 1]")
        if not 0.0 < self.forgiveness_blend <= 1.0:
            raise ValueError("forgiveness_blend must be in (0, 1]")
