"""Entry point for LKBDLT20250118A PhaseCube-inspired simulator."""
from __future__ import annotations

import argparse
import json

from config import SimulationConfig
from simulation import PhaseSimulation


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run PhaseCube delta simulation (LKBDLT20250118A).")
    parser.add_argument("--steps", type=int, default=None, help="Number of steps to run (default from config).")
    parser.add_argument("--grid-size", type=int, default=None, help="Override grid size (default from config).")
    parser.add_argument("--seed", type=int, default=None, help="Random seed for reproducibility.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    cfg = SimulationConfig()
    if args.grid_size:
        cfg.grid_size = args.grid_size
    if args.seed is not None:
        cfg.random_seed = args.seed
    sim = PhaseSimulation(cfg)
    report = sim.run(steps=args.steps)
    print(
        json.dumps(
            {
                "delta_id": "LKBDLT20250118A",
                "steps": report.steps,
                "grid_size": cfg.grid_size,
                "final_dispersion": round(report.final_dispersion, 4),
                "forgiveness_events": report.forgiveness_events,
                "lens_blend": report.lens_blend,
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
