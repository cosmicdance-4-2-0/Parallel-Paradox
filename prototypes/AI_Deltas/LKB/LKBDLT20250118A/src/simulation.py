"""Simulation orchestrator hooking grid, lenses, and bias."""
from __future__ import annotations

import random
import statistics
from dataclasses import dataclass

from bias import BiasField
from config import SimulationConfig
from grid import PhaseGrid
from lenses import LensBlend


@dataclass
class SimulationReport:
    steps: int
    final_dispersion: float
    forgiveness_events: int
    lens_blend: dict[str, float]


class PhaseSimulation:
    def __init__(self, cfg: SimulationConfig):
        self.cfg = cfg
        self.rng = random.Random(cfg.random_seed)
        self.grid = PhaseGrid(cfg, self.rng)
        count = cfg.grid_size**3
        self.bias_field = BiasField(count, cfg.input_gain, cfg.max_bias, self.rng)
        self.lens_blend = LensBlend()
        self.events: list[str] = []

    def inject_bias_pulse(self, strength: float) -> None:
        self.bias_field.inject_random(strength)

    def run(self, steps: int | None = None) -> SimulationReport:
        steps = steps or self.cfg.steps
        for step in range(steps):
            if step % 10 == 0:
                self.inject_bias_pulse(strength=0.08)
            self.grid.step(self.lens_blend, self.bias_field, self.events)
        dispersion = float(statistics.pstdev(self.grid.plasma))
        forgiveness_events = sum(1 for e in self.events if e.startswith("forgiveness"))
        return SimulationReport(
            steps=steps,
            final_dispersion=dispersion,
            forgiveness_events=forgiveness_events,
            lens_blend=self.lens_blend.as_dict(),
        )
