import json

from phasecube_delta.runner import build_config, run_simulation


def test_smoke_run_produces_summary():
    cfg = build_config(type("Args", (), {"grid_size": 10, "steps": 6})())
    summary = run_simulation(cfg, steps=4, bias=0.03, seed=3)
    assert summary["steps"] == 4
    for key in ["core_energy", "echo_energy", "memory_energy", "core_divergence"]:
        assert key in summary
        assert isinstance(summary[key], float)
    assert summary["core_forgiveness_events"] >= 0
    # JSON serialization sanity
    json.dumps(summary)
