"""Scenario definitions for bias pulses."""
from __future__ import annotations

import random
from typing import Iterable, List

from .config import ScenarioPulse


class Scenario:
    def __init__(self, pulses: Iterable[ScenarioPulse]):
        self.pulses: List[ScenarioPulse] = list(pulses)

    def pulses_at(self, step: int) -> List[ScenarioPulse]:
        active: List[ScenarioPulse] = []
        for pulse in self.pulses:
            if step == pulse.step:
                active.append(pulse)
            elif pulse.repeat:
                if step >= pulse.step and (step - pulse.step) % pulse.repeat == 0:
                    active.append(pulse)
        return active


def build_scenario(name: str, base_pulses: List[ScenarioPulse], rng: random.Random) -> Scenario:
    if name == "sparse":
        pulses = [p for p in base_pulses if p.step % 2 == 0]
    elif name == "dense":
        pulses = base_pulses + [ScenarioPulse(step=step, band=0.5, strength=0.12, pan=0.0, radius=3) for step in range(10, 80, 15)]
    else:
        pulses = list(base_pulses)

    rng.shuffle(pulses)
    return Scenario(pulses)
