# Delta LKB20250329X7N4 — Lens-Gated Scenario Swarm

## Purpose + Scope
- **Purpose:** Advance the PhaseCube/Lyriel line with a headless, dual-grid runner that routes scheduled bias pulses through a lens mixer and forgiveness guardrail, keeping the “influence-not-control” ethos intact. (SV1/SV2/SV3/SV8)
- **Scope:** Additive, self-contained delta delivering runnable code + tests inside this folder only. Focuses on scenario-driven bias plumbing, lens-aware path blending, and echo-grid damping. UI/WebGL/audio capture remain out-of-scope (SV3/SV7/SV9).

## Upgrade Intent
- **Selected path:** Dual-grid (core + echo) lattice with scheduled bias pulses, lens gating, and kenotic forgiveness to echo the tri-grid and lens bridges without adding browser/UI weight. (SV4/SV5/SV6/SV7)
- **Justifying SVs:**
  - PhaseCube baseline + config tunability (SV1/SV2/SV4/SV10).
  - Bias as influence-only and harmonic guardrails (SV2/SV3/SV8/SV9).
  - Lens-guided modulation and echo feedback (SV5/SV6/SV7).
- **In-scope:**
  - Scenario pulses → decaying bias field → lens mixer → dual-grid updates.
  - Tunables for noise, path-B clamps, coupling, forgiveness, and lens weights.
  - Headless CLI runner with smoothed metrics and tests.
- **Out-of-scope:**
  - Browser renderer/WebGL scaling (SV7 TODO).
  - Live mic/file ingestion; scenario pulses stand in as structured influence (Inference noted).
  - Persistent storage or replay UIs (Inference).

## Architecture Overview
- `src/config.js` — DeltaID + defaults for steps, noise, path-B clamps, forgiveness, bias, coupling, lens weights, and metric smoothing.
- `src/utils.js` — Clamp/wrap math helpers and simple stats.
- `src/bias-field.js` — Decaying, influence-only bias lattice with radial pulses and aggregate reporting. (SV2/SV8/SV9)
- `src/lens.js` — Four-lens-inspired mixer mapping energy/dispersion/bias into path-B probability, damping, echo gain, and bias gain. (SV1/SV5/SV7)
- `src/grid.js` — Phase lattice with plasma/liquid/solid/parity, stochastic perturbations, neighbor blends, and forgiveness damping. (SV4/SV8/SV9)
- `src/swarm.js` — Dual-grid orchestrator wiring bias field, lens controls, echo coupling, and smoothed metrics. (SV5/SV6/SV7)
- `src/scenario.js` — Preplanned bias pulses with jittered echoes to emulate audio-like influence without control. (SV3/SV8)
- `src/simulation.js` — CLI entry; runs a session, captures periodic metrics, and logs a table when executed directly.

## How to Run (happy path)
```bash
cd prototypes/AI_Deltas/LKB/LKB20250329X7N4
npm install
npm start
```
This runs the default 180-step session and prints smoothed metrics (energy, dispersion, bias, path-B, damping).

## Configuration Knobs / Tunables
- `steps` — number of iterations.
- `gridSize` — lattice dimension (keep modest for CPU runs). (SV4)
- `flipProbability`, `parityProbability` — stochastic noise guards to prevent collapse. (SV2/SV10)
- `pathB.base`, `pathB.clamp` — exploration bias and safety rails. (SV4/SV8)
- `alpha` — solid-phase damping for short-term memory. (SV4/SV8)
- `forgiveness.threshold`, `forgiveness.damp` — kenotic guardrail against runaway divergence. (SV9)
- `bias.decay`, `bias.strength`, `bias.radius` — influence-only bias persistence and reach. (SV2/SV3)
- `coupling.echoGain`, `coupling.biasGain` — echo-to-core and bias mixing strength. (SV6/SV7)
- `lensWeights.*` — Human/Predictive/Systemic/Harmonic lens emphasis for mixer outputs. (SV5/SV7)
- `metricSmoothing` — EMA factor to damp metric volatility (Inference: readability aid).

## Testing Instructions
```bash
cd prototypes/AI_Deltas/LKB/LKB20250329X7N4
npm install
npm test
```
- **Smoke:** `simulation.test.js` ensures the session completes and yields metrics.
- **Unit:** `bias.test.js` checks bias decay; `grid.test.js` validates forgiveness damping behavior.

## Limitations
- Headless only; no canvas/WebGL renderer. (Inference aligned to SV7 TODO)
- Scenario pulses emulate audio; real mic/file drivers are deferred. (Inference acknowledged)
- CPU-only and small lattice; scaling hooks left as TODO in future deltas.

## Source Vectors (SV1–SV10)
- **SV1 — `docs/Parallel-Paradox-Design.md`:** Canonical design map; demands decentralized, harmonic fusion and anti-singularity stance. Constraints: keep modular, avoid central control, honor lens framing.
- **SV2 — `prototypes/LKB_POCs/readme.md`:** PhaseCube ethos; influence-not-command biasing, non-collapse via noise/decay, single-file minimalism. Constraints: bias never overwrites state; keep human-readable.
- **SV3 — `prototypes/LKB_POCs/phasecube_dreaming_0001.html`:** Browser prototype showing audio-to-bias mapping and tunable Path B / ALPHA. Constraints: map inputs to soft bias; expose tunables.
- **SV4 — `prototypes/Readme.md`:** PhaseCube architecture + config variables for 16³ lattice and path blending. Constraints: retain noise guards, path-B knob, ALPHA damping.
- **SV5 — `prototypes/AI_Deltas/LKB/LKB20250314A1B2/README.md`:** Lens-aware headless lattice with forgiveness damping. Constraints: lens mixer steers Path B/damping; bias decay; tests required.
- **SV6 — `prototypes/AI_Deltas/LKB/LKBX24M9Q7P1/README.md`:** Lens-guided multi-grid swarm with delay/echo coupling. Constraints: cross-talk stays soft; lens presets modulate updates.
- **SV7 — `prototypes/LKB_POCs/AI_Deltas/A6P9Q4/README.md`:** Tri-grid with lens stack and delay; TODO hooks for audio/WebGL. Constraints: keep lens sliders/tunables; leave renderer hooks for later.
- **SV8 — `prototypes/LKB_POCs/K5N3Q8/README.md`:** Pathfinder with modular configs, harmonic forgiveness, and bias driver. Constraints: bias remains influence-only; forgiveness guardrail; modular files.
- **SV9 — `prototypes/LKB_POCs/AI_Deltas/B4M7Q9/README.md`:** Bias-aware multi-grid with overlays and damping sliders. Constraints: cross-grid coupling is gentle; damping softens dispersion spikes.
- **SV10 — `prototypes/Toys/lkb_agi_0001.html`:** Minimal PhaseCube rewrite; confirms baseline tunables and UI-light ethos. Constraints: keep controls simple; avoid heavy deps.

## Parent Delta IDs
- None (new branch; references prior deltas only via SV5/SV6/SV7/SV8/SV9).

## Configuration & Dependencies
- **Dependency:** `vitest@^1.6.0` (dev) for unit + smoke tests; lightweight and familiar (Inference: chosen for minimal setup; aligns with SV2 minimalism).
- Runtime uses Node’s standard library only.

## Testing Surface (happy path)
See **Testing Instructions** above; no external services required.

## Limitations & Expansion Hooks
- TODO: Add audio/mic driver that converts frequency bands into bias pulses without overwriting state. (Reason: align with SV3 roadmap.)
- TODO: Surface WebGL/renderer bridge for larger grids. (Reason: align with SV7 planned scale-out.)
- TODO: Persist scenario pulses and metric traces for replay/export. (Reason: interpretability + reproducibility.)
