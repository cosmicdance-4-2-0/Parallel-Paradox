# Delta 260102193932_UAOPAG61 — Harmonic Tri-Grid Bias Runner

## Purpose & Scope
This delta delivers a headless, testable runner that extends the PhaseCube ethos with **lens-gated biasing**, **tri-grid dialogue**, and **delay-fed memory influence** while keeping the influence-not-command stance intact (SV1, SV2, SV4, SV8). Work is fully contained within this delta folder and favors commodity-safe defaults (SV5).

## Upgrade Path Selected
- **Path:** Lens-gated tri-grid swarm with delay-line memory and oracle sampling that maps audio-inspired pulses into bounded bias fields. This follows the tri-grid and delay-line direction in SV4/SV6, the lens/forgiveness clamps in SV8/SV9, and the input-mapping semantics from SV3/SV10.
- **Why:** The combination advances interpretability (oracle snapshots, metrics), keeps inputs influential but non-destructive, and preserves harmonic safeguards against collapse (SV1, SV7, SV8).

### Scope Boundaries
- **In-scope:** Headless simulation loop, JSON/console summaries, tunable config, bias pulse ingestion, lens mixer, delay-line memory, oracle sampling, and smoke/unit tests.
- **Out-of-scope:** Browser/WebGL rendering, real microphone/file IO, and multiplayer/network synchronization. These remain future TODOs.

### Success Criteria for This Delta
- CLI/Node entrypoint that runs a tri-grid session with bounded biasing and emits a metrics summary.
- Documented tunables with defaults that run without GPU or external deps.
- Tests cover the smoke path and a core logic function (lens mixing/bias decay).

## Architecture Overview
- **`src/config.js`** — DeltaID + tunables (grid size, flip/parity probabilities, Path B clamps, bias decay/strength/radius, lens weights, forgiveness threshold, delay length). (SV5, SV8)
- **`src/bias.js`** — Decaying bias field that maps pulses (pan/depth/amplitude) into a toroidal grid and clamps magnitude. (SV3, SV8)
- **`src/lens.js`** — Four-lens mixer producing pathB probability, damping, and bias gain from metrics (energy, dispersion, bias load) with kenotic forgiveness. (SV1, SV7, SV8, SV9)
- **`src/grid.js`** — Periodic phase lattice with perturb → step → metrics → oracle selection; consumes lens mix and blended bias. (SV2, SV7, SV9, SV10)
- **`src/delay.js`** — Delay line storing decaying bias snapshots for memory-biased influence. (SV4, SV6)
- **`src/swarm.js`** — Orchestrates core/echo/memory grids, blends bias with delay/crosstalk, and returns per-step metrics. (SV4, SV6, SV8)
- **`src/main.js`** — CLI entry; runs a session, prints summary JSON, and exports `runSession` for tests. (SV3, SV8)

```
          pulses ──► bias field ─┐
                                ▼
                 delay line ◄─ bias blend ─► core grid ─► metrics/oracle
                                ▲                │
                   crosstalk ◄──┘                ▼
                                          echo + memory grids
```

## Run / Demo
> Happy path (headless): installs no external deps.
```bash
cd prototypes/AI_Deltas/LKB/260102193932_UAOPAG61
npm install  # noop, kept for symmetry
npm start
```
Outputs a JSON summary with energy/dispersion traces and oracle samples.

## Configuration Knobs / Tunables
- `gridSize` — lattice dimension (default 12) to keep CPU-friendly (SV5).
- `flipProbability` / `parityProbability` — stochastic guards to avoid collapse (SV2, SV7).
- `path.baseB`, `path.min`, `path.max` — Path B clamps per lens mix (SV3, SV5, SV9).
- `alpha` / `memoryAlpha` — damping for liquid→solid blending (SV5, SV7, SV10).
- `bias.decay`, `bias.strength`, `bias.radius`, `bias.maxMagnitude` — transient influence parameters (SV3, SV8).
- `lensWeights` — human/predictive/systemic/harmonic weights controlling path/damping (SV1, SV8, SV9).
- `forgiveness.dispersionThreshold`, `forgiveness.floor` — kenotic clamp when dispersion spikes (SV1, SV8).
- `delay.length`, `delay.decay`, `memoryWeight`, `crosstalkWeight` — bias blending from history and echo grid (SV4, SV6).
- `steps`, `sampleCount` — session length and oracle sample size.

## Testing
```bash
cd prototypes/AI_Deltas/LKB/260102193932_UAOPAG61
npm test
```
- **Smoke:** Runs a short session and ensures outputs exist.
- **Unit:** Verifies lens mixing clamps probabilities/damping and bias decay behavior.

## Limitations
- Headless only; no HTML/WebGL renderer yet (future work).
- Pulses are synthetic; microphone/file ingestion is deferred.
- No persistent storage beyond process lifetime.
- Structural plasticity hooks are noted but not yet implemented.

## Source Vectors
- SV1 — docs/Parallel-Paradox-Design.md
- SV2 — prototypes/LKB_POCs/readme.md
- SV3 — prototypes/LKB_POCs/phasecube_dreaming_0001.html
- SV4 — prototypes/LKB_POCs/Q6P3R8/main.js
- SV5 — prototypes/LKB_POCs/Q6P3R8/config.js
- SV6 — prototypes/LKB_POCs/Q6P3R8/README.md
- SV7 — prototypes/Toys/Galaxybrain_minimal.py
- SV8 — prototypes/AI_Deltas/LKB/LKBX52D7M9Q3/README.md
- SV9 — prototypes/AI_Deltas/LKB/LKBX52D7M9Q3/src/grid.js
- SV10 — prototypes/Toys/lkb_agi_0001.html

## Parent Delta IDs
- None

## Assumptions
- docs/Parallel-Paradox-Design.md stands in for the docs root README (SV1). (Inference)
- Node.js ≥18 is available for the built-in test runner. (Inference)
