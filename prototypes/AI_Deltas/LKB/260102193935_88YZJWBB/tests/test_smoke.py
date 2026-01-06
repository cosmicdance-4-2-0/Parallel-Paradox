from lkb_delta import DEFAULT_CONFIG, run_session


def test_session_runs_and_collects_records():
    result = run_session(DEFAULT_CONFIG)
    steps = result["steps"]

    assert len(steps) == DEFAULT_CONFIG.steps
    assert all(hasattr(step, "energy") for step in steps)
    assert all(step.energy >= 0 for step in steps)
    assert isinstance(steps[0].forgiveness_triggered, bool)
