"""Tri-grid orchestration with bias/delay feedback (SV6/SV7)."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict

import numpy as np

from .bias import DelayLine, make_bias_field
from .config import SimulationConfig
from .grid import PhaseGrid, GridMetrics
from .lenses import LensScheduler


@dataclass
class SwarmSnapshot:
    step: int
    lens: Dict[str, float]
    core: GridMetrics
    echo: GridMetrics
    memory: GridMetrics


class MultiGridSwarm:
    def __init__(self, config: SimulationConfig, seed: int = 0) -> None:
        self.config = config
        self.rng = np.random.default_rng(seed)
        self.core = PhaseGrid(config, self.rng, label="core")
        self.echo = PhaseGrid(config, self.rng, label="echo")
        self.memory = PhaseGrid(config, self.rng, label="memory")
        self.delay = DelayLine(length=config.delay_length, decay=config.delay_decay)
        self.scheduler = LensScheduler(config.lens_schedule)

    def step(self, step_idx: int, base_bias_mag: float) -> SwarmSnapshot:
        lens_weights = self.scheduler.active_weights(step_idx)

        # Influence-only bias fields
        base_bias = make_bias_field(self.config.grid_size, self.rng, base_bias_mag)
        self.delay.push(base_bias)
        delayed = self.delay.replay()

        # Cross-talk: echo/memory feed soft bias into core
        echo_bias = self.echo.liquid * self.config.coupling_echo_to_core
        memory_bias = self.memory.solid * self.config.coupling_memory_to_core

        core_bias = base_bias + delayed + echo_bias + memory_bias
        echo_self_bias = base_bias * 0.5 + self.core.liquid * 0.08
        memory_self_bias = delayed * 0.7 + base_bias * 0.3

        # Perturb before stepping to maintain non-collapse (SV2)
        self.core.perturb()
        self.echo.perturb()
        self.memory.perturb()

        core_metrics = self.core.step(core_bias, lens_weights)
        echo_metrics = self.echo.step(echo_self_bias, lens_weights)
        memory_metrics = self.memory.step(memory_self_bias, lens_weights)
        # TODO: add audio/file-fed bias injection once I/O is reintroduced; kept headless per scope.

        return SwarmSnapshot(
            step=step_idx,
            lens=lens_weights,
            core=core_metrics,
            echo=echo_metrics,
            memory=memory_metrics,
        )

    def run(self, steps: int, base_bias_mag: float) -> Dict[str, float]:
        snapshots = []
        for i in range(steps):
            snapshots.append(self.step(i, base_bias_mag))

        return self._summarize(snapshots)

    def _summarize(self, snapshots) -> Dict[str, float]:
        core_energy = np.mean([s.core.energy for s in snapshots]) if snapshots else 0.0
        echo_energy = np.mean([s.echo.energy for s in snapshots]) if snapshots else 0.0
        memory_energy = np.mean([s.memory.energy for s in snapshots]) if snapshots else 0.0
        core_div = np.mean([s.core.divergence for s in snapshots]) if snapshots else 0.0
        forgiveness_events = snapshots[-1].core.forgiveness_events if snapshots else 0
        return {
            "core_energy": float(core_energy),
            "echo_energy": float(echo_energy),
            "memory_energy": float(memory_energy),
            "core_divergence": float(core_div),
            "core_forgiveness_events": int(forgiveness_events),
            "steps": len(snapshots),
        }
