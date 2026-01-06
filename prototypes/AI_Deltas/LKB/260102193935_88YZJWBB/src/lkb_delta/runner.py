from __future__ import annotations

import argparse
import json
from statistics import mean
from typing import Any, Dict

from .config import DELTA_ID, SimulationConfig
from .simulation import run_session


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Run the deterministic bias-pulse lens runner.")
    defaults = SimulationConfig()
    parser.add_argument("--steps", type=int, default=defaults.steps, help="Number of simulation steps (default: 40)")
    parser.add_argument("--grid-size", type=int, default=defaults.grid_size, help="Grid dimension for the lattice")
    parser.add_argument("--seed", type=int, default=defaults.seed, help="Seed for deterministic runs")
    return parser


def summarize(result: Dict[str, Any]) -> Dict[str, Any]:
    steps = result["steps"]
    avg_energy = mean(s.energy for s in steps) if steps else 0.0
    avg_dispersion = mean(s.dispersion for s in steps) if steps else 0.0
    forgiveness_hits = sum(1 for s in steps if s.forgiveness_triggered)
    return {
        "delta_id": DELTA_ID,
        "steps": len(steps),
        "avg_energy": avg_energy,
        "avg_dispersion": avg_dispersion,
        "forgiveness_events": forgiveness_hits,
        "last_bias_amplitude": steps[-1].bias_amplitude if steps else 0.0,
    }


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()

    config = SimulationConfig(steps=args.steps, grid_size=args.grid_size, seed=args.seed).with_defaults()
    result = run_session(config)
    summary = summarize(result)
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
