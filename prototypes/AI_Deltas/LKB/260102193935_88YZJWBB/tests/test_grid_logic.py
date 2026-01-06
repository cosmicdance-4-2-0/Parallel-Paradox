import random

from lkb_delta.bias import BiasField
from lkb_delta.config import BiasPulse, SimulationConfig
from lkb_delta.grid import PhaseGrid
from lkb_delta.lenses import LensMixer


def test_forgiveness_damps_high_energy():
    config = SimulationConfig(
        grid_size=5,
        steps=1,
        forgiveness_threshold=0.4,
        forgiveness_strength=0.6,
        path_b_span=0.3,
    )
    config.pulses = [BiasPulse(step=0, position=(2, 2, 2), strength=2.0, radius=1.2)]

    rng = random.Random(3)
    bias = BiasField(config)
    grid = PhaseGrid(config, rng)
    lens = LensMixer(config.lens_weights, config.path_b_base, config.path_b_span, config.harmonic_clamp)

    bias.apply_pulses(config.pulses, current_step=0)
    energy, dispersion = grid.metrics()
    lens_output = lens.mix(energy, dispersion, bias.amplitude())

    forgiveness_triggered = grid.step(bias.flatten(), lens_output)
    assert forgiveness_triggered
    assert max(abs(p) for p in grid.plasma) <= 1.5
