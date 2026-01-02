from __future__ import annotations

import random
from dataclasses import dataclass
from typing import Dict, List

from .bias import BiasField
from .config import DEFAULT_CONFIG, SimulationConfig
from .grid import PhaseGrid
from .lenses import LensMixer


@dataclass
class StepRecord:
    step: int
    energy: float
    dispersion: float
    path_b_probability: float
    damping: float
    bias_amplitude: float
    forgiveness_triggered: bool


def run_session(config: SimulationConfig = DEFAULT_CONFIG) -> Dict[str, List[StepRecord]]:
    rng = random.Random(config.seed)
    bias_field = BiasField(
        size=config.grid_size,
        bin_count=config.bin_count,
        decay=config.bias_decay,
        strength=config.bias_strength,
        radius=config.bias_radius,
    )
    grid = PhaseGrid(
        size=config.grid_size,
        flip_probability=config.flip_probability,
        parity_probability=config.parity_probability,
        alpha=config.alpha,
        forgiveness_threshold=config.forgiveness_threshold,
        forgiveness_strength=config.forgiveness_strength,
        rng=rng,
    )
    lenses = LensMixer(config.lens_weights, config.clamp_path_b, config.harmonic_clamp)

    records: List[StepRecord] = []
    for step in range(config.steps):
        # Simulated stereo spectrum seeded from RNG; stands in for mic/file input (per SV3/SV9 inference).
        # TODO: Bridge real mic/file ingestion to replace RNG bins while keeping bias influence-only.
        left_bins = [rng.gauss(0.0, 1.0) for _ in range(config.bin_count)]
        right_bins = [rng.gauss(0.0, 1.0) for _ in range(config.bin_count)]

        bias_field.decay_bias()
        bias_field.inject_from_bins(left_bins, right_bins)
        metrics = grid.metrics()
        lens_output = lenses.mix(metrics.energy, metrics.dispersion, bias_field.amplitude)

        flat_bias = bias_field.flatten()
        grid.perturb(flat_bias)
        grid.apply_bias(flat_bias, lens_output.bias_gain)
        grid.step(lens_output.path_b_probability, lens_output.damping)
        forgiveness_triggered, _ = grid.forgive_if_needed()

        new_metrics = grid.metrics()
        records.append(
            StepRecord(
                step=step,
                energy=new_metrics.energy,
                dispersion=new_metrics.dispersion,
                path_b_probability=lens_output.path_b_probability,
                damping=lens_output.damping,
                bias_amplitude=bias_field.amplitude,
                forgiveness_triggered=forgiveness_triggered,
            )
        )

    return {"steps": records}
