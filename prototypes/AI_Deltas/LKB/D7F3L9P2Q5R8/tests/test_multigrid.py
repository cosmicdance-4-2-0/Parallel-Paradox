from phasecube_delta.config import DEFAULT_CONFIG, SimulationConfig
from phasecube_delta.multigrid import MultiGridSwarm


def test_multigrid_runs_and_reports():
    cfg = SimulationConfig(**{**DEFAULT_CONFIG.__dict__, "grid_size": 6})
    swarm = MultiGridSwarm(cfg, seed=2)
    summary = swarm.run(steps=5, base_bias_mag=0.04)
    assert summary["steps"] == 5
    assert summary["core_energy"] > 0
    assert summary["core_divergence"] >= 0
