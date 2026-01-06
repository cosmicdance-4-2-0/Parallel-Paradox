# LKBDELTA240401A — Bias-Tuned Forgiveness Lattice

## Purpose & Scope
This delta adds a modular, Node-friendly PhaseCube-inspired lattice with configurable bias fields, harmonic forgiveness damping, and lens-ready hooks while keeping the influence-not-command ethos (SV1/SV2/SV7). It targets quick CLI inspection and testable dynamics rather than browser rendering, providing a clean base for future audio/WebGL overlays (SV3/SV9). No parent deltas; this is a fresh branch in the LKB delta lineage.

### Upgrade path selected
- Layer configurable bias/diffusion plus forgiveness damping to keep the swarm bounded and influence-only (SV2/SV7/SV10).
- Add lightweight harmonic lens adjustments that modulate path blending and damping without introducing goals (SV1/SV5/SV6).
- Provide a CLI demo and test harness for regression-safe iteration before UI work (SV3/SV9).

### In-scope
- Single-grid lattice with bias field, forgiveness gate, and lens-ready adjustments.
- Config-first tunables surfaced in `src/config.js` and consumed by `src/demo.js`.
- Unit + smoke tests covering bias decay, lattice safety, and NaN-free stepping.

### Out-of-scope
- Browser/WebGL renderer or HUD overlays (planned hook; SV3 inference).
- Audio/file input drivers (left for later deltas; SV3).
- Multi-grid coupling or storage of long-horizon memory (Inference: earmarked TODO for future expansion).

## Architecture Overview
- `src/config.js`: Defaults and override helper, including bias/lens/run tunables and DeltaID tag (SV2/SV7).
- `src/utils.js`: Math helpers for clamping, wrapping, indexing, neighbor averages, and variance (SV4/SV8).
- `src/bias-field.js`: Influence-only bias field with radius-based injection, decay, and diffusion (SV2/SV7).
- `src/lens-hooks.js`: Harmonic lens shim that scales damping and exploration based on variance/bias energy (SV1/SV5/SV6).
- `src/phase-grid.js`: Ternary lattice update loop with parity noise, Path A/B blending, forgiveness gating, and point-cloud export (SV2/SV4/SV10).
- `src/simulator.js`: Orchestrates grid + bias, schedules perturbations and bias pulses, and returns metrics (SV7/SV9).
- `src/demo.js`: CLI runner printing step-wise metrics for quick inspection (SV3/SV9).
- `tests/`: Vitest suite for bias decay, lattice bounding, and smoke validation.

## How to Run (happy path)
```bash
cd prototypes/AI_Deltas/LKB/LKBDELTA240401A
npm install
npm run demo
```

## Configuration Knobs / Tunables
- `gridSize`, `flipProbability`, `parityProbability`, `parityKick` — noise + asymmetry (SV2/SV8).
- `pathBlend`, `solidBlend` — balance Path A/B blending vs damping (SV4/SV7).
- `forgivenessThreshold`, `forgivenessDamping` — harmonic guardrail activating on high variance (SV1/SV10).
- `bias.decay`, `bias.diffusion`, `bias.radius`, `bias.strength`, `biasGain` — influence-only bias shaping (SV2/SV7).
- `lens.harmonicBoost`, `lens.exploratoryBoost` — soft modulation of damping and exploration (SV5/SV6).
- `run.steps`, `run.biasPulseEvery` — demo cadence (SV9).

## Testing Instructions
```bash
cd prototypes/AI_Deltas/LKB/LKBDELTA240401A
npm test
```

## Limitations
- CLI-only; no renderer or audio pipeline yet (planned expansion; SV3 inference).
- Single-grid simulation; multi-grid coupling and persistent memory buffers are TODOs (SV7 inference).
- npm install requires registry access; offline runs will need cached modules (environmental limitation).

## Source Vectors (SV1–SV10)
- **SV1 — docs/Parallel-Paradox-Design.md:** Canonical design map; keeps decentralized, harmonic framing and anti-singularity posture. (Constraints: decentralized/ bounded; four-lens scaffold; interpretability focus.)
- **SV2 — prototypes/LKB_POCs/readme.md:** Base PhaseCube ethos; dreaming swarm, influence-not-command inputs, and ternary phases. (Constraints: preserve ternary lattice, bounded randomness, bias as influence.)
- **SV3 — prototypes/LKB_POCs/phasecube_dreaming_0001.html:** Reference UI/prototype with audio bias and tunables. (Constraints: expose tunables; keep bias decay/radius concepts; maintain renderer/state separation for future overlays.)
- **SV4 — prototypes/Readme.md:** Architecture/parameter rationale for grid, Path A/B, and damping. (Constraints: toroidal neighbors; Path B as difference amp; solid blending for stability.)
- **SV5 — Minimalaiagi.md:** Four-lens framework and harmonic stabilization guidance. (Constraints: modular lens fusion; perception→lens→fusion flow; harmonic stabilization.)
- **SV6 — Minimalnode...wait...minimal.md:** Swarm/consensus framing using stochastic oracle-like selection. (Constraints: noise as safety; gossip-style propagation; avoid fixed leaders.)
- **SV7 — prototypes/LKB_POCs/98E66S/README.md:** Modular delta with forgiveness damping and configurable bias. (Constraints: forgiveness gating; configurable bias radius/decay; TODO markers for expansion.)
- **SV8 — prototypes/Toys/lkb_agi_0001.html:** Minimal PhaseCube rewrite with parity flips and simple controls. (Constraints: concise implementation; parity/plasma noise; lightweight rotation/controls ethos.)
- **SV9 — prototypes/AI_Deltas/LKB/LKBX24M9Q7P1/README.md:** Lens-aware tri-grid delta with CLI demo/testing. (Constraints: config-first tunables; influence-only bias; CLI demo/test harness for regression.)
- **SV10 — Computation.md:** Kenotic forgiveness operator guiding damping on dispersion. (Constraints: trigger forgiveness on variance; clamp to avoid singularities; log forgiveness for interpretability.)

## Parent Delta IDs
- None (new branch; no parent lineage). 

## Dependency Rationale
- **vitest@^1.6.0 (dev):** Lightweight, readable test runner to validate lattice safety and bias dynamics while keeping the stack minimal (SV8 minimalism, SV9 test harness pattern). Version pinned with caret for patch-level updates without major surprises.

## TODO markers
- TODO: Add browser/WebGL renderer and audio drivers, keeping bias influence-only (SV3/SV7), to visualize the lattice.
- TODO: Extend to multi-grid coupling and longer-horizon memory buffers once CLI behavior is stable (SV7).
