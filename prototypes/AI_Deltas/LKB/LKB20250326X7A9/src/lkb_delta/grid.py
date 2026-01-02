from __future__ import annotations

import math
import random
from dataclasses import dataclass
from typing import List, Tuple


@dataclass
class GridMetrics:
    energy: float
    dispersion: float


class PhaseGrid:
    def __init__(
        self,
        size: int,
        flip_probability: float,
        parity_probability: float,
        alpha: float,
        forgiveness_threshold: float,
        forgiveness_strength: float,
        rng: random.Random,
    ) -> None:
        self.size = size
        self.flip_probability = flip_probability
        self.parity_probability = parity_probability
        self.alpha = alpha
        self.forgiveness_threshold = forgiveness_threshold
        self.forgiveness_strength = forgiveness_strength
        self.rng = rng

        n = size ** 3
        self.plasma: List[float] = [rng.random() for _ in range(n)]
        self.liquid: List[float] = [rng.random() for _ in range(n)]
        self.solid: List[float] = [rng.random() for _ in range(n)]
        self.parity: List[int] = [rng.choice([0, 1]) for _ in range(n)]

    def _coords(self, idx: int) -> Tuple[int, int, int]:
        s2 = self.size * self.size
        z = idx // s2
        y = (idx % s2) // self.size
        x = idx % self.size
        return x, y, z

    def _index(self, x: int, y: int, z: int) -> int:
        s = self.size
        return (x % s) + (y % s) * s + (z % s) * s * s

    def _neighbor_avg(self, field: List[float]) -> List[float]:
        result = []
        for idx, _ in enumerate(field):
            x, y, z = self._coords(idx)
            total = (
                field[self._index(x + 1, y, z)] +
                field[self._index(x - 1, y, z)] +
                field[self._index(x, y + 1, z)] +
                field[self._index(x, y - 1, z)] +
                field[self._index(x, y, z + 1)] +
                field[self._index(x, y, z - 1)]
            )
            result.append(total / 6.0)
        return result

    def metrics(self) -> GridMetrics:
        n = len(self.plasma)
        energy = sum(self.plasma) / n
        variance = sum((v - energy) ** 2 for v in self.plasma) / n
        dispersion = math.sqrt(variance)
        return GridMetrics(energy=energy, dispersion=dispersion)

    def apply_bias(self, bias: List[float], gain: float) -> None:
        if gain <= 0:
            return
        for i, b in enumerate(bias):
            self.plasma[i] = min(max(self.plasma[i] + b * gain, 0.0), 1.0)

    def perturb(self, bias_flat: List[float] | None = None) -> None:
        for i in range(len(self.plasma)):
            if self.rng.random() < self.flip_probability:
                self.plasma[i] = 1.0 - self.plasma[i]
            if self.rng.random() < self.parity_probability:
                self.parity[i] ^= 1

            if bias_flat is not None:
                scaled = max(min(bias_flat[i] * 0.01, 0.1), -0.1)
                self.plasma[i] = min(max(self.plasma[i] + scaled, 0.0), 1.0)
                self.liquid[i] = min(max(self.liquid[i] + scaled * 0.5, 0.0), 1.0)

    def step(self, path_b_probability: float, damping: float) -> None:
        neighbor_avg = self._neighbor_avg(self.plasma)
        new_plasma: List[float] = []
        new_liquid: List[float] = []
        new_solid: List[float] = []

        for i, plasma_val in enumerate(self.plasma):
            center_average = (plasma_val + self.liquid[i] + self.solid[i]) / 3.0
            parity_bonus = self.parity[i] * 0.12
            exploration = abs(plasma_val - neighbor_avg[i]) + parity_bonus
            chooser = self.rng.random() < path_b_probability
            mix = exploration if chooser else center_average
            mix *= 1.0 - damping

            new_liquid.append(mix)
            new_solid.append(self.solid[i] * (1 - self.alpha) + mix * self.alpha)
            new_plasma.append(mix)

        self.plasma, self.liquid, self.solid = new_plasma, new_liquid, new_solid

    def forgive_if_needed(self) -> Tuple[bool, float]:
        metrics = self.metrics()
        if metrics.dispersion <= self.forgiveness_threshold:
            return False, metrics.dispersion
        scale = 1.0 - self.forgiveness_strength
        self.plasma = [v * scale for v in self.plasma]
        self.liquid = [v * (1.0 - self.forgiveness_strength * 0.5) for v in self.liquid]
        return True, metrics.dispersion
