# LKBDLT20250118A — Lens-Aware PhaseCube Micro-Simulator

## Purpose + Scope
- Deliver a minimal, human-readable simulator that mirrors PhaseCube dynamics (SV2/SV3) while layering lens-guided tuning (SV4) and kenotic forgiveness damping (SV6).
- Provide an additive delta only inside `prototypes/AI_Deltas/LKB/LKBDLT20250118A/` as the new iteration path; no upstream files are modified.

## Upgrade Path Selected
- **Path:** PhaseCube → lens-aware scheduler with echo bias + forgiveness damping, prioritizing bounded “dreaming” behavior over goal-seeking (SV1/SV2/SV8).
- **Justification:** SV3 documents Path A/B tunables; SV4 demands harmonic fusion; SV6 supplies the forgiveness operator to avoid collapse; SV7/SV8 emphasize bias echoing and smooth lens transitions.
- **Scope:** CPU-only micro-simulator, CLI reporting, and tests. No browser UI or audio I/O for this delta.
- **Out-of-scope:** Web rendering, GPU/WebGL scale-up, recorded/audio ingestion, or multi-grid orchestration (left for later deltas).

## Architecture Overview
- **`src/config.py`** — Tunables (grid size, Path B base, ALPHA damping, forgiveness thresholds, echo settings). Values mirror PhaseCube defaults where applicable (SV3).
- **`src/lenses.py`** — Four-lens blend (Human, Predictive, Systemic, Harmonic) that adjusts Path B probability to balance exploration vs stability (SV4).
- **`src/bias.py`** — Echo bias bus that recirculates recent liquid activity and accepts bounded external pulses (SV2/SV7/SV8).
- **`src/grid.py`** — Plasma/liquid/solid lattice with toroidal neighbors, parity asymmetry, and kenotic forgiveness scaling when dispersion grows (SV3/SV5/SV6).
- **`src/simulation.py`** — Orchestrates steps, periodic influence-only pulses, and aggregates a report.
- **`src/main.py`** — CLI entrypoint producing a JSON summary tagged with DeltaID.

## How to Run (Happy Path)
```bash
python prototypes/AI_Deltas/LKB/LKBDLT20250118A/src/main.py --steps 50 --grid-size 6 --seed 42
```

## Configuration Knobs / Tunables
- `grid_size` — Lattice dimension (default 8) (SV3).
- `flip_p`, `parity_p`, `flip_delta`, `parity_boost` — Noise and asymmetry controls to prevent convergence (SV2/SV3).
- `path_b_base` — Baseline Path B weight; adjusted by lens blend (SV3/SV4).
- `alpha` — Solid-phase damping coefficient (SV3).
- `forgiveness_threshold`, `forgiveness_floor` — Kenotic damping settings when dispersion rises (SV6).
- `echo_weight`, `echo_decay`, `input_gain`, `max_bias` — Echo bus and external influence bounds (SV2/SV7/SV8).
- `random_seed`, `steps` — Reproducibility and runtime length.

## Testing Instructions
```bash
python -m pytest prototypes/AI_Deltas/LKB/LKBDLT20250118A/tests
```

## Dependencies
- Standard library only for runtime to honor minimalism (SV2).
- `pytest` pinned in `requirements.txt` for tests; if unavailable, tests can be translated to `unittest` trivially.

## Limitations
- CPU-only and in-memory; no visualization layer.
- Bias pulses are synthetic; real audio/text adapters are deferred (Inference).
- Forgiveness scaling is linear and global; per-cell or adaptive thresholds are future work (Inference).

## Source Vectors (SV1–SV8)
- SV1 — `docs/Parallel-Paradox-Design.md`
- SV2 — `prototypes/LKB_POCs/readme.md`
- SV3 — `prototypes/Readme.md`
- SV4 — `Minimalaiagi.md`
- SV5 — `Minimalnode...wait...minimal.md`
- SV6 — `Computation.md`
- SV7 — `prototypes/LKB_POCs/AI_Deltas/A6P9Q4/README.md`
- SV8 — `prototypes/LKB_POCs/AI_Deltas/T4H9K2/README.md`

## Parent Delta IDs
- None (rooted from SV1/SV2 without explicit parent delta IDs).
