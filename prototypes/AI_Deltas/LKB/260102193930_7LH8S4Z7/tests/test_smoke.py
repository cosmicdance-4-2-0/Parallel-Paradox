import unittest

from src.run import run_session


class SmokeTests(unittest.TestCase):
    def test_session_runs_and_emits_metrics(self):
        history = run_session(steps=8, seed=42, log_interval=0)
        self.assertEqual(len(history), 8)
        final = history[-1]
        for key in ("energy", "dispersion", "bias", "echo_energy", "echo_dispersion"):
            self.assertIn(key, final)
            self.assertGreaterEqual(final[key], 0.0)
        self.assertLessEqual(final["energy"], 1.0)


if __name__ == "__main__":
    unittest.main()
