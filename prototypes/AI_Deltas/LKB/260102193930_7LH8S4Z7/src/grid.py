"""Phase lattice with stochastic perturbations, lens gating, and forgiveness."""
from __future__ import annotations

import random
from dataclasses import dataclass
from typing import List

from .config import SimulationConfig
from .lens import LensOutput


def clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


@dataclass
class GridMetrics:
    energy: float
    dispersion: float
    bias: float


class PhaseGrid:
    def __init__(self, config: SimulationConfig, rng: random.Random | None = None):
        self.config = config
        self.rng = rng or random.Random()
        self.size = config.grid_size
        self.count = self.size ** 3
        self.plasma: List[float] = [0.0 for _ in range(self.count)]
        self.liquid: List[float] = [0.0 for _ in range(self.count)]
        self.solid: List[float] = [0.0 for _ in range(self.count)]
        self.parity: List[int] = [0 for _ in range(self.count)]
        self._seed()

    def _seed(self) -> None:
        for i in range(self.count):
            self.plasma[i] = self.rng.random()
            self.liquid[i] = self.rng.random()
            self.solid[i] = self.rng.random() * 0.6
            self.parity[i] = 1 if self.rng.random() < 0.5 else 0

    def _idx(self, x: int, y: int, z: int) -> int:
        s = self.size
        return (x % s) + (y % s) * s + (z % s) * s * s

    def _neighbor_mean(self, index: int) -> float:
        s = self.size
        x = index % s
        y = (index // s) % s
        z = index // (s * s)
        total = 0.0
        for dz in (-1, 0, 1):
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    if dx == dy == dz == 0:
                        continue
                    total += self.plasma[self._idx(x + dx, y + dy, z + dz)]
        return total / 26.0

    def _forgiveness_factor(self, dispersion: float) -> float:
        margin = max(0.0, dispersion - self.config.forgiveness.threshold)
        damp = self.config.forgiveness.damp * margin
        return max(0.2, 1.0 - damp)

    def perturb(self) -> None:
        for i in range(self.count):
            if self.rng.random() < self.config.flip_p:
                self.plasma[i] = 1.0 - self.plasma[i]
            if self.rng.random() < self.config.parity_p:
                self.parity[i] = 1 - self.parity[i]
            # Gentle internal jitter to avoid stasis.
            self.plasma[i] = clamp(self.plasma[i] + self.rng.uniform(-0.01, 0.01), 0.0, 1.0)

    def step(self, bias_field: List[float], lens: LensOutput, coupling_adjust: float = 0.0) -> None:
        new_plasma = [0.0 for _ in range(self.count)]
        new_liquid = [0.0 for _ in range(self.count)]
        new_solid = [0.0 for _ in range(self.count)]

        for i in range(self.count):
            p = self.plasma[i]
            l = self.liquid[i]
            s = self.solid[i]
            parity = self.parity[i]
            neighbor_mean = self._neighbor_mean(i)
            dispersion = abs(p - neighbor_mean)

            path_b = clamp(
                self.config.path_b_base + lens.path_b_adjust + bias_field[i] * 0.5,
                self.config.path_b_min,
                self.config.path_b_max,
            )
            exploratory = dispersion + parity * 0.08 + coupling_adjust
            settled = (p + l + s) / 3.0
            mix = exploratory if self.rng.random() < path_b else settled

            forgiveness = self._forgiveness_factor(dispersion)
            damped = mix * forgiveness * (1.0 - lens.damping)
            biased = damped + bias_field[i] * lens.bias_gain

            new_liquid[i] = clamp(biased, 0.0, 1.0)
            new_solid[i] = clamp(s * (1.0 - self.config.alpha) + new_liquid[i] * self.config.alpha, 0.0, 1.0)
            new_plasma[i] = clamp((p * 0.6 + new_liquid[i] * 0.4) + bias_field[i] * 0.1, 0.0, 1.0)

        self.plasma = new_plasma
        self.liquid = new_liquid
        self.solid = new_solid

    def metrics(self, bias_field: List[float]) -> GridMetrics:
        energy = sum(self.plasma) / self.count if self.count else 0.0
        dispersion = 0.0
        for i in range(self.count):
            dispersion += abs(self.plasma[i] - self._neighbor_mean(i))
        dispersion /= self.count if self.count else 1
        bias_level = sum(abs(b) for b in bias_field) / self.count if self.count else 0.0
        return GridMetrics(energy=energy, dispersion=dispersion, bias=bias_level)
