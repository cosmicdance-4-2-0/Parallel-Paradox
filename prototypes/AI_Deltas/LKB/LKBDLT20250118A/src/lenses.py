"""Lens blend logic inspired by SV4 with path selection hooks (SV3)."""
from __future__ import annotations

from dataclasses import dataclass

from config import clamp


@dataclass
class LensBlend:
    human: float = 0.25
    predictive: float = 0.25
    systemic: float = 0.25
    harmonic: float = 0.25

    def normalized(self) -> "LensBlend":
        total = self.human + self.predictive + self.systemic + self.harmonic
        if total == 0:
            return LensBlend(0.25, 0.25, 0.25, 0.25)
        return LensBlend(
            human=self.human / total,
            predictive=self.predictive / total,
            systemic=self.systemic / total,
            harmonic=self.harmonic / total,
        )

    def path_b_weight(self, base: float) -> float:
        """Derive Path B probability from lens blend.

        Predictive/Systemic encourage divergence (Path B), while
        Human/Harmonic damp toward stability (Path A), matching SV3/SV4.
        """
        normalized = self.normalized()
        exploratory = normalized.predictive * 0.25 + normalized.systemic * 0.15
        stabilizing = normalized.human * 0.2 + normalized.harmonic * 0.25
        adjusted = base + exploratory - stabilizing
        return clamp(adjusted)

    def as_dict(self) -> dict[str, float]:
        normalized = self.normalized()
        return {
            "human": normalized.human,
            "predictive": normalized.predictive,
            "systemic": normalized.systemic,
            "harmonic": normalized.harmonic,
        }
