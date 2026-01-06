"""Lens-inspired mixer translating metrics into gating signals."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict

from .config import LensWeights


@dataclass
class LensOutput:
    path_b_adjust: float
    damping: float
    bias_gain: float


def clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def mix_lenses(metrics: Dict[str, float], weights: LensWeights) -> LensOutput:
    """Blend lens weights into usable gating signals.

    metrics keys: energy, dispersion, bias, echo_gap.
    """
    energy = metrics.get("energy", 0.0)
    dispersion = metrics.get("dispersion", 0.0)
    bias_level = metrics.get("bias", 0.0)
    echo_gap = metrics.get("echo_gap", 0.0)

    human_term = max(0.0, 0.5 - dispersion)
    predictive_term = bias_level + echo_gap
    systemic_term = energy
    harmonic_term = dispersion

    path_b_adjust = clamp(
        (weights.predictive * predictive_term * 0.25)
        + (weights.systemic * systemic_term * 0.12)
        - (weights.human * human_term * 0.18),
        -0.25,
        0.25,
    )

    damping = clamp(harmonic_term * weights.harmonic * 0.7, 0.0, 0.6)

    bias_gain = clamp(1.0 + (weights.human * 0.2) - (weights.systemic * 0.08), 0.6, 1.4)

    return LensOutput(path_b_adjust=path_b_adjust, damping=damping, bias_gain=bias_gain)
