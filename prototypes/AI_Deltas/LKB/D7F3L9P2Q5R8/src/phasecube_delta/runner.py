"""CLI-friendly runner for the tri-grid swarm (SV1/SV2/SV7)."""
from __future__ import annotations

import argparse
import json
from dataclasses import asdict
from typing import Any, Dict

from .config import DEFAULT_CONFIG, SimulationConfig
from .multigrid import MultiGridSwarm


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the D7F3L9P2Q5R8 tri-grid swarm")
    parser.add_argument("--steps", type=int, default=120, help="Simulation steps to run")
    parser.add_argument("--seed", type=int, default=7, help="Random seed for reproducibility")
    parser.add_argument("--grid-size", type=int, default=DEFAULT_CONFIG.grid_size, help="Grid dimension (n => n^3 agents)")
    parser.add_argument("--bias", type=float, default=0.05, help="Base bias magnitude")
    return parser.parse_args(argv)


def build_config(args: argparse.Namespace) -> SimulationConfig:
    cfg = DEFAULT_CONFIG
    cfg = SimulationConfig(
        grid_size=args.grid_size,
        flip_probability=cfg.flip_probability,
        parity_probability=cfg.parity_probability,
        path_b_probability=cfg.path_b_probability,
        alpha=cfg.alpha,
        bias_strength=cfg.bias_strength,
        bias_decay=cfg.bias_decay,
        delay_length=cfg.delay_length,
        delay_decay=cfg.delay_decay,
        coupling_echo_to_core=cfg.coupling_echo_to_core,
        coupling_memory_to_core=cfg.coupling_memory_to_core,
        plasticity_probability=cfg.plasticity_probability,
        forgiveness_threshold=cfg.forgiveness_threshold,
        forgiveness_strength=cfg.forgiveness_strength,
        max_steps=args.steps,
        lens_schedule=cfg.lens_schedule,
    )
    return cfg


def run_simulation(cfg: SimulationConfig, steps: int, bias: float, seed: int) -> Dict[str, Any]:
    swarm = MultiGridSwarm(cfg, seed=seed)
    summary = swarm.run(steps=steps, base_bias_mag=bias)
    summary.update({"grid_size": cfg.grid_size, "seed": seed, "bias": bias})
    return summary


def main(argv: list[str] | None = None) -> None:
    args = parse_args(argv)
    cfg = build_config(args)
    summary = run_simulation(cfg, steps=args.steps, bias=args.bias, seed=args.seed)
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
