from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Iterable, List, Tuple


@dataclass
class BiasField:
    size: int
    bin_count: int
    decay: float
    strength: float
    radius: int

    def __post_init__(self) -> None:
        self.bias: List[List[List[float]]] = [
            [[0.0 for _ in range(self.size)] for _ in range(self.size)]
            for _ in range(self.size)
        ]

    @property
    def amplitude(self) -> float:
        total = sum(abs(v) for v in self._iter_values())
        count = self.size ** 3
        return total / count if count else 0.0

    def _iter_values(self) -> Iterable[float]:
        for plane in self.bias:
            for row in plane:
                for value in row:
                    yield value

    def flatten(self) -> List[float]:
        return list(self._iter_values())

    def decay_bias(self) -> None:
        for x in range(self.size):
            for y in range(self.size):
                for z in range(self.size):
                    self.bias[x][y][z] *= self.decay

    def _inject_single(self, center: Tuple[int, int, int], power: float) -> None:
        cx, cy, cz = center
        r = self.radius
        for x in range(max(cx - r, 0), min(cx + r + 1, self.size)):
            for y in range(max(cy - r, 0), min(cy + r + 1, self.size)):
                for z in range(max(cz - r, 0), min(cz + r + 1, self.size)):
                    dx, dy, dz = x - cx, y - cy, z - cz
                    dist2 = dx * dx + dy * dy + dz * dz + 1e-6
                    falloff = math.exp(-dist2 / max(r * r, 1))
                    self.bias[x][y][z] += power * falloff

    def inject_from_bins(self, left: List[float], right: List[float]) -> None:
        """Map stereo bins into the lattice.

        - Low freq => back (higher z), high freq => front (lower z).
        - Pan => x-axis tilt, magnitude => injection power.
        - Centered on midplane y to keep influence gentle (SV3/SV9).
        """

        if len(left) != self.bin_count or len(right) != self.bin_count:
            raise ValueError("bin arrays must match configured bin_count")

        mid_y = self.size // 2
        for idx, (l_val, r_val) in enumerate(zip(left, right)):
            power = (abs(l_val) + abs(r_val)) * 0.5
            if power <= 0:
                continue

            pan_den = abs(l_val) + abs(r_val) + 1e-6
            pan = (r_val - l_val) / pan_den
            x_pos = int(min(max((pan + 1) * 0.5 * (self.size - 1), 0), self.size - 1))
            z_pos = int(min(max((1 - idx / max(self.bin_count - 1, 1)) * (self.size - 1), 0), self.size - 1))
            center = (x_pos, mid_y, z_pos)
            self._inject_single(center, power * self.strength)
