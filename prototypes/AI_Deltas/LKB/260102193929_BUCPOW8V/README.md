# Delta 260102193929_BUCPOW8V — Headless Harmonic Bias Runner

## Purpose + Scope
- **Purpose:** Deliver a headless, lens-aware PhaseCube runner that keeps the "influence, not command" ethos while adding configurable forgiveness damping and audio-inspired bias pulses for observability-friendly iteration. (SV1/SV2/SV3/SV8)
- **Scope:** All artifacts live inside this delta folder. The runner stays Node-only, dependency-light, and focused on lattice logic plus JSON summaries; UI, WebGL, and real audio I/O are explicitly out-of-scope for this slice. (SV2/SV4/SV8)

## Upgrade Intent
- **Selected path:** Map audio-style pulses into a decaying bias field, blend them through a four-lens mixer to tune Path B probabilities and forgiveness, and emit headless summaries + witness samples. (SV3/SV4/SV6/SV8/SV9/SV10)
- **Why this fits the sources:**
  - Harmonic safety + lens fusion mandated by SV1 and reinforced by SV6/SV10.
  - Influence-only biasing with depth/pan semantics from SV2 + SV3 + SV4.
  - Headless, testable instrumentation from SV7 + SV8.
- **Success criteria for this delta:** deterministic pulses, tunable clamps, smoke/unit coverage, and a runnable CLI that prints JSON summaries without external assets.

## Architecture Overview
Text flow:
1) **Config** (`src/config.js`): Tunables for grid size, Path B clamps, forgiveness floor, bias decay/strength/radius, and pulse schedule.
2) **BiasField** (`src/bias.js`): Decays bias each step and injects radial pulses that map depth/pan → z/x per SV3, clamped to keep influence bounded.
3) **Lens mixer** (`src/lens.js`): Normalizes four lens weights and emits Path B, forgiveness, and bias coupling with harmonic brakes (SV1/SV6/SV10).
4) **PhaseLattice** (`src/lattice.js`): Plasma/liquid/solid arrays with parity, perturbations, and forgiveness-damped stepping that never overwrites state (SV2/SV7/SV10).
5) **Runner + CLI** (`src/runner.js`, `src/main.js`): Wires pulses → lens weights → lattice steps, samples witnesses, and prints JSON (SV4/SV8/SV9).

Simple diagram:
```
Pulses → BiasField → Lens mixer → Lattice perturb/step → Metrics + Witness
                     ↑                                   ↓
                 Config tunables                 JSON summary / stdout
```

## Happy-path Run Command
```bash
cd prototypes/AI_Deltas/LKB/260102193929_BUCPOW8V
npm start
```
Outputs a JSON blob with frames, final metrics, and witness samples. Tunables can be tweaked via env vars: `LKB_STEPS`, `LKB_GRID`, `LKB_PATH_B`, `LKB_FORGIVENESS`.

## Configuration Knobs / Tunables
- `gridSize` — lattice dimension (default 14).
- `steps` — simulation steps (default 240).
- `phases.flipProbability` / `parityProbability` — stochastic guards against collapse (SV2/SV5/SV7).
- `phases.basePathB`, `phases.pathBClamp` — bounds for difference-amplifying branch selection (SV3/SV5/SV10).
- `phases.alpha` — solid-memory damping (SV5/SV7).
- `phases.forgiveness` — harmonic damping baseline; `lens.forgivenessFloor` enforces a safety minimum (SV1/SV6/SV10).
- `bias.strength`, `bias.decay`, `bias.radius` — influence-only bias field shaping per audio semantics (SV2/SV3/SV4).
- `bias.pulses` — deterministic audio-style bursts with `time`, `depth`, `pan`, `amplitude` (SV3/SV4).
- `lens.biasGain`, `lens.dispersionThreshold` — adjust how strongly bias/dispersion tilt Path B and forgiveness (SV6/SV10).

## Testing Instructions
```bash
cd prototypes/AI_Deltas/LKB/260102193929_BUCPOW8V
npm test
```
- **Smoke:** Runs a short session to ensure bounded metrics and witness sampling.
- **Unit:** Verifies lens clamps (Path B bounds, forgiveness floor, bias coupling limits).

## Limitations
- Headless only: no canvas/audio/WebGL pipelines in this delta.
- Single-grid; no multi-grid coupling or persistent storage.
- Bias pulses are synthetic; live mic/file ingestion remains future work.

## Source Vectors (SV1–SV10)
| SV | Path/DeltaID | Why it matters |
| -- | ------------- | -------------- |
| SV1 | docs/Parallel-Paradox-Design.md | Canonical anti-singularity map; mandates harmonic safety and modular lenses. |
| SV2 | prototypes/LKB_POCs/readme.md | PhaseCube ethos of minimal, bounded, influence-not-command biasing. |
| SV3 | prototypes/LKB_POCs/phasecube_dreaming_0001.html | Audio depth/pan → bias mapping and visible seeding. |
| SV4 | prototypes/LKB_POCs/98E66S/js/main.js | Deterministic start, synth fallback, stereo-to-depth injection, FPS throttling. |
| SV5 | prototypes/LKB_POCs/98E66S/js/config.js | Central tunables (grid, path B, forgiveness) with modest defaults. |
| SV6 | prototypes/LKB_POCs/AI_Deltas/J8L2Q9/app.js | Lens-aware damping and silent synth fallback when mic is unavailable. |
| SV7 | prototypes/Toys/lkb_agi_0001.html | Minimal lattice loop with path B branching and snapshot-friendly state. |
| SV8 | prototypes/AI_Deltas/LKB/LKBX52D7M9Q3/README.md | Prior headless delta: lens mixer, forgiveness, bias pulses, JSON outputs. |
| SV9 | prototypes/LKB_POCs/AI_Deltas/T4H9K2/src/core/controller.js | Controller wiring for bias ingestion, memory blending, and autopilot-friendly ticks. |
| SV10 | prototypes/LKB_POCs/AI_Deltas/T4H9K2/src/core/phaseGrid.js | Forgiveness operator, bias-coupled Path B clamps, precomputed positions. |

## Parent Delta IDs
- None (fresh branch).

## Assumptions (Inference/Speculation)
- docs/Parallel-Paradox-Design.md stands in for a docs root README because no docs/README.md exists (Inference).
- Audio-like pulses are synthetic to keep the runner headless and deterministic (Inference).

