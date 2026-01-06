"""CLI entry for the lens-gated echo runner."""
from __future__ import annotations

import argparse
import json
import random
from dataclasses import asdict
from typing import Dict, List

from .bias import BiasField
from .config import SimulationConfig, build_default_config, with_overrides
from .grid import GridMetrics, PhaseGrid
from .lens import LensOutput, mix_lenses
from .scenario import Scenario, build_scenario


def smooth(prev: Dict[str, float] | None, current: Dict[str, float], factor: float) -> Dict[str, float]:
    if prev is None:
        return current
    return {k: prev[k] * (1 - factor) + current[k] * factor for k in current}


def run_session(
    config: SimulationConfig | None = None,
    *,
    steps: int | None = None,
    seed: int | None = None,
    log_interval: int = 20,
    scenario_name: str = "default",
) -> List[Dict[str, float]]:
    cfg = config or build_default_config()
    if steps is not None:
        cfg = with_overrides(cfg, steps=steps)

    rng = random.Random(seed)
    bias = BiasField(cfg.grid_size, cfg.bias, rng)
    scenario = build_scenario(scenario_name, cfg.scenario_pulses, rng)

    core = PhaseGrid(cfg, rng)
    echo = PhaseGrid(cfg, rng)

    history: List[Dict[str, float]] = []
    smoothed: Dict[str, float] | None = None

    for step in range(cfg.steps):
        bias.decay()
        active = scenario.pulses_at(step)
        for jittered in bias.jittered_pulses(active):
            bias.apply_pulse(**jittered)

        core_metrics = core.metrics(bias.bias)
        echo_metrics = echo.metrics(bias.bias)
        echo_gap = core_metrics.energy - echo_metrics.energy

        lens: LensOutput = mix_lenses(
            {
                "energy": core_metrics.energy,
                "dispersion": core_metrics.dispersion,
                "bias": bias.mean_abs(),
                "echo_gap": echo_gap,
            },
            cfg.lens_weights,
        )

        core.perturb()
        echo.perturb()

        core.step(bias.bias, lens, coupling_adjust=cfg.coupling.echo_gain * echo_gap)
        echo.step(bias.bias, lens, coupling_adjust=-cfg.coupling.echo_gain * echo_gap)

        snapshot = {
            "energy": core_metrics.energy,
            "dispersion": core_metrics.dispersion,
            "bias": core_metrics.bias,
            "echo_energy": echo_metrics.energy,
            "echo_dispersion": echo_metrics.dispersion,
            "path_b_adjust": lens.path_b_adjust,
            "damping": lens.damping,
        }
        smoothed_metrics = smooth(smoothed, snapshot, cfg.smooth_factor)
        smoothed = {**smoothed_metrics, "step": step}
        history.append(smoothed)

        if log_interval and (step + 1) % log_interval == 0:
            print(
                f"step={step+1:03d} energy={smoothed['energy']:.3f} disp={smoothed['dispersion']:.3f} "
                f"bias={smoothed['bias']:.3f} echo={smoothed['echo_energy']:.3f} pathB={smoothed['path_b_adjust']:.3f} "
                f"damp={smoothed['damping']:.3f}"
            )

    print(json.dumps({"final": history[-1] if history else {}, "steps": cfg.steps}))
    return history


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Lens-gated echo runner")
    parser.add_argument("--steps", type=int, default=None, help="Number of steps to run")
    parser.add_argument("--grid-size", type=int, default=None, help="Grid size (edge length)")
    parser.add_argument("--seed", type=int, default=None, help="RNG seed for reproducibility")
    parser.add_argument("--log-interval", type=int, default=20, help="Log every N steps (0 to disable)")
    parser.add_argument("--scenario", type=str, default="default", help="Scenario preset: default|sparse|dense")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    cfg = build_default_config()
    if args.grid_size:
        cfg = with_overrides(cfg, grid_size=args.grid_size)
    run_session(cfg, steps=args.steps, seed=args.seed, log_interval=args.log_interval, scenario_name=args.scenario)


if __name__ == "__main__":
    main()
