# Delta 260102193930_7LH8S4Z7 — Lens-Gated Echo Runner (Python)

## Purpose + Scope
- **Purpose:** Deliver a headless, dependency-light Python runner that mirrors the PhaseCube ethos with dual lattices, decaying bias pulses, lens-inspired gating, and forgiveness damping while keeping the influence-not-control stance. (SV1/SV2/SV3/SV7)
- **Scope:** Additive code confined to this delta folder: CLI runner, modular simulation core, and tests. Browser rendering/audio capture remain out of scope; focus stays on bias plumbing, lens gating, and observability metrics. (SV5/SV7/SV10)

## Upgrade Intent
- **Selected path:** Dual-grid (core + echo) Python simulation with scenario-driven bias pulses, lens mixer outputs that shape Path B and damping, and kenotic forgiveness to prevent runaway dispersion. (SV3/SV7/SV8/SV9)
- **Justifying SVs:**
  - Bias as influence-only with tunable decay/strength (SV2/SV3/SV4/SV8).
  - Lens-guided modulation of Path B/damping and echo coupling (SV1/SV6/SV7/SV9).
  - Minimal, human-readable setup with explicit metrics for interpretability (SV2/SV5/SV10).
- **In-scope:** Scenario pulses → bias field → lens mixer → dual-grid updates → smoothed metrics; CLI hooks and tests.
- **Out-of-scope:** WebGL/canvas rendering, live mic/file ingestion, persistent storage, or multiplayer coupling.
- **Success criteria:** Runnable CLI that emits metrics on completion; tests validating bias decay and guardrail math; tunables surfaced in config.

## Architecture Overview
```
scenario pulses ─┐
                 │  +---> lens mixer (weights)
                 ├─> bias field (decay, radius) ──┐
                 │                                │
                 │                                v
              run loop --------------------> PhaseGrid(core)
                                    └─soft echo coupling─> PhaseGrid(echo)
                                    └─forgiveness guardrail
```

### Modules
- `src/config.py` — Defaults + dataclasses for grid, bias, forgiveness, coupling, and lens weights.
- `src/bias.py` — Decaying bias lattice; applies scenario pulses with radial kernels.
- `src/lens.py` — Lens-inspired mixer producing Path B and damping gains from metrics.
- `src/grid.py` — Phase lattice with plasma/liquid/solid/parity, stochastic perturbations, lens gating, and forgiveness.
- `src/scenario.py` — Preplanned pulse schedule plus helper for quick custom pulses.
- `src/run.py` — CLI entry; runs a session, reports metrics, and exposes `run_session` for tests.

## Running (happy path)
```bash
cd prototypes/AI_Deltas/LKB/260102193930_7LH8S4Z7
python -m src.run --steps 60
```
- Optional knobs: `--seed`, `--grid-size`, `--log-interval`, `--scenario` (preset name).
- Output: per-interval metrics table plus final summary JSON line.

## Configuration Knobs / Tunables
- **Grid:** `grid_size`, `flip_p`, `parity_p`, `alpha`, `path_b_base`, `path_b_min/max` (SV2/SV6).
- **Bias:** `decay`, `strength`, `radius`, `pulse_jitter` (SV2/SV3/SV4).
- **Lens weights:** `human`, `predictive`, `systemic`, `harmonic` influence on Path B/damping/bias gain (SV1/SV7/SV9).
- **Forgiveness:** `threshold`, `damp` scales when dispersion spikes (SV1/SV8).
- **Coupling:** `echo_gain`, `bias_gain` linking echo/core grids softly (SV9/SV10).
- **Scenario:** `pulses` (step, band, strength) with optional jitter and repeat distance (SV3/SV4).
- **Metrics:** `smooth_factor` EMA for output stability (SV10).

## Testing Instructions
```bash
cd prototypes/AI_Deltas/LKB/260102193930_7LH8S4Z7
python -m unittest discover -s tests
```
- **Smoke:** `tests/test_smoke.py` runs a short session and checks metric shapes.
- **Unit:** `tests/test_bias.py` (bias decay/injection) and `tests/test_grid.py` (forgiveness factor + clamps).

## Limitations
- Headless only; no audio input or rendering is provided (future hook). (SV7/SV10)
- CPU-only with small lattices; scaling left as TODO.
- Scenario pulses mimic audio influence; real mic/file ingestion deferred.

## Source Vectors (SV1–SV10)
| ID | Reference | Why it matters |
| -- | --- | --- |
| SV1 | docs/Parallel-Paradox-Design.md | Canonical decentralized/harmonic framing and lens fusion guidance. |
| SV2 | prototypes/LKB_POCs/readme.md | PhaseCube ethos: influence-only bias, noise, minimalism. |
| SV3 | prototypes/LKB_POCs/phasecube_dreaming_0001.html | Audio → bias mapping with Path B/ALPHA tunables. |
| SV4 | prototypes/LKB_POCs/98E66S/js/main.js | Structured bias injection + clean resets. |
| SV5 | prototypes/LKB_POCs/98E66S/js/renderer.js | Separation of simulation/visuals; parity-driven variation. |
| SV6 | prototypes/Toys/lkb_agi_0001.html | Minimal baseline tunables and no-build ethos. |
| SV7 | prototypes/AI_Deltas/LKB/LKB20250329X7N4/README.md | Lens-gated bias pulses and forgiveness in a dual-grid runner. |
| SV8 | prototypes/AI_Deltas/LKB/LKB20250329X7N4/DELTA.json | Manifest for modular, influence-only biasing with guardrails. |
| SV9 | prototypes/LKB_POCs/V4H2J9/app.js | Dual-grid with delay/echo and gentle cross-talk. |
| SV10 | prototypes/LKB_POCs/V4H2J9/README.md | Interpretability focus and dependency-light delivery. |

## Parent Delta IDs
- None.

## Assumptions
- Python 3.11+ is available locally to run the CLI and tests (Inference).
- Scenario pulses are sufficient stand-ins for audio until a driver is added (Inference).
