"""Lens presets and scheduler (SV4/SV6/SV7)."""
from __future__ import annotations

from typing import Dict, Tuple

import numpy as np

from .config import LensSchedule


class LensScheduler:
    def __init__(self, schedule: LensSchedule) -> None:
        self.schedule = schedule
        self.sequence = list(schedule.presets.keys())
        if not self.sequence:
            raise ValueError("At least one lens preset is required")

    def active_weights(self, step: int) -> Dict[str, float]:
        """Return blended lens weights for the given step."""
        idx = (step // self.schedule.cadence) % len(self.sequence)
        next_idx = (idx + 1) % len(self.sequence)
        within_blend = step % self.schedule.cadence
        if within_blend < self.schedule.blend_width:
            t = within_blend / max(1, self.schedule.blend_width)
            return self._blend(self.sequence[idx], self.sequence[next_idx], t)
        return self.schedule.presets[self.sequence[idx]]

    def _blend(self, current_name: str, next_name: str, t: float) -> Dict[str, float]:
        cur = self.schedule.presets[current_name]
        nxt = self.schedule.presets[next_name]
        keys = cur.keys()
        blended = {k: (1 - t) * cur[k] + t * nxt[k] for k in keys}
        # Normalize to keep total weight near 1.0
        total = sum(blended.values())
        return {k: v / total for k, v in blended.items()}


def fuse_path_probability(base: float, weights: Dict[str, float]) -> float:
    """Adjust path branching probability using lens influence (SV4)."""
    predictive = weights.get("predictive", 0.25)
    harmonic = weights.get("harmonic", 0.25)
    adjusted = base + 0.15 * (predictive - 0.5) - 0.1 * (harmonic - 0.5)
    return float(np.clip(adjusted, 0.05, 0.95))


def fuse_forgiveness_threshold(base: float, weights: Dict[str, float]) -> float:
    """Tune forgiveness activation with harmonic emphasis (SV1/SV8)."""
    harmonic = weights.get("harmonic", 0.25)
    return float(max(0.05, base * (0.9 + 0.4 * harmonic)))


def fuse_bias_gain(base: float, weights: Dict[str, float]) -> float:
    """Human/predictive lenses nudge bias responsiveness (SV2/SV5)."""
    human = weights.get("human", 0.25)
    predictive = weights.get("predictive", 0.25)
    return float(base * (0.9 + 0.3 * human + 0.2 * predictive))
