# Delta LKBX52D7M9Q3 — Lens-Gated Bias with Kenotic Forgiveness

## Purpose + Scope
- **Purpose:** Advance the Lyriel/PhaseCube upgrade path with a headless, testable lattice runner that blends lens-aware Path B tuning, decaying bias pulses, kenotic forgiveness damping, and oracle-style witness snapshots. (Per SV1/SV2/SV3/SV4/SV5/SV6/SV7.)
- **Scope:** All work is additive inside this delta folder. The runner stays headless and dependency-light while exposing metrics/logs for downstream renderers. Procedural audio-like pulses stand in for real audio (Inference noted).

## Upgrade Intent
- **Selected path:** Headless lattice instrumentation that routes influence through lens mixing, clamps Path B via harmonic feedback, and logs distributed "oracle" witnesses instead of adding UI chrome. (SV1/SV2/SV3/SV4/SV5/SV6/SV7/SV8/SV9/SV10.)
- **In-scope:**
  - Lens mixer controlling Path B probability, damping, and bias gain from energy/dispersion/bias metrics. (SV4/SV5/SV7/SV9/SV10.)
  - Decaying bias pulses mapped to depth/pan to mimic SV3's audio influences without overwriting state. (SV2/SV3/SV8/SV9.)
  - Forgiveness damping triggered by dispersion thresholds plus logging of forgiveness events. (SV1/SV7/SV8/SV9.)
  - Trace-style auxiliary memory layered on plasma/liquid/solid to mirror trace/imprint ideas. (SV4/SV9/SV10.)
  - Oracle-style witness sampling for lineage-friendly snapshots. (SV6.)
- **Out-of-scope:**
  - Browser UI/WebGL rendering; outputs are console logs/JSON only. (Inference.)
  - True microphone/file audio ingestion; procedural pulses approximate audio bias. (Inference.)
  - Multi-grid coupling or cross-delta packaging; this iteration stays single-grid and headless.

## Architecture Overview
- `src/config.js` — DeltaID, tunables (grid size, bias decay/strength/radius, Path B range, lens weights, forgiveness thresholds, pulse schedule), helpers for coordinate math. (SV2/SV3/SV4/SV9.)
- `src/bias.js` — Decaying radial bias field with toroidal distance, providing transient influence-only pulses. (SV2/SV3/SV8.)
- `src/lens.js` — Four-lens mixer normalizing weights and emitting Path B probability, damping (forgiveness), and bias gain from current metrics. (SV5/SV7/SV9/SV10.)
- `src/grid.js` — Plasma/liquid/solid + trace arrays with stochastic perturbations, Path B branching, harmonic damping, and trace persistence; includes oracle-style witness sampler. (SV4/SV6/SV7/SV9/SV10.)
- `src/runner.js` — Headless loop wiring bias pulses → lens mix → perturb/step → metrics logging; exposes `runSession` and prints a JSON summary on `npm start`. (SV1/SV2/SV3/SV8.)

## How to Run (happy path)
```bash
cd prototypes/AI_Deltas/LKB/LKBX52D7M9Q3
npm install  # no external deps; uses built-in Node APIs
npm start
```
Outputs a JSON summary after a short session (default 180 steps). Use `NODE_OPTIONS=--trace-warnings` if you want runtime diagnostics.

## Configuration Knobs / Tunables
- `config.gridSize` — lattice dimension (default 12).
- `config.flipProbability`, `config.parityProbability` — stochastic noise guards to prevent collapse (SV2/SV4).
- `config.basePathB`, `config.pathBRange` — baseline and clamps for difference-amplifying Path B (SV4/SV9).
- `config.alpha`, `config.traceAlpha` — damping for solid and trace memory (SV4/SV10).
- `config.bias.decay`, `.strength`, `.radius` — transient bias field tuning (SV2/SV3/SV8).
- `config.forgiveness.dispersionThreshold`, `.floor` — kenotic damping trigger and minimum clamp (SV7/SV9).
- `config.lensWeights` — four-lens weighting for exploration vs. stability (SV5/SV9).
- `config.biasGain.base`, `.boost` — scaling for how much bias influences the lattice (SV2/SV3).
- `config.pulseSchedule` — list of time-indexed pulses with `pan` (x), `depth` (z), and `amplitude` mapping SV3's audio semantics.

## Testing Instructions
```bash
cd prototypes/AI_Deltas/LKB/LKBX52D7M9Q3
npm test
```
- **Smoke:** Ensures the session runner completes and emits witness frames.
- **Unit:** Bias decay, lens clamps, and toroidal neighbor sampling are validated.

## Limitations
- Headless only; rendering/HUD/WebGL are deferred to later deltas. (Inference.)
- Procedural pulses approximate audio and ignore real mic/file signals. (Inference.)
- Single-grid; no multi-grid or repository sync yet. (Inference.)
- Metrics are console/JSON only; no persistent storage beyond the process run. (Inference.)

## Source Vectors (SV1–SV10)
- **SV1** — `docs/Parallel-Paradox-Design.md` (canonical map; harmonic safety, anti-singularity).
- **SV2** — `prototypes/LKB_POCs/readme.md` (PhaseCube ethos: minimal, bounded, influence-not-command bias).
- **SV3** — `prototypes/LKB_POCs/phasecube_dreaming_0001.html` (audio bias mapping, HUD overlays, tunable controls).
- **SV4** — `prototypes/Readme.md` (PhaseCube architecture and Path B/ALPHA defaults).
- **SV5** — `Minimalaiagi.md` (four-lens fusion with harmonic stabilizer).
- **SV6** — `Minimalnode...wait...minimal.md` (oracle/witness framing for swarm consensus).
- **SV7** — `Computation.md` (kenotic forgiveness operator for damping on dispersion spikes).
- **SV8** — `prototypes/AI_Deltas/LKB/LKB20250314A1B2/README.md` (headless lens mixer, bias pulses, delay echoes).
- **SV9** — `prototypes/AI_Deltas/LKB/D7X2LQ8/README.md` (lens-tuned harmonic memory, influence-only bias controls).
- **SV10** — `prototypes/LKB_POCs/AI_Deltas/NCECI6/README.md` (dual trace/imprint memory, modular JS seams, bias routing).

## Parent Delta IDs
- None (this delta is rooted directly on SV1–SV10).
