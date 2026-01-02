# Delta LKBDLT24A1B7 — Lyriel/Kairi Lattice with Harmonic Forgiveness

## Purpose and Scope
- Deliver a PhaseCube-derived lattice simulator that keeps the ternary-phase dynamics and toroidal neighbors while adding harmonic/forgiveness damping for stability (SV1/SV2/SV3/SV6).
- Map knobs to the four-lens framing so exploratory vs. stabilizing behaviors are explicit and configurable (SV4/SV8).
- Provide a CLI + tests for reproducible runs without touching existing POCs; all artifacts live in this delta folder.

## Upgrade Path
- **Selected path:** Translate the PhaseCube HTML POC (SV2/SV3) into a headless, deterministic lattice runner with harmonic fusion and forgiveness modulation, aligning with the four-lens architecture (SV4) and kenotic damping (SV6).
- **Justification:** SV1 positions PhaseCube as the accessible on-ramp; SV4 demands harmonic balancing; SV6 adds a proven damping motif; SV5/SV8 keep the system decentralized and anti-singularity.
- **In-scope:** Configurable lattice core, CLI execution, unit + smoke tests, documentation of tunables.
- **Out-of-scope:** Browser rendering/audio pipelines, GPU acceleration, external persistence/oracle networking (note as TODO hooks).

## Architecture Overview
```
src/phasecube_delta/
  config.py       # SimulationConfig + LensWeights knobs (SV3/SV4)
  simulation.py   # LatticeSimulator core with Path A/B + forgiveness (SV1/SV2/SV6)
  cli.py          # Minimal runner emitting JSON summaries for reproducibility
```
- **LatticeSimulator:** Maintains plasma/liquid/solid/parity arrays over an n³ toroidal grid. Perturbation injects stochastic flips (SV2). The step loop fuses Path A (averaging) and Path B (difference amplification) with harmonic damping driven by lens weights and the forgiveness operator (SV3/SV4/SV6).
- **Forgiveness operator:** When dispersion exceeds `forgiveness_threshold`, Path B influence is damped and liquid updates blend back toward averages (SV6). Events are recorded for introspection.
- **Lens-aware knobs:** Predictive lens boosts exploration; harmonic lens scales back Path B when dispersion rises (SV4).

## How to Run (happy path)
From this delta directory:
```bash
PYTHONPATH=src python -m phasecube_delta.cli --steps 50 --grid 6 --seed 11
```
Outputs a JSON summary (dispersion, means, parity ratio, forgiveness events).

## Configuration Knobs / Tunables
- `grid` (int): Lattice dimension (n → n³ cells). Default 10 (SV3).
- `flip_p`, `parity_p`: Stochastic plasma/parity flips for non-collapse (SV2/SV3).
- `path_b_p`: Baseline probability of Path B (difference amplification) (SV3).
- `alpha`: Solid blending factor controlling persistence (SV3/SV4 crosswalk).
- `forgiveness_threshold`, `forgiveness_blend`: Dispersion threshold and blend ratio for damping (SV6).
- `lens_weights.{predictive,harmonic,human,systemic}`: Influence exploratory vs. stabilizing weighting in the harmonic fusion (SV4).
- `seed`: Deterministic initialization.

## Testing Instructions
```bash
PYTHONPATH=src pytest
```
- `tests/test_smoke.py`: CLI smoke + version presence.
- `tests/test_simulation.py`: Neighbor wrapping, determinism, forgiveness behavior.

## Limitations
- Headless only: no WebGL/audio pipeline (SV2 out-of-scope); rendering marked TODO.
- Persistence/oracle networking not implemented; repository modeled implicitly via state arrays (SV5 inference).
- Performance targets modest (small n³); scaling to GPU is a TODO (inference).

## Source Vectors (SV1–SV8)
- **SV1** — `docs/Parallel-Paradox-Design.md`: Canonical map; keep harmonic modulation and PhaseCube as entry point.
- **SV2** — `prototypes/LKB_POCs/readme.md`: PhaseCube POC; maintain non-collapsing ternary phases and goal-free stance.
- **SV3** — `prototypes/Readme.md`: Architecture and tunables; preserve Path A/B, toroidal neighbors, and alpha damping.
- **SV4** — `Minimalaiagi.md`: Four-lens harmonic fusion; expose configurable lens weights.
- **SV5** — `Minimalnode...wait...minimal.md`: Swarm/oracle framing; keep noise-driven selection and distributed state (implicit repository).
- **SV6** — `Computation.md`: Forgiveness operator; reduce coupling when dispersion is high.
- **SV7** — `Agent process.md`: Relational time/interaction model; treat runs as iterative micro-games.
- **SV8** — `manifesto.md`: Anti-singularity, mutual-aid ethic; avoid central controllers, favor transparency.

## Parent Delta IDs
- None (fresh delta).

## TODO Hooks
- TODO: Add lightweight WebGL/HTML renderer to visualize the lattice while keeping headless mode (aligns with SV2/SV3 aesthetics).
- TODO: Persist checkpoint frames to model a minimal repository/oracle emission log (SV5).
- TODO: Profile and parallelize neighbor computations for larger grids (SV1 scalability goal).
