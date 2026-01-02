# Delta LKB20250314A1B2 — Lens-Aware Forgiveness Lattice

## Purpose + Scope
- **Purpose:** Advance the PhaseCube/Lyriel upgrade path by blending lens-guided path selection, kenotic forgiveness damping, and a decaying bias field into a headless, testable lattice runner. (Per SV1/SV2/SV4/SV5/SV7.)
- **Scope:** Additive delta only: self-contained code + tests inside this folder. No upstream files modified; rendering/UI kept out-of-scope in this iteration. Audio is represented as procedural bias pulses; real audio bridges remain TODO per SV3/SV8.

## Upgrade Intent
- **Selected path:** Lens fusion + bias plumbing + forgiveness damping with delay-line persistence to echo prior deltas’ tri-grid/delay ideas while staying minimal and headless. (SV1/SV2/SV5/SV8/SV10.)
- **Why:** Aligns with PhaseCube’s “influence not control” stance and the four-lens harmonic stabilizer while prototyping kenotic damping from SV7 in a reproducible loop.
- **In-scope:**
  - Lens mixer shaping Path B probability and damping based on energy/dispersion (SV5/SV9/SV10).
  - Decaying bias field and procedural “audio-like” pulses that never overwrite state (SV2/SV3/SV9).
  - Forgiveness guardrail triggered by dispersion thresholds (SV1/SV7/SV9).
  - Delay-line persistence to mimic echo grids and trace buffers (SV6/SV8/SV10).
  - Headless runner + tests for repeatability (SV2 minimalism ethos).
- **Out-of-scope:**
  - Browser UI/renderer or WebGL scaling (SV3/SV8 TODO for later).
  - True multi-grid orchestration; this delta keeps a single grid with delay-line echoes.
  - Mic/file audio ingestion; procedural bias stands in (Inference noted).

## Architecture Overview
- **config.js:** Central tunables (grid size, bias decay/strength, lens weights, forgiveness thresholds, Path B clamps) with DeltaID export.
- **lens.js:** Lens mixer translating energy/dispersion/bias amplitude into pathB probability, damping factor, and bias gain. Harmonic/Systemic lenses damp divergence; Predictive/Human lenses nudge exploration. (SV5.)
- **bias.js:** Decaying radial bias field that injects soft pulses and reports aggregate bias amplitude for lens mixing. Bias is influence-only and bounded (SV2/SV3/SV9).
- **grid.js:** Ternary lattice (plasma/liquid/solid + parity) with stochastic perturbations, harmonic forgiveness when dispersion spikes (SV7/SV9), and a delay line that preserves recent liquid states (SV6/SV10).
- **simulation.js:** Headless loop wiring bias → lens mixer → perturb/step → metrics logging. Provides `runSession()` for CLI use.

## How to Run (happy path)
```bash
cd prototypes/AI_Deltas/LKB/LKB20250314A1B2
npm install
npm start
```
This runs a short session (120 steps) and logs energy/dispersion/bias/pathB/damping plus a delayed-blend sample.

## Configuration Knobs / Tunables
- `config.gridSize` — lattice dimension (default 10).
- `config.flipProbability`, `config.parityProbability` — stochastic noise guards (SV2/SV4).
- `config.basePathB`, `config.harmonicClamp` — Path B baseline and clamps (SV3/SV4).
- `config.alpha` — solid-phase damping for memory (SV4).
- `config.biasDecay`, `config.biasStrength`, `config.biasRadius` — bias persistence and spatial influence (SV2/SV3).
- `config.forgivenessThreshold`, `config.forgivenessDamp` — kenotic damping trigger/strength (SV7/SV9).
- `config.lensWeights` and `presets` — four-lens weighting profiles (SV5/SV10).
- `config.delaySteps` — length of the delay line used for echo-like persistence (SV6/SV8).

## Testing Instructions
```bash
cd prototypes/AI_Deltas/LKB/LKB20250314A1B2
npm install
npm test
```
- **Smoke:** `simulation.test.js` ensures the session runner completes.
- **Unit:** `grid.test.js` checks neighbor averaging, forgiveness damping, and lens clamping.

## Limitations
- Headless only; no canvas/WebGL/UI. (Inference: renderer left for later deltas.)
- Bias uses procedural pulses instead of real audio (Inference acknowledging SV3 intent).
- Single-grid with delay-line echoes; full tri-grid cross-talk deferred (SV8 TODO).
- Metrics are console-only; no HUD/overlay (Inference).

## Source Vectors (SV1–SV10)
- SV1 — `docs/Parallel-Paradox-Design.md` (canonical map; anti-singularity, harmonic fusion).
- SV2 — `prototypes/LKB_POCs/readme.md` (PhaseCube constraints: bias as influence, minimalism).
- SV3 — `prototypes/LKB_POCs/phasecube_dreaming_0001.html` (audio bias mapping, tunables, UI cues).
- SV4 — `prototypes/Readme.md` (PhaseCube architecture, Path B/ALPHA config).
- SV5 — `Minimalaiagi.md` (four-lens framework for mixer weights).
- SV6 — `Minimalnode...wait...minimal.md` (swarm consensus + oracle metaphor informing delay/soft bias).
- SV7 — `Computation.md` (kenotic forgiveness operator guiding damping logic).
- SV8 — `prototypes/LKB_POCs/AI_Deltas/A6P9Q4/README.md` (tri-grid/delay guidance, lens stack tuning).
- SV9 — `prototypes/LKB_POCs/AI_Deltas/B4M7Q9/README.md` (forgiveness damping + bias decay constraints).
- SV10 — `prototypes/LKB_POCs/AI_Deltas/NCECI6/README.md` (lens fusion + trace/imprint modularity).

## Parent Delta IDs
- None. This delta is grounded directly on the sources above.
