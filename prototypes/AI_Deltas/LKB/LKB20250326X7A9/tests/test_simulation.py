from lkb_delta.config import SimulationConfig
from lkb_delta.simulation import run_session


def test_run_session_smoke():
    config = SimulationConfig(steps=10, seed=3)
    result = run_session(config)
    assert "steps" in result
    assert len(result["steps"]) == 10
    assert all(r.energy >= 0 for r in result["steps"])
    assert all(0 <= r.path_b_probability <= 1 for r in result["steps"])


def test_bias_injection_decay():
    from lkb_delta.bias import BiasField

    field = BiasField(size=6, bin_count=4, decay=0.5, strength=0.1, radius=1)
    left = [1.0, 0.0, 0.0, 0.0]
    right = [0.0, 0.0, 0.0, 1.0]
    field.inject_from_bins(left, right)
    initial_amp = field.amplitude
    field.decay_bias()
    assert field.amplitude < initial_amp
    assert initial_amp > 0


def test_forgiveness_triggers_on_dispersion():
    from lkb_delta.grid import PhaseGrid
    import random

    rng = random.Random(0)
    grid = PhaseGrid(
        size=4,
        flip_probability=0.0,
        parity_probability=0.0,
        alpha=0.1,
        forgiveness_threshold=0.05,
        forgiveness_strength=0.5,
        rng=rng,
    )
    # Force high dispersion by setting half the cells to 1 and half to 0.
    half = len(grid.plasma) // 2
    grid.plasma[:half] = [1.0 for _ in range(half)]
    grid.plasma[half:] = [0.0 for _ in range(len(grid.plasma) - half)]
    triggered, dispersion = grid.forgive_if_needed()
    assert triggered is True
    assert dispersion > 0.05
    assert max(grid.plasma) < 1.0
