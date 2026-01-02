"""PhaseCube-inspired lattice simulator for Lyriel/Kairi deltas.

This module packages a small, tunable lattice with harmonic and forgiveness
controls suitable for CLI execution or testing.
"""

__all__ = ["LensWeights", "SimulationConfig", "LatticeSimulator"]
__version__ = "0.1.0"

from .config import LensWeights, SimulationConfig
from .simulation import LatticeSimulator
