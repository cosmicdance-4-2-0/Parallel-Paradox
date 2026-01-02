"""CLI runner for the PhaseCube-derived lattice simulator."""
from __future__ import annotations

import argparse
import json
import os
import sys
from typing import Any, Dict

from .config import SimulationConfig
from .simulation import LatticeSimulator


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run PhaseCube-inspired lattice steps.")
    parser.add_argument("--grid", type=int, default=10, help="Grid dimension (n -> n^3 cells).")
    parser.add_argument("--steps", type=int, default=50, help="Number of update steps to run.")
    parser.add_argument("--seed", type=int, default=7, help="Random seed for reproducibility.")
    parser.add_argument("--flip-p", type=float, default=0.02, help="Plasma flip probability.")
    parser.add_argument("--parity-p", type=float, default=0.01, help="Parity flip probability.")
    parser.add_argument("--path-b-p", type=float, default=0.65, help="Path B (difference) probability baseline.")
    parser.add_argument("--alpha", type=float, default=0.18, help="Solid blending factor.")
    parser.add_argument(
        "--forgiveness-threshold",
        type=float,
        default=0.22,
        help="Dispersion threshold that triggers forgiveness damping.",
    )
    parser.add_argument(
        "--forgiveness-blend",
        type=float,
        default=0.55,
        help="Blend ratio when forgiveness is active (lower tightens stabilization).",
    )
    return parser.parse_args(argv)


def run(argv: list[str] | None = None) -> Dict[str, Any]:
    args = parse_args(argv)
    config = SimulationConfig(
        grid=args.grid,
        flip_p=args.flip_p,
        parity_p=args.parity_p,
        path_b_p=args.path_b_p,
        alpha=args.alpha,
        forgiveness_threshold=args.forgiveness_threshold,
        forgiveness_blend=args.forgiveness_blend,
        seed=args.seed,
    )
    simulator = LatticeSimulator(config)
    simulator.perturb()
    simulator.step(args.steps)
    summary = simulator.summary()
    return summary


def main(argv: list[str] | None = None) -> None:
    summary = run(argv)
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    sys.exit(main())
