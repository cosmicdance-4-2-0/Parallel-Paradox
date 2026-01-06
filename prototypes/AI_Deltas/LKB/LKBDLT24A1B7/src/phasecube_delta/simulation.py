"""PhaseCube-inspired lattice simulator with harmonic and forgiveness controls.

Design lineage:
- SV1/SV2/SV3: PhaseCube lattice, toroidal neighbors, Path A vs Path B dynamics.
- SV4: Lens weights inform exploratory (predictive) vs stabilizing (harmonic) bias.
- SV6: Forgiveness operator dampens divergence when dispersion exceeds a threshold.
- SV5/SV8: Maintain decentralized, noise-driven updates rather than centralized control.
"""
from __future__ import annotations

import math
import random
from dataclasses import dataclass
from typing import Dict, Iterable, List, Tuple

from .config import LensWeights, SimulationConfig


@dataclass
class LatticeState:
    plasma: List[float]
    liquid: List[float]
    solid: List[float]
    parity: List[int]


class LatticeSimulator:
    """Simulate a toroidal lattice with ternary phases and harmonic damping."""

    def __init__(self, config: SimulationConfig, rng: random.Random | None = None):
        self.config = config
        self.rng = rng or random.Random(config.seed)
        self.size = config.grid
        self.count = self.size ** 3
        self.state = self._init_state()
        self.forgiveness_events: List[int] = []

    def _init_state(self) -> LatticeState:
        def r() -> float:
            return self.rng.random() * 0.5

        return LatticeState(
            plasma=[r() for _ in range(self.count)],
            liquid=[r() for _ in range(self.count)],
            solid=[r() for _ in range(self.count)],
            parity=[0 for _ in range(self.count)],
        )

    def _index(self, x: int, y: int, z: int) -> int:
        return (x % self.size) * self.size * self.size + (y % self.size) * self.size + (z % self.size)

    def _neighbors(self, idx: int) -> Iterable[int]:
        x = idx // (self.size * self.size)
        y = (idx // self.size) % self.size
        z = idx % self.size
        offsets = ((1, 0, 0), (-1, 0, 0), (0, 1, 0), (0, -1, 0), (0, 0, 1), (0, 0, -1))
        for dx, dy, dz in offsets:
            yield self._index(x + dx, y + dy, z + dz)

    def neighbor_average(self, idx: int) -> float:
        total = 0.0
        for n in self._neighbors(idx):
            total += self.state.plasma[n]
        return total / 6.0

    def perturb(self) -> None:
        cfg = self.config
        for i in range(self.count):
            if self.rng.random() < cfg.flip_p:
                # Small plasma kick; keep bounded to [0, 1).
                delta = (self.rng.random() - 0.5) * 0.3
                self.state.plasma[i] = (self.state.plasma[i] + delta) % 1.0
            if self.rng.random() < cfg.parity_p:
                self.state.parity[i] = 1 - self.state.parity[i]

    def _dispersion(self) -> float:
        mean = sum(self.state.plasma) / self.count
        return math.sqrt(sum((p - mean) ** 2 for p in self.state.plasma) / self.count)

    def _effective_path_b(self, dispersion: float, lenses: LensWeights) -> float:
        base = self.config.path_b_p
        exploration = 1.0 + 0.6 * max(0.0, lenses.predictive - 0.25)
        harmonic = 1.0 - min(0.9, lenses.harmonic * max(0.0, (dispersion - self.config.forgiveness_threshold) / max(self.config.forgiveness_threshold, 1e-6)))
        value = base * exploration * harmonic
        return max(0.05, min(0.95, value))

    def _forgiveness_factor(self, dispersion: float) -> float:
        if dispersion > self.config.forgiveness_threshold:
            return self.config.forgiveness_blend
        return 1.0

    def step(self, steps: int = 1) -> None:
        for _ in range(steps):
            dispersion = self._dispersion()
            effective_path_b = self._effective_path_b(dispersion, self.config.lens_weights)
            forgiveness = self._forgiveness_factor(dispersion)
            if forgiveness < 1.0:
                self.forgiveness_events.append(len(self.forgiveness_events))

            p0 = list(self.state.plasma)
            l0 = list(self.state.liquid)
            s0 = list(self.state.solid)

            for i in range(self.count):
                avg = (p0[i] + l0[i] + s0[i]) / 3.0
                neighbor_delta = abs(p0[i] - self.neighbor_average(i)) + self.state.parity[i] * 0.13
                choice = neighbor_delta if self.rng.random() < effective_path_b else avg
                liquid_value = avg * (1 - forgiveness) + choice * forgiveness
                self.state.liquid[i] = liquid_value % 1.0
                self.state.solid[i] = (s0[i] * (1 - self.config.alpha) + liquid_value * self.config.alpha) % 1.0

    def summary(self) -> Dict[str, float]:
        dispersion = self._dispersion()
        mean_plasma = sum(self.state.plasma) / self.count
        mean_liquid = sum(self.state.liquid) / self.count
        mean_solid = sum(self.state.solid) / self.count
        parity_ratio = sum(self.state.parity) / self.count
        return {
            "grid": self.size,
            "cells": self.count,
            "dispersion": dispersion,
            "mean_plasma": mean_plasma,
            "mean_liquid": mean_liquid,
            "mean_solid": mean_solid,
            "parity_ratio": parity_ratio,
            "forgiveness_events": len(self.forgiveness_events),
            "path_b_p": self.config.path_b_p,
        }
