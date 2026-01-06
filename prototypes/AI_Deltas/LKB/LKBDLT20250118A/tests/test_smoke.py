import pathlib
import sys

SRC = pathlib.Path(__file__).resolve().parents[1] / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from config import SimulationConfig  # noqa: E402
from simulation import PhaseSimulation  # noqa: E402


def test_simulation_runs():
    cfg = SimulationConfig(grid_size=4, steps=8, random_seed=42)
    sim = PhaseSimulation(cfg)
    report = sim.run()
    assert report.steps == 8
    assert 0 <= report.final_dispersion < 1.0
    assert isinstance(report.forgiveness_events, int)
