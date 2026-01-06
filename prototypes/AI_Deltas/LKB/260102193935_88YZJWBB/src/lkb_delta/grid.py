from __future__ import annotations

import math
import random
from typing import List, Tuple

from .config import SimulationConfig
from .lenses import LensOutput
from .utils import average, clamp, variance, wrap_index


class PhaseGrid:
    def __init__(self, config: SimulationConfig, rng: random.Random):
        self.size = config.grid_size
        self.count = self.size ** 3
        self.alpha = config.alpha
        self.flip_probability = config.flip_probability
        self.parity_probability = config.parity_probability
        self.forgiveness_threshold = config.forgiveness_threshold
        self.forgiveness_strength = config.forgiveness_strength
        self.path_b_span = config.path_b_span
        self.rng = rng

        self.plasma: List[float] = []
        self.liquid: List[float] = []
        self.solid: List[float] = []
        self.parity: List[int] = []
        for _ in range(self.count):
            self.plasma.append(rng.uniform(-0.25, 0.25))
            self.liquid.append(rng.uniform(0.0, 0.4))
            self.solid.append(rng.uniform(0.0, 0.3))
            self.parity.append(1 if rng.random() < 0.5 else 0)

    def _coords(self, index: int) -> Tuple[int, int, int]:
        s = self.size
        x = index % s
        y = (index // s) % s
        z = index // (s * s)
        return x, y, z

    def _index(self, x: int, y: int, z: int) -> int:
        s = self.size
        return wrap_index(x, s) + wrap_index(y, s) * s + wrap_index(z, s) * s * s

    def _neighbor_stats(self, index: int) -> Tuple[float, float]:
        x, y, z = self._coords(index)
        neighbors = [
            self.plasma[self._index(x + 1, y, z)],
            self.plasma[self._index(x - 1, y, z)],
            self.plasma[self._index(x, y + 1, z)],
            self.plasma[self._index(x, y - 1, z)],
            self.plasma[self._index(x, y, z + 1)],
            self.plasma[self._index(x, y, z - 1)],
        ]
        avg_neighbor = sum(neighbors) / len(neighbors)
        delta = (
            neighbors[0]
            - neighbors[1]
            + neighbors[2]
            - neighbors[3]
            + neighbors[4]
            - neighbors[5]
        ) / len(neighbors)
        return avg_neighbor, delta

    def perturb(self) -> None:
        for i in range(self.count):
            if self.rng.random() < self.flip_probability:
                self.plasma[i] *= -1
            if self.rng.random() < self.parity_probability:
                self.parity[i] ^= 1

    def step(self, bias_values: List[float], lens_output: LensOutput) -> bool:
        next_plasma: List[float] = [0.0 for _ in range(self.count)]
        next_liquid: List[float] = [0.0 for _ in range(self.count)]
        next_solid: List[float] = [0.0 for _ in range(self.count)]
        forgiveness_triggered = False

        for i in range(self.count):
            base_plasma = self.plasma[i]
            bias = bias_values[i] * lens_output.bias_gain if bias_values else 0.0
            effective_plasma = clamp(base_plasma + bias, -1.2, 1.2)

            avg_neighbor, delta_neighbor = self._neighbor_stats(i)
            path_a = (avg_neighbor - effective_plasma) * 0.5
            path_b = delta_neighbor * self.path_b_span
            mix = path_b if self.rng.random() < lens_output.path_b_probability else path_a

            jitter = (self.rng.random() - 0.5) * self.flip_probability * (1 if self.parity[i] else -1)
            new_plasma = clamp(effective_plasma + mix + jitter, -1.5, 1.5)
            new_liquid = (self.liquid[i] + new_plasma) * (1 - lens_output.damping) + avg_neighbor * lens_output.damping
            new_solid = self.solid[i] * (1 - self.alpha) + new_liquid * self.alpha

            local_energy = abs(new_plasma) + abs(new_liquid) + abs(self.solid[i])
            if local_energy > self.forgiveness_threshold:
                damp = 1 - self.forgiveness_strength
                new_plasma *= damp
                new_liquid *= damp
                new_solid *= damp
                forgiveness_triggered = True

            next_plasma[i] = new_plasma
            next_liquid[i] = new_liquid
            next_solid[i] = new_solid

        self.plasma = next_plasma
        self.liquid = next_liquid
        self.solid = next_solid
        return forgiveness_triggered

    def metrics(self) -> Tuple[float, float]:
        energy = average(abs(p) for p in self.plasma)
        dispersion = math.sqrt(variance(self.liquid))
        return energy, dispersion
