# LKBX24M9Q7P1 — Lens-Aware Multi-Grid PhaseCube Delta

## Purpose & Scope
This delta delivers a modular, lens-guided, tri-grid PhaseCube iteration that keeps the dreaming, influence-not-command ethos intact while adding delay-biased coupling and harmonic safeguards (SV1/SV2). It focuses on tunable lens fusion, soft cross-talk between core/echo/memory grids, and interpretable metrics without introducing goal-seeking behavior (SV3/SV5/SV6/SV7).

### Upgrade path selected
- Elevate four-lens modulation into the update loop with preset weighting and live rebalancing, per the LensBridge and lens-guided tri-grid deltas (SV3/SV7).
- Maintain tri-grid dialogue with delayed bias recycling and structural plasticity hooks to keep the swarm adaptive yet bounded (SV5/SV6).
- Preserve forgiveness damping, influence-only bias injection, and upgrade hooks for WebGL/audio expansion (SV2/SV4/SV8).

### In-scope
- Node-friendly simulation modules (ESM) for core/echo/memory grids, bias fields, delay lines, and lens fusion.
- Config-first tunables with a demo runner for quick inspection.
- Tests for lattice safety, bias decay, lens responsiveness, and smoke validation.

### Out-of-scope
- Browser UI or WebGL renderer (TODO placeholder left in code for future scaling; SV6/SV7).
- Audio/file input drivers (TODO placeholder; SV3/SV7).
- Persistent storage or long-horizon replay (inference; future experiment).

## Architecture Overview
- `src/config.js`: Central defaults (grid size, damping, lens caps, bias/delay gains) with DeltaID tagging.
- `src/utils.js`: Small math helpers (clamp, wrapIndex, variance, copies).
- `src/bias-field.js`: Influence-only bias storage with decay/diffusion and pulse injection (SV2/SV8).
- `src/delay-line.js`: Rolling buffer that blends historical energy back as soft bias (SV5/SV6).
- `src/lens.js`: Four-lens fusion translating energy/coherence/divergence into bias gain, cross-talk gain, forgiveness boost, and path blending (SV1/SV3/SV7).
- `src/grid.js`: PhaseGrid with plasma/liquid/solid/trace phases, harmonic forgiveness, tunable path blending, and structural plasticity rewiring (SV4/SV5/SV8).
- `src/swarm.js`: MultiGridSwarm orchestrating core/echo/memory grids, lens-driven controls, cross-talk fields, and delay feedback (SV3/SV5/SV6).
- `src/demo.js`: CLI-friendly loop to step the swarm and print aggregate metrics; serves as a smoke runner.

## How to Run (happy path)
```bash
cd prototypes/AI_Deltas/LKB/LKBX24M9Q7P1
npm install     # installs vitest for tests; requires registry access
npm run demo    # runs a short CLI simulation with printed metrics
```

## Configuration Knobs / Tunables
- `grid.size`, `plasmaNoise`, `liquidCoupling`, `pathBlend`, `forgivenessThreshold`, `forgivenessDamping`, `traceBlend`, `solidBlend`, `plasticityProbability` (SV4/SV5/SV8).
- `bias.decay`, `bias.diffusion`, `bias.radius`, `bias.injectionStrength` (SV2/SV8).
- `delay.length`, `delay.decay`, `delay.gain` (SV5/SV6).
- `swarm.crossTalk`, `swarm.memoryBiasGain`, `swarm.metricSmoothing` (SV5/SV6).
- `lens.baseWeights`, `lens.maxBiasGain`, `lens.maxCrossTalkGain`, `lens.forgivenessBoost`, `lens.pathBlendBoost` (SV1/SV3/SV7).

## Testing Instructions
```bash
cd prototypes/AI_Deltas/LKB/LKBX24M9Q7P1
npm test        # runs vitest unit + smoke tests
```
If npm registry access is restricted, tests may not install (environmental constraint); the code remains dependency-light (only Vitest) to honor minimalism (SV2).

## Limitations
- CPU-only; no WebGL acceleration yet (TODO in `grid.js`; SV6/SV7).
- No browser HUD/renderer; demo is CLI-only (inference).
- Audio/file bias drivers are placeholders for future deltas (TODO in `swarm.js`; SV3/SV7).
- npm installs depend on registry availability (environmental).

## Dependencies
- `vitest@^1.6.0` (dev): lightweight test runner for unit/smoke coverage; pinned caret range balances stability with patch updates (SV2 emphasis on minimal, readable tooling).

## Source Vectors (SV1–SV8)
- **SV1 — docs/Parallel-Paradox-Design.md:** Canonical design map; keep decentralized, harmonic, four-lens framing and anti-singularity stance.
- **SV2 — prototypes/LKB_POCs/readme.md:** Base PhaseCube ethos; influence-not-command biasing, non-collapse via noise/decay, minimal and inspectable.
- **SV3 — prototypes/LKB_POCs/AI_Deltas/NCECI6/README.md:** LensBridge; tunable four-lens fusion, dual memory, bias routed through Systemic lens, forgiveness damping.
- **SV4 — prototypes/LKB_POCs/K5N3Q8/README.md:** Pathfinder; config-first modularity, harmonic forgiveness, trace memory, bias as influence-only.
- **SV5 — prototypes/LKB_POCs/Q6P3R8/README.md:** Memory-Biased Swarm; tri-grid dialogue, delay-driven bias, structural plasticity, interpretability overlays.
- **SV6 — prototypes/LKB_POCs/V4H2J9/README.md:** Memory-Biased Dual Swarm; coupled grids exchanging soft bias, bounded delay-line feedback, metrics for legibility.
- **SV7 — prototypes/LKB_POCs/AI_Deltas/A6P9Q4/README.md:** Lens-guided tri-grid; lens modulation of updates, shared delay lines, soft cross-grid nudges, TODOs for audio/WebGL.
- **SV8 — prototypes/LKB_POCs/98E66S/README.md:** Modular PhaseCube delta; forgiveness damping, tunable path blending, configurable bias radius/decay/strength.

## Parent Delta IDs
- None (new branch from baseline POCs).

## CHANGELOG
See `CHANGELOG.md` for delta-specific updates versus the baseline PhaseCube README (SV2) and referenced deltas.
