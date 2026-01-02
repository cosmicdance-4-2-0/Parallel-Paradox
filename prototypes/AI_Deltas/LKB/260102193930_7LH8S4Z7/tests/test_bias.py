import random
import unittest

from src.bias import BiasField
from src.config import BiasConfig


class BiasFieldTests(unittest.TestCase):
    def test_pulse_and_decay(self):
        cfg = BiasConfig(decay=0.5, strength=0.2, radius=2, pulse_jitter=0.0)
        field = BiasField(size=6, config=cfg, rng=random.Random(1))

        field.apply_pulse(band=0.5, strength=0.6, pan=0.0)
        initial = field.mean_abs()
        self.assertGreater(initial, 0.0, "Pulse should inject bias energy")

        field.decay()
        decayed = field.mean_abs()
        self.assertLess(decayed, initial, "Decay should reduce accumulated bias")


if __name__ == "__main__":
    unittest.main()
