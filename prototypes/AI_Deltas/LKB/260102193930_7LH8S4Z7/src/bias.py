"""Bias field management for decaying influence-only pulses."""
from __future__ import annotations

import math
import random
from typing import Iterable, List

from .config import BiasConfig


class BiasField:
    """Maintains a decaying bias lattice used to influence Path B choices."""

    def __init__(self, size: int, config: BiasConfig, rng: random.Random | None = None):
        self.size = size
        self.config = config
        self.rng = rng or random.Random()
        self.count = size ** 3
        self.bias: List[float] = [0.0 for _ in range(self.count)]

    def index(self, x: int, y: int, z: int) -> int:
        s = self.size
        return (x % s) + (y % s) * s + (z % s) * s * s

    def decay(self) -> None:
        for i, value in enumerate(self.bias):
            self.bias[i] = value * self.config.decay

    def apply_pulse(self, band: float, strength: float, pan: float = 0.0, radius: int | None = None) -> None:
        """Apply a radial pulse at a depth determined by band and lateral pan.

        - ``band`` in [0, 1] maps to depth (low → deep, high → surface).
        - ``pan`` in [-1, 1] shifts the x-axis center.
        - ``strength`` scales the contribution before kernel decay.
        """
        size = self.size
        r = max(1, radius or self.config.radius)
        center_z = int(max(0, min(size - 1, band * (size - 1))))
        center_x = int((size - 1) / 2 + pan * (size * 0.35))
        center_y = size // 2

        for dz in range(-r, r + 1):
            for dy in range(-r, r + 1):
                for dx in range(-r, r + 1):
                    norm = (dx * dx + dy * dy + dz * dz) / float(r * r)
                    if norm > 1:
                        continue
                    kernel = math.exp(-2.6 * norm)
                    idx = self.index(center_x + dx, center_y + dy, center_z + dz)
                    self.bias[idx] += strength * self.config.strength * kernel
                    self.bias[idx] = max(-0.4, min(0.4, self.bias[idx]))

    def jittered_pulses(self, pulses: Iterable) -> Iterable:
        """Yield pulses with small jitter for variety."""
        for pulse in pulses:
            jitter = self.config.pulse_jitter
            band = max(0.0, min(1.0, pulse.band + self.rng.uniform(-jitter, jitter)))
            pan = max(-1.0, min(1.0, pulse.pan + self.rng.uniform(-jitter, jitter)))
            strength = max(0.0, pulse.strength + self.rng.uniform(-jitter * 0.5, jitter * 0.5))
            radius = pulse.radius
            yield {
                "band": band,
                "pan": pan,
                "strength": strength,
                "radius": radius,
            }

    def mean_abs(self) -> float:
        return sum(abs(v) for v in self.bias) / self.count if self.count else 0.0

    def snapshot(self) -> List[float]:
        return list(self.bias)
