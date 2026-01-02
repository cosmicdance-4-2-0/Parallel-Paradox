"""PhaseGrid core dynamics (SV2/SV3/SV6/SV8)."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Tuple

import numpy as np

from .config import SimulationConfig
from . import lenses


@dataclass
class GridMetrics:
    energy: float
    divergence: float
    forgiveness_events: int
    mean_bias: float


class PhaseGrid:
    def __init__(self, config: SimulationConfig, rng: np.random.Generator, label: str) -> None:
        self.config = config
        self.rng = rng
        self.label = label
        size = (config.grid_size, config.grid_size, config.grid_size)
        self.plasma = self.rng.random(size) * 0.5
        self.liquid = self.rng.random(size) * 0.5
        self.solid = self.rng.random(size) * 0.5
        self.parity = self.rng.integers(0, 2, size, dtype=np.int8)
        self.forgiveness_events = 0

    def perturb(self) -> None:
        flips = self.rng.random(self.plasma.shape) < self.config.flip_probability
        parity_flips = self.rng.random(self.parity.shape) < self.config.parity_probability
        self.plasma = (self.plasma + flips.astype(float)) % 1.0
        self.parity = (self.parity + parity_flips.astype(np.int8)) % 2

    def neighbor_average(self, field: np.ndarray) -> np.ndarray:
        return (
            np.roll(field, 1, axis=0)
            + np.roll(field, -1, axis=0)
            + np.roll(field, 1, axis=1)
            + np.roll(field, -1, axis=1)
            + np.roll(field, 1, axis=2)
            + np.roll(field, -1, axis=2)
        ) / 6.0

    def step(
        self,
        bias_field: np.ndarray,
        lens_weights: Dict[str, float],
    ) -> GridMetrics:
        cfg = self.config
        # Adjust tunables via lens fusion
        path_p = lenses.fuse_path_probability(cfg.path_b_probability, lens_weights)
        forgiveness_threshold = lenses.fuse_forgiveness_threshold(
            cfg.forgiveness_threshold, lens_weights
        )
        bias_gain = lenses.fuse_bias_gain(cfg.bias_strength, lens_weights)

        # Precompute neighbor averages for plasma and liquid to keep toroidal symmetry
        neighbor_mean = self.neighbor_average(self.plasma)
        path_a = (self.plasma + self.liquid + self.solid) / 3.0
        path_b = np.abs(self.plasma - neighbor_mean) + (self.parity * 0.13)

        branch = self.rng.random(self.plasma.shape) < path_p
        mix = np.where(branch, path_b, path_a)

        # Influence-only bias; never overwrites internal state (SV2)
        if bias_field.size > 0:
            mix += bias_field * bias_gain

        dispersion = float(np.std(mix))
        forgiveness = cfg.forgiveness_strength if dispersion > forgiveness_threshold else 1.0
        if forgiveness < 1.0:
            self.forgiveness_events += 1
        damped_mix = mix * forgiveness

        # Update phases
        self.liquid = damped_mix % 1.0
        self.solid = (self.solid * (1.0 - cfg.alpha) + damped_mix * cfg.alpha) % 1.0
        # TODO: add explicit plasticity rewiring hook; parity/flip noise is the current minimal stand-in to keep locality simple.
        # Plasma only drifts via perturbation; do not overwrite here

        energy = float(np.mean(self.plasma + self.liquid) / 2.0)
        divergence = float(dispersion)
        mean_bias = float(np.mean(bias_field)) if bias_field.size else 0.0

        return GridMetrics(energy=energy, divergence=divergence, forgiveness_events=self.forgiveness_events, mean_bias=mean_bias)
