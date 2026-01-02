from __future__ import annotations

import random
from dataclasses import asdict, dataclass
from typing import Dict, List, Optional

from .bias import BiasField
from .config import DELTA_ID, DEFAULT_CONFIG, SimulationConfig
from .lenses import LensMixer
from .grid import PhaseGrid


@dataclass
class StepRecord:
    step: int
    energy: float
    dispersion: float
    bias_amplitude: float
    path_b_probability: float
    damping: float
    forgiveness_triggered: bool

    def to_dict(self) -> Dict[str, float | int | bool]:
        return asdict(self)


def run_session(config: Optional[SimulationConfig] = None, rng: Optional[random.Random] = None) -> Dict[str, List[StepRecord]]:
    cfg = (config or DEFAULT_CONFIG).with_defaults()
    rng = rng or random.Random(cfg.seed)

    bias_field = BiasField(cfg)
    grid = PhaseGrid(cfg, rng)
    lens_mixer = LensMixer(cfg.lens_weights, cfg.path_b_base, cfg.path_b_span, cfg.harmonic_clamp)

    records: List[StepRecord] = []
    for step in range(cfg.steps):
        bias_field.decay()
        bias_field.apply_pulses(cfg.pulses, step)

        grid.perturb()
        energy, dispersion = grid.metrics()
        lens_output = lens_mixer.mix(energy, dispersion, bias_field.amplitude())

        forgiveness_triggered = grid.step(bias_field.flatten(), lens_output)
        new_energy, new_dispersion = grid.metrics()

        records.append(
            StepRecord(
                step=step,
                energy=new_energy,
                dispersion=new_dispersion,
                bias_amplitude=bias_field.amplitude(),
                path_b_probability=lens_output.path_b_probability,
                damping=lens_output.damping,
                forgiveness_triggered=forgiveness_triggered,
            )
        )

    return {"delta_id": DELTA_ID, "steps": records}
