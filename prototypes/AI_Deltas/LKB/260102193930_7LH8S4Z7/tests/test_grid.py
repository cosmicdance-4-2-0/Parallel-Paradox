import random
import unittest

from src.config import ForgivenessConfig, SimulationConfig
from src.grid import PhaseGrid
from src.lens import LensOutput


class GridTests(unittest.TestCase):
    def test_forgiveness_factor_scales_dispersion(self):
        cfg = SimulationConfig(grid_size=4, forgiveness=ForgivenessConfig(threshold=0.1, damp=0.8))
        grid = PhaseGrid(cfg, rng=random.Random(2))
        high_dispersion_factor = grid._forgiveness_factor(0.8)
        near_zero_factor = grid._forgiveness_factor(0.05)
        self.assertLess(high_dispersion_factor, near_zero_factor)
        self.assertGreater(high_dispersion_factor, 0.0)

    def test_step_keeps_values_bounded(self):
        cfg = SimulationConfig(grid_size=3, path_b_base=0.9, path_b_max=0.95)
        grid = PhaseGrid(cfg, rng=random.Random(3))
        bias = [0.3 for _ in range(cfg.grid_size ** 3)]
        lens = LensOutput(path_b_adjust=0.5, damping=0.2, bias_gain=1.0)
        grid.step(bias, lens, coupling_adjust=0.1)
        for collection in (grid.plasma, grid.liquid, grid.solid):
            for value in collection:
                self.assertGreaterEqual(value, 0.0)
                self.assertLessEqual(value, 1.0)


if __name__ == "__main__":
    unittest.main()
