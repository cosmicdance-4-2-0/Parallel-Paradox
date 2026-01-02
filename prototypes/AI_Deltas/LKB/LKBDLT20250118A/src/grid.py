"""Phase grid dynamics with kenotic forgiveness and parity asymmetry."""
from __future__ import annotations

import random
import statistics
from typing import List

from config import SimulationConfig, clamp
from lenses import LensBlend


def forgiveness_factor(dispersion: float, threshold: float, floor: float) -> float:
    """Return damping factor; below threshold returns 1, otherwise scaled toward floor."""
    if dispersion <= threshold:
        return 1.0
    scale = (dispersion - threshold) / max(threshold, 1e-6)
    return max(floor, 1.0 - min(scale, 1.0) * (1.0 - floor))


class PhaseGrid:
    def __init__(self, cfg: SimulationConfig, rng: random.Random):
        self.cfg = cfg
        self.rng = rng
        size = cfg.grid_size
        count = size**3
        self.size = size
        self.plasma: List[float] = [rng.random() * 0.5 for _ in range(count)]
        self.liquid: List[float] = [rng.random() * 0.5 for _ in range(count)]
        self.solid: List[float] = [rng.random() * 0.5 for _ in range(count)]
        self.parity: List[int] = [rng.choice((0, 1)) for _ in range(count)]

    def _idx(self, x: int, y: int, z: int) -> int:
        s = self.size
        return (x % s) * s * s + (y % s) * s + (z % s)

    def neighbor_average(self, idx: int, plasma_snapshot: list[float]) -> float:
        s = self.size
        z = idx % s
        y = (idx // s) % s
        x = idx // (s * s)
        neighbor_sum = 0.0
        for dx, dy, dz in ((1, 0, 0), (-1, 0, 0), (0, 1, 0), (0, -1, 0), (0, 0, 1), (0, 0, -1)):
            n_idx = self._idx(x + dx, y + dy, z + dz)
            neighbor_sum += plasma_snapshot[n_idx]
        return neighbor_sum / 6.0

    def step(self, lens_blend: LensBlend, bias_field, log_events: list[str]) -> None:
        cfg = self.cfg
        p0 = list(self.plasma)
        l0 = list(self.liquid)
        s0 = list(self.solid)
        dispersion = float(statistics.pstdev(p0))
        forgive = forgiveness_factor(dispersion, cfg.forgiveness_threshold, cfg.forgiveness_floor)

        if forgive < 1.0:
            log_events.append(f"forgiveness:{dispersion:.3f}->{forgive:.2f}")

        path_b = lens_blend.path_b_weight(cfg.path_b_base)

        for i in range(len(p0)):
            nb = self.neighbor_average(i, p0)
            avg = (p0[i] + l0[i] + s0[i]) / 3.0
            diff = abs(p0[i] - nb) + self.parity[i] * cfg.parity_boost
            mix = avg * (1.0 - path_b) + diff * path_b * forgive
            bias_delta = bias_field.pull(i)
            self.liquid[i] = (mix + bias_delta) % 1.0
            self.solid[i] = (1.0 - cfg.alpha) * s0[i] + cfg.alpha * self.liquid[i]

            if self.rng.random() < cfg.flip_p:
                self.plasma[i] = (p0[i] + self.rng.uniform(-cfg.flip_delta, cfg.flip_delta)) % 1.0
            else:
                self.plasma[i] = p0[i]

            if self.rng.random() < cfg.parity_p:
                self.parity[i] = 1 - self.parity[i]

        bias_field.echo_from(self.liquid, cfg.echo_weight, cfg.echo_decay)
