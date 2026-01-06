from __future__ import annotations

import math
from typing import Iterable, List

from .config import BiasPulse, SimulationConfig
from .utils import clamp, wrap_index


class BiasField:
    def __init__(self, config: SimulationConfig):
        self.size = config.grid_size
        self.count = config.grid_size ** 3
        self.decay_rate = config.bias_decay
        self.strength = config.bias_strength
        self.default_radius = config.bias_radius
        self.values: List[float] = [0.0 for _ in range(self.count)]

    def _index(self, x: int, y: int, z: int) -> int:
        s = self.size
        return wrap_index(x, s) + wrap_index(y, s) * s + wrap_index(z, s) * s * s

    def decay(self) -> None:
        for i, v in enumerate(self.values):
            self.values[i] = v * self.decay_rate

    def apply_pulse(self, pulse: BiasPulse, strength_scale: float = 1.0) -> None:
        px, py, pz = pulse.position
        radius = max(0.5, pulse.radius or self.default_radius)
        max_dist = math.ceil(radius)
        radius_sq = radius * radius
        for dx in range(-max_dist, max_dist + 1):
            for dy in range(-max_dist, max_dist + 1):
                for dz in range(-max_dist, max_dist + 1):
                    dist_sq = dx * dx + dy * dy + dz * dz
                    if dist_sq > radius_sq:
                        continue
                    kernel = math.exp(-dist_sq / (radius_sq * 0.6))
                    idx = self._index(px + dx, py + dy, pz + dz)
                    delta = pulse.strength * self.strength * kernel * strength_scale
                    self.values[idx] = clamp(self.values[idx] + delta, -0.8, 0.8)

    def apply_pulses(self, pulses: Iterable[BiasPulse], current_step: int) -> None:
        for pulse in pulses:
            if pulse.step == current_step:
                self.apply_pulse(pulse)

    def amplitude(self) -> float:
        return max(abs(v) for v in self.values) if self.values else 0.0

    def flatten(self) -> List[float]:
        return list(self.values)
