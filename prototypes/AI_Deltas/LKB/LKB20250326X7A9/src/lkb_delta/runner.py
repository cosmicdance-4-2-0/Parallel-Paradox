from __future__ import annotations

import argparse
import json
from dataclasses import asdict

from .config import DEFAULT_CONFIG, SimulationConfig, DELTA_ID
from .simulation import run_session


def build_config(args: argparse.Namespace) -> SimulationConfig:
    cfg = DEFAULT_CONFIG
    return SimulationConfig(
        grid_size=args.grid_size,
        flip_probability=cfg.flip_probability,
        parity_probability=cfg.parity_probability,
        base_path_b=cfg.base_path_b,
        alpha=cfg.alpha,
        forgiveness_threshold=cfg.forgiveness_threshold,
        forgiveness_strength=cfg.forgiveness_strength,
        bias_decay=cfg.bias_decay,
        bias_strength=cfg.bias_strength,
        bias_radius=cfg.bias_radius,
        bin_count=cfg.bin_count,
        steps=args.steps,
        seed=args.seed,
        lens_weights=cfg.lens_weights,
        clamp_path_b=cfg.clamp_path_b,
        harmonic_clamp=cfg.harmonic_clamp,
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the LKB PhaseCube audio-biased delta session")
    parser.add_argument("--steps", type=int, default=DEFAULT_CONFIG.steps, help="Number of simulation steps")
    parser.add_argument("--grid-size", type=int, default=DEFAULT_CONFIG.grid_size, help="Grid dimension (n => n^3 agents)")
    parser.add_argument("--seed", type=int, default=DEFAULT_CONFIG.seed, help="Random seed for reproducibility")
    args = parser.parse_args()

    config = build_config(args)
    records = run_session(config)

    summary = {
        "delta_id": DELTA_ID,
        "steps": len(records["steps"]),
        "energy_avg": sum(r.energy for r in records["steps"]) / len(records["steps"]),
        "dispersion_avg": sum(r.dispersion for r in records["steps"]) / len(records["steps"]),
        "forgiveness_count": sum(1 for r in records["steps"] if r.forgiveness_triggered),
    }
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
