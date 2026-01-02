"""Echo bias bus and external influence mapping (SV7/SV8)."""
from __future__ import annotations

import random
from typing import List

from config import clamp


class BiasField:
    def __init__(self, size: int, input_gain: float, max_bias: float, rng: random.Random):
        self.field: List[float] = [0.0 for _ in range(size)]
        self.input_gain = input_gain
        self.max_bias = max_bias
        self.rng = rng

    def inject_random(self, intensity: float, count: int = 6) -> None:
        """Inject short-term external bias at random indices (influence, not overwrite)."""
        count = max(1, count)
        indices = self.rng.sample(range(len(self.field)), k=min(count, len(self.field)))
        delta = clamp(intensity, 0.0, self.max_bias)
        for idx in indices:
            self.field[idx] = clamp(self.field[idx] + delta, 0.0, self.max_bias)

    def echo_from(self, liquid: list[float], weight: float, decay: float) -> None:
        """Reinforce field from recent liquid activity (echo memory)."""
        weight = clamp(weight)
        decay = clamp(decay)
        for i, value in enumerate(liquid):
            self.field[i] = clamp(self.field[i] * (1.0 - decay) + min(value * weight, self.max_bias), 0.0, self.max_bias)

    def pull(self, idx: int) -> float:
        return clamp(self.field[idx] * self.input_gain, -self.max_bias, self.max_bias)
