from __future__ import annotations

from dataclasses import dataclass
from typing import Tuple

from .config import LensWeights


@dataclass
class LensOutput:
    path_b_probability: float
    damping: float
    bias_gain: float


class LensMixer:
    def __init__(self, weights: LensWeights, clamps: Tuple[float, float], harmonic_clamp: Tuple[float, float]):
        self.weights = weights.normalized()
        self.clamps = clamps
        self.harmonic_clamp = harmonic_clamp

    def mix(self, energy: float, dispersion: float, bias_amplitude: float) -> LensOutput:
        # Human lens: prefer stability when dispersion is already high.
        human_pull = (1 - dispersion) * self.weights.human * 0.2
        # Predictive lens: encourage exploration via Path B when energy is modest.
        predictive_push = (energy + bias_amplitude) * self.weights.predictive * 0.4
        # Systemic lens: couple bias amplitude to both damping and bias gain.
        systemic_gain = bias_amplitude * self.weights.systemic * 0.6
        # Harmonic lens: clamp damping upward as dispersion grows.
        harmonic_damp = min(max(dispersion * self.weights.harmonic, self.harmonic_clamp[0]), self.harmonic_clamp[1])

        path_b = human_pull + predictive_push + 0.55
        path_b = min(max(path_b, self.clamps[0]), self.clamps[1])

        damping = min(max(harmonic_damp, 0.0), 1.0)
        bias_gain = max(0.0, 0.02 + systemic_gain)

        return LensOutput(path_b_probability=path_b, damping=damping, bias_gain=bias_gain)
