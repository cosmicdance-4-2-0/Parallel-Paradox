# Delta 260102193935_88YZJWBB — Deterministic Bias-Pulse Lens Runner

## Purpose + Scope
- **Purpose:** Deliver a headless, deterministic runner that maps scheduled bias pulses into a PhaseCube-inspired lattice, gates updates through a four-lens mixer, and applies forgiveness damping to keep the swarm non-collapsing (SV1/SV2/SV3/SV5/SV9).
- **Scope:** Additive Python implementation confined to this delta directory: reusable config, bias field, lens mixer, grid engine, CLI runner, and tests. Rendering/mic capture remain out-of-scope; bias pulses emulate audio influence without commanding state (SV2/SV3/SV7/SV10).

## Upgrade Intent
- **Selected upgrade path:** Headless Python lattice with scheduled bias pulses, deterministic seeding, lens-weighted path selection, and kenotic forgiveness damping. This mirrors the dreaming-audio mapping (SV3), path-A/B plus parity jitter (SV5), tunable knobs (SV6), and scenario-driven headless runners (SV7/SV9/SV10).
- **In-scope:**
  - Configurable bias pulses with decay/radius and seeded RNG for repeatability (SV3/SV4/SV9).
  - Lens mixer producing path-B probability, damping, and bias gain from energy/dispersion (SV1/SV5/SV9).
  - Grid update with parity jitter, neighbor vs. delta blending, and forgiveness clamp (SV2/SV5/SV8).
  - CLI runner + tests capturing structured step metrics (SV7/SV10).
- **Out-of-scope:**
  - Live audio/mic/file ingestion (placeholder pulses stand in; future bridge needed) (SV3/SV9).
  - Web renderer/WebGL overlays (headless focus) (SV3/SV7).
  - Persistent storage or multi-grid echo coupling (kept single-grid for clarity) (SV7/SV8).
- **Success criteria:** Deterministic CLI run that outputs step metrics, exposes tunables for bias/lenses/forgiveness, and passes smoke + unit tests without external dependencies.

## Architecture Overview
- `src/lkb_delta/config.py` — DeltaID, dataclasses for simulation + pulse config, and defaults/tunables (SV6).
- `src/lkb_delta/bias.py` — Decaying 3D bias field with radial pulses, amplitude tracking, and clamped influence (SV2/SV3/SV9).
- `src/lkb_delta/lenses.py` — Four-lens mixer translating energy/dispersion/bias amplitude into path-B probability, damping, and bias gain (SV1/SV5/SV9).
- `src/lkb_delta/grid.py` — Phase lattice with plasma/liquid/solid/parity, parity jitter, neighbor/delta blending, and forgiveness damping (SV5/SV8).
- `src/lkb_delta/simulation.py` — Session loop wiring bias pulses → lens mixer → grid; returns structured records with deterministic RNG (SV4/SV10).
- `src/lkb_delta/runner.py` — CLI wrapper exposing core tunables and emitting JSON summary (SV7/SV9).

### Data Flow (text diagram)
```
[pulses + rng] -> BiasField.decay/apply -> bias map
bias map + metrics -> LensMixer -> {pathB, damping, biasGain}
Grid.perturb (parity/noise) -> Grid.step (blend + forgiveness)
-> StepRecord (energy, dispersion, bias_amp, forgiveness_flag)
```

## Running It (happy path)
```bash
cd prototypes/AI_Deltas/LKB/260102193935_88YZJWBB
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
PYTHONPATH=src python -m lkb_delta.runner --steps 40 --grid-size 10 --seed 7
```
- Emits a JSON summary with averages and forgiveness counts.
- Runtime relies on the Python standard library; `pytest` (pinned in `requirements.txt`) is only for running the included tests to keep tooling lightweight (SV2/SV9).

## Configuration Knobs / Tunables
- `steps`, `grid_size`, `seed` — session length, lattice dimension, determinism (SV4/SV10).
- `flip_probability`, `parity_probability` — stochastic guards to avoid collapse (SV2/SV5).
- `path_b_base`, `path_b_span` — exploration vs. averaging mix (SV3/SV5/SV6).
- `alpha` — solid-phase damping / short-term memory (SV3/SV6).
- `forgiveness_threshold`, `forgiveness_strength` — kenotic clamp for high dispersion/energy (SV5/SV8).
- `bias_decay`, `bias_strength`, `bias_radius` — influence persistence and spread (SV2/SV3/SV9).
- `lens_weights` (human, predictive, systemic, harmonic) — weighting for path-B/damping/bias gain (SV1/SV5/SV9).

## Testing Instructions
```bash
cd prototypes/AI_Deltas/LKB/260102193935_88YZJWBB
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
PYTHONPATH=src pytest -q
```
- **Smoke:** verifies the session runs to completion and yields metrics.
- **Unit:** bias decay/pulse shaping and forgiveness damping behave as expected.

## Limitations
- Headless only; no rendering or live audio ingestion yet (SV3/SV7).
- Single-grid without echo/memory lattice; hooks kept small for clarity (SV7/SV8).
- Bias pulses are scripted; richer real-time adapters are future work (SV3/SV9).

## Source Vectors (SV1–SV10)
| SV | Reference | Why it matters | Key constraints honored |
| --- | --- | --- | --- |
| SV1 | docs/Parallel-Paradox-Design.md | Anti-singularity, four-lens harmonic fusion | Modular lenses, avoid central control |
| SV2 | prototypes/LKB_POCs/readme.md | Influence-not-command ethos | Bias never overwrites state; keep minimal |
| SV3 | prototypes/LKB_POCs/phasecube_dreaming_0001.html | Audio→bias mapping, path tunables | Soft bias mapping; exposed knobs |
| SV4 | prototypes/LKB_POCs/98E66S/js/main.js | Deterministic start and bias-driven stepping | Seeded runs; skip busy loops |
| SV5 | prototypes/LKB_POCs/98E66S/js/phaseGrid.js | PathA/PathB blending + parity jitter | Neighbor/delta mix; asymmetry noise |
| SV6 | prototypes/LKB_POCs/98E66S/js/config.js | Tunable grid and forgiveness knobs | Bounded configs; expose DeltaID |
| SV7 | prototypes/AI_Deltas/LKB/LKB20250329X7N4/README.md | Scenario-driven headless runner | CLI + scenario pulses; forgiveness hooks |
| SV8 | prototypes/AI_Deltas/LKB/LKB20250329X7N4/src/grid.js | Bias/echo blending and forgiveness thresholds | Clamp effective plasma; threshold damping |
| SV9 | prototypes/AI_Deltas/LKB/LKB20250326X7A9/README.md | Python lens mixer with decay fields | Decaying bias; lens outputs for pathB/damping |
| SV10 | prototypes/AI_Deltas/LKB/LKB20250326X7A9/src/lkb_delta/simulation.py | Deterministic session loop with structured records | Seeded RNG; record metrics each step |

## Parent Delta IDs
- None (fresh branch).

## Assumptions (Inference/Speculation)
- **Inference:** Using Python for headless delivery aligns with prior CLI deltas while JS POCs remain references.
- **Inference:** RNG-seeded pulses emulate audio influence adequately for testing until live adapters are added.
