from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Tuple

from .utils import clamp


@dataclass
class LensOutput:
    path_b_probability: float
    damping: float
    bias_gain: float


class LensMixer:
    def __init__(self, weights: Dict[str, float], base_prob: float, span: float, harmonic_clamp: Tuple[float, float]):
        total = sum(weights.values()) or 1.0
        self.weights = {k: v / total for k, v in weights.items()}
        self.base_prob = base_prob
        self.span = span
        self.harmonic_clamp = harmonic_clamp

    def mix(self, energy: float, dispersion: float, bias_amplitude: float) -> LensOutput:
        w = self.weights
        exploratory = w.get("predictive", 0.0) * (0.6 + bias_amplitude) + w.get("human", 0.0) * (0.4 + dispersion)
        stabilizer = w.get("systemic", 0.0) * (0.4 + energy) + w.get("harmonic", 0.0) * (0.5 - dispersion)
        score = exploratory - stabilizer

        path_b_probability = clamp(self.base_prob + self.span * score, 0.05, 0.95)
        damping = clamp(self.harmonic_clamp[0] + w.get("harmonic", 0.0) * dispersion, *self.harmonic_clamp)
        bias_gain = clamp(1.0 + (exploratory - stabilizer) * 0.35, 0.2, 1.8)

        return LensOutput(path_b_probability=path_b_probability, damping=damping, bias_gain=bias_gain)
