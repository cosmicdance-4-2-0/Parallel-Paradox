# Delta LKB20250326X7A9 — Audio-Biased Lens Mixer (Headless)

## Purpose + Scope
- **Purpose:** Advance the PhaseCube upgrade path by mapping stereo FFT-style bins into a bounded lattice, then steering Path B probability and harmonic damping via a four-lens mixer. (SV1/SV2/SV3/SV7/SV9)
- **Scope:** Headless Python runner plus tests that keep bias as influence-only, apply kenotic forgiveness, and expose a CLI summary. Rendering/UI and true audio capture remain out-of-scope for this delta.

## Upgrade Intent
- **Selected path:** Integrate audio-inspired bias plumbing with lens-driven path selection and kenotic forgiveness from prior headless deltas. (SV3/SV7/SV8/SV9/SV10)
- **Why:** Connect the hearing-test mapping (low↔back, high↔front, pan↔x) to the lens mixer so bias stays soft and tunable while honoring PhaseCube’s non-collapse ethos. (SV2/SV3/SV9)
- **In-scope:**
  - Stereo bin→lattice bias mapper with radial falloff and decay (SV3/SV9).
  - Lens mixer gating Path B, damping, and bias gain using four-lens weights (SV5/SV7/SV10).
  - Kenotic forgiveness guardrail when dispersion spikes (SV1/SV7/SV8).
  - CLI runner + smoke/unit tests (SV2/SV8).
- **Out-of-scope:**
  - Browser renderer/WebGL overlays (SV3/SV6 TODO).
  - Real mic/file ingestion (uses RNG-driven bins; flagged as TODO for future bridge). (Inference)
  - Multi-grid orchestration or structural plasticity (SV5/SV6 notes deferred).

## Architecture Overview
- **src/lkb_delta/config.py:** Central defaults, clamps, and lens weights; exports DeltaID. (SV2/SV4)
- **src/lkb_delta/bias.py:** BiasField maps stereo bins to spatial bias with decay and radial falloff. (SV3/SV9)
- **src/lkb_delta/grid.py:** PhaseGrid (plasma/liquid/solid + parity) with stochastic perturbations and kenotic forgiveness damping. (SV2/SV7/SV8)
- **src/lkb_delta/lenses.py:** Four-lens mixer producing Path B probability, damping, and bias gain. (SV5/SV7/SV10)
- **src/lkb_delta/simulation.py:** Session loop wiring bias → lenses → grid updates; returns structured step records. (SV7/SV8)
- **src/lkb_delta/runner.py:** CLI wrapper emitting JSON summary (delta_id, averages, forgiveness count). (SV8)

## How to Run (happy path)
```bash
cd prototypes/AI_Deltas/LKB/LKB20250326X7A9
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
PYTHONPATH=src python -m lkb_delta.runner --steps 60 --grid-size 10 --seed 7
```
Outputs a JSON summary with average energy/dispersion and forgiveness counts.

## Configuration Knobs / Tunables
- `grid_size` — lattice dimension (n => n^3 agents). (SV4)
- `flip_probability`, `parity_probability` — stochastic noise to prevent collapse. (SV2/SV4)
- `base_path_b`, `clamp_path_b` — exploration vs averaging weights. (SV3/SV7)
- `alpha` — solid-phase damping/memory. (SV4)
- `forgiveness_threshold`, `forgiveness_strength` — kenotic guardrail triggers. (SV1/SV7)
- `bias_decay`, `bias_strength`, `bias_radius`, `bin_count` — bias persistence and spatial spread. (SV3/SV9)
- `lens_weights`, `harmonic_clamp` — four-lens influence and damping floor/ceiling. (SV5/SV10)
- CLI flags: `--steps`, `--grid-size`, `--seed` (see runner for defaults).

## Dependencies
- Standard library only for the runner; no external runtime dependencies required. (SV2/SV4)
- `pytest==8.4.2` — lightweight smoke/unit coverage for the headless runner. (SV8)

## Testing Instructions
```bash
cd prototypes/AI_Deltas/LKB/LKB20250326X7A9
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
PYTHONPATH=src pytest -q
```
- **Smoke:** Simulation runs and returns structured metrics.
- **Unit:** Bias mapper honors bin sizing and decay; forgiveness damping activates when dispersion rises.

## Limitations
- RNG-driven bins stand in for mic/file input; real audio adapters are TODO. (Inference from SV3/SV9)
- Single-grid only; echo/memory grids and overlays are deferred to the next delta. (SV5/SV6)
- CPU-only; scaling beyond ~20^3 may need vectorization or workerization (future work).

## Source Vectors (SV1–SV10)
See `DELTA.json` for detailed rationale/constraints.
- SV1 — docs/Parallel-Paradox-Design.md
- SV2 — prototypes/LKB_POCs/readme.md
- SV3 — prototypes/LKB_POCs/phasecube_dreaming_0001.html
- SV4 — prototypes/Toys/lkb_agi_0001.html
- SV5 — prototypes/LKB_POCs/AI_Deltas/A6P9Q4/README.md
- SV6 — prototypes/LKB_POCs/AI_Deltas/B4M7Q9/README.md
- SV7 — prototypes/AI_Deltas/LKB/LKB20250314A1B2/README.md
- SV8 — prototypes/AI_Deltas/LKB/D7F3L9P2Q5R8/README.md
- SV9 — prototypes/Toys/hearing_test_0005.html
- SV10 — prototypes/LKB_POCs/AI_Deltas/NCECI6/README.md

## Parent Delta IDs
- None (new branch).
