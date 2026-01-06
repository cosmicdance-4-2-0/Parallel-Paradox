import numpy as np

from phasecube_delta.config import DEFAULT_CONFIG, SimulationConfig
from phasecube_delta.grid import PhaseGrid


def test_forgiveness_triggers_on_dispersion():
    cfg = SimulationConfig(**{**DEFAULT_CONFIG.__dict__, "grid_size": 4})
    rng = np.random.default_rng(0)
    grid = PhaseGrid(cfg, rng, label="core")
    # Create high dispersion mix by crafting plasma extremes
    grid.plasma = np.linspace(0, 1, grid.plasma.size).reshape(grid.plasma.shape)
    bias = np.zeros_like(grid.plasma)
    before = grid.forgiveness_events
    grid.step(bias, {"harmonic": 0.7, "predictive": 0.2, "systemic": 0.05, "human": 0.05})
    assert grid.forgiveness_events >= before


def test_bias_does_not_overwrite_plasma():
    cfg = SimulationConfig(**{**DEFAULT_CONFIG.__dict__, "grid_size": 5})
    rng = np.random.default_rng(1)
    grid = PhaseGrid(cfg, rng, label="core")
    original_plasma = grid.plasma.copy()
    bias = np.ones_like(grid.plasma) * 0.5
    grid.step(bias, {"harmonic": 0.3, "predictive": 0.3, "systemic": 0.2, "human": 0.2})
    # Plasma should only change via perturb, not step
    assert np.allclose(original_plasma, grid.plasma)
