# Lens-Fused Tri-Grid Runner (DeltaID: D7F3L9P2Q5R8)

## Purpose and Scope
This delta delivers a **lens-aware, tri-grid PhaseCube runner** that keeps inputs as influence-only bias fields while layering delay-fed memory and harmonic forgiveness damping. The goal is to advance the upgrade path from SV1/SV2/SV3 toward the multi-grid, delay-aware patterns in SV6/SV7 without adding goals or central control.

- **Upgrade path:** Lens-fused tri-grid with delay-line bias and kenotic forgiveness to probe memory-biased influence while preserving non-collapse. (SV1/SV2/SV6/SV7/SV8)
- **In scope:** Core/echo/memory grids, lens scheduler, bias+delay replay, kenotic forgiveness logging, CLI summary.
- **Out of scope:** Browser rendering, audio I/O, persistence/IndexedDB, GPU/WebGL scaling (marked TODO for later deltas).

## Architecture Overview
- **Config (`src/phasecube_delta/config.py`):** Central tunables (grid size, probabilities, damping, coupling, delay depth) and lens schedule. (SV3/SV4)
- **Lenses (`src/phasecube_delta/lenses.py`):** Presets plus scheduler to blend human/predictive/systemic/harmonic weights smoothly. (SV4/SV6)
- **Bias & Delay (`src/phasecube_delta/bias.py`):** Influence-only bias fields seeded from stochastic noise with bounded delay-line replay. (SV2/SV6)
- **PhaseGrid (`src/phasecube_delta/grid.py`):** Plasma/liquid/solid lattice with toroidal neighbors, parity flips, path branching, and forgiveness damping. (SV2/SV3/SV8)
- **MultiGridSwarm (`src/phasecube_delta/multigrid.py`):** Orchestrates core/echo/memory grids, routes delay bias, and applies soft coupling from echo/memory back into the core field. (SV6/SV7)
- **Runner (`src/phasecube_delta/runner.py`):** CLI entrypoint emitting JSON summaries for quick inspection. (SV7)

## How to Run (happy path)
```bash
cd prototypes/AI_Deltas/LKB/D7F3L9P2Q5R8
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
PYTHONPATH=src python -m phasecube_delta.runner --steps 60 --seed 7 --bias 0.05
```
Outputs a JSON report with mean energy/divergence per grid and forgiveness counts.

## Configuration Knobs / Tunables
Adjust defaults in `src/phasecube_delta/config.py` or pass CLI flags:
- `grid_size`: lattice dimension (n => n^3 agents); keep modest for CPU-only runs. (SV3)
- `flip_probability` / `parity_probability`: stochastic noise to prevent collapse. (SV2/SV3)
- `path_b_probability`, `alpha`: branch vs damping weights; higher Path B leans exploratory. (SV3)
- `bias_strength`, `bias_decay`: influence magnitude and temporal decay. (SV2/SV6)
- `delay_length`, `delay_decay`: depth and fade of replayed bias. (SV6/SV7)
- `coupling_echo_to_core`, `coupling_memory_to_core`: soft cross-talk weights. (SV6/SV7)
- `forgiveness_threshold`, `forgiveness_strength`: kenotic damping trigger/intensity. (SV1/SV8)
- `lens_schedule`: presets and blend cadence for human/predictive/systemic/harmonic weights. (SV4)

## Testing Instructions
```bash
cd prototypes/AI_Deltas/LKB/D7F3L9P2Q5R8
PYTHONPATH=src pytest -q
```
Includes smoke, forgiveness, and multi-grid orchestration checks.

## Dependencies
- `numpy` — vectorized lattice math for toroidal neighbor sampling and bias blending; keeps the loops concise and inspectable. (SV3/SV6)
- `pytest` — lightweight test harness for smoke/unit coverage.

## Limitations
- Headless only; no renderer or audio ingestion (inference aligned with SV2/SV7 ethos).
- Plasticity hooks are minimal (parity/flip noise) and intentionally bounded; richer rewiring is left for a later delta. (Inference)
- Performance is CPU-bound; scaling beyond ~32^3 will need workerization/WebGL (TODO: future delta).

## Source Vectors (SV1–SV8)
- **SV1:** `docs/Parallel-Paradox-Design.md` — anti-singularity map; mandates harmonic damping and forgiveness safeguards. Constraints: decentralized stance, harmonic balancing, kenotic damping.
- **SV2:** `prototypes/LKB_POCs/readme.md` — PhaseCube ethos of influence-only inputs and non-collapsing ternary phases. Constraints: bias not overwrite, stochastic flips, plasma/liquid/solid framing.
- **SV3:** `prototypes/Readme.md` — PhaseGrid parameters, toroidal neighbors, damping via `ALPHA`. Constraints: toroidal sampling, tunable probabilities, minimal loops for ~4096 agents.
- **SV4:** `Minimalaiagi.md` — four-lens architecture and harmonic fusion. Constraints: explicit human/predictive/systemic/harmonic weights; harmonic stabilization; modular lenses.
- **SV5:** `Minimalnode...wait...minimal.md` — decentralization, oracle via noise, gossip/teleport witness flow. Constraints: noise-driven arbitration, soft propagation, no central controller.
- **SV6:** `prototypes/LKB_POCs/V4H2J9/README.md` — dual-grid dialogue with delay-fed bias and plasticity. Constraints: soft coupling, delay-line memory, bounded plasticity.
- **SV7:** `prototypes/LKB_POCs/Q6P3R8/README.md` — tri-grid dialogue and interpretability overlays with harmonic safeguards. Constraints: core/echo/memory coordination, harmonic damping on spikes, observable metrics.
- **SV8:** `Computation.md` — kenotic N-body forgiveness operator. Constraints: trigger forgiveness when dispersion crosses threshold, track forgiveness events, triadic stability mindset.

## Parent Delta IDs
None; this starts a new branch.
