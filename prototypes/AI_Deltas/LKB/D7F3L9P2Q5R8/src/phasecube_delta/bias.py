"""Bias field and delay-line utilities.

Implements influence-only fields (SV2) plus delay-fed replay (SV6/SV7)
without overwriting grid state.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import List

import numpy as np


@dataclass
class DelayLine:
    length: int
    decay: float

    def __post_init__(self) -> None:
        self.frames: List[np.ndarray] = []

    def push(self, frame: np.ndarray) -> None:
        """Store a bias frame, trimming to bounded length."""
        self.frames.append(np.array(frame, copy=True))
        if len(self.frames) > self.length:
            self.frames.pop(0)

    def replay(self) -> np.ndarray:
        """Blend stored frames with exponential decay."""
        if not self.frames:
            return np.array([])
        acc = np.zeros_like(self.frames[-1])
        for i, frame in enumerate(reversed(self.frames)):
            acc += frame * (self.decay ** i)
        return acc


def make_bias_field(grid_size: int, rng: np.random.Generator, magnitude: float) -> np.ndarray:
    """Create a decaying bias field seeded from stochastic noise (SV2/SV5)."""
    base = rng.normal(loc=0.0, scale=magnitude, size=(grid_size, grid_size, grid_size))
    return base
