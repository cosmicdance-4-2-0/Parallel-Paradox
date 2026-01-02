import json
import math
import os
import sys
from copy import deepcopy

import pytest

# Ensure local src is importable when running from repo root.
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src"))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from phasecube_delta import LatticeSimulator, SimulationConfig  # noqa: E402


def test_neighbor_wrapping_handles_edges():
    config = SimulationConfig(grid=3, seed=1)
    sim = LatticeSimulator(config)
    origin = sim._index(0, 0, 0)
    neighbors = list(sim._neighbors(origin))
    assert len(neighbors) == 6
    assert sim._index(-1, 0, 0) in neighbors
    assert sim._index(0, 0, -1) in neighbors
    assert sim._index(0, -1, 0) in neighbors


def test_simulation_is_deterministic_with_seed():
    cfg = SimulationConfig(grid=4, seed=42)
    sim_a = LatticeSimulator(cfg)
    sim_b = LatticeSimulator(deepcopy(cfg))

    sim_a.perturb(); sim_a.step(5)
    sim_b.perturb(); sim_b.step(5)

    assert sim_a.summary() == sim_b.summary()


def test_forgiveness_dampens_difference_bias():
    cfg = SimulationConfig(grid=3, forgiveness_threshold=0.05, seed=7)
    sim = LatticeSimulator(cfg)
    # Force extreme dispersion to trigger forgiveness.
    sim.state.plasma = [0.0 if i % 2 == 0 else 1.0 for i in range(sim.count)]
    pre_dispersion = sim._dispersion()
    assert pre_dispersion > cfg.forgiveness_threshold

    baseline_path_b = cfg.path_b_p
    effective = sim._effective_path_b(pre_dispersion, cfg.lens_weights)
    assert effective < baseline_path_b  # harmonic damping reduces bias

    sim.step(1)
    assert sim.forgiveness_events  # forgiveness recorded when threshold crossed
