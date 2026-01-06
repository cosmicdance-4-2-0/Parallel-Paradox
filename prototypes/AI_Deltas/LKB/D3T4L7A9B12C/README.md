# PhaseCube Tri-Grid Lens Runner (DeltaID: D3T4L7A9B12C)

## Purpose and Scope
This delta implements a **lens-aware tri-grid swarm runner** that blends harmonic damping, delay-biased coupling, and bounded bias fields to extend the PhaseCube upgrade path. It keeps the lattice minimal, human-readable, and tunable while threading constraints from the canonical design map (SV1) and the PhaseCube ethos (SV2).

- **Upgrade path chosen:** Tri-grid dialogue with delay-fed bias and lens fusion to probe memory-biased influence without control. (SV4/SV5/SV6/SV7/SV8)
- **In scope:** Multi-grid orchestration (core/echo/memory), lens scheduler, delay-line biasing, CLI reports, and node-side tests.
- **Out of scope:** Browser rendering, audio drivers, persistence/IndexedDB, and GPU/WebGL scaling (left as TODOs).

## Architecture Overview
- **Config (src/config.js):** Central tunables (grid size, probabilities, damping, coupling, bias decay) and lens presets. (SV2/SV3)
- **Lenses (src/lenses.js):** Normalized profiles plus a scheduler that blends presets over time to avoid abrupt parameter jumps. (SV6)
- **Bias & Delay (src/biasField.js, src/delayLine.js):** Decaying bias volume with uniform/spherical injection and a delay line that replays recent influence as soft memory. (SV4/SV5)
- **PhaseGrid (src/phaseGrid.js):** Plasma/liquid/solid lattice with toroidal neighbors, stochastic perturbation, structural plasticity, and kenotic-style harmonic damping. (SV1/SV2/SV3/SV8)
- **MultiGridSwarm (src/multiGrid.js):** Orchestrates core/echo/memory grids, routes delay bias, and applies soft coupling from echo/memory back into the core bias field. (SV4/SV5/SV7)
- **CLI Runner (src/main.js):** Deterministic-friendly entrypoint that emits JSON summaries for quick inspection.

## How to Run
```bash
node src/main.js --steps 120 --seed 7 --bias 0.05
```
Outputs a JSON report with periodic metrics (energy/divergence) per grid and the active lens weights.

## Configuration Knobs / Tunables
Adjust defaults in `src/config.js` or override via `mergeConfig` in custom scripts:
- `gridSize` (default 16): lattice dimension; higher sizes cost cubic memory/CPU. (SV3)
- `flipProbability`, `parityProbability`: stochastic noise to prevent collapse. (SV2/SV3)
- `pathBProbability`, `alpha`: path branching vs. damping weights. (SV3)
- `forgiveness.threshold/strength`: harmonic damping trigger and intensity. (SV1/SV8)
- `bias.decay/gain`: bias field lifetime and influence strength. (SV4/SV7)
- `delay.length/decay`: depth and decay of replayed influence. (SV4/SV5)
- `coupling.echoToCore/memoryToCore`: soft cross-talk weights. (SV4/SV5/SV7)
- `plasticityProbability`: occasional plasma swaps for structural plasticity. (SV4)
- `lensPresets`: harmonic/exploratory/stable defaults; scheduler cycles them smoothly. (SV6)

## Testing Instructions
```bash
npm test
```
Runs Node’s built-in test runner across bias/delay, phase grid, and multi-grid orchestration cases.

## Limitations
- No browser renderer or audio driver; this delta is headless/CLI-only (inference for this context).
- No persistence or long-horizon replay; delay line is short and memory is soft bias only. (SV5/SV8)
- Plasticity is minimal (random plasma swaps) and intended as a placeholder for richer rewiring. (SV4)
- Scaling beyond modest grid sizes may require WebGL or workerization (TODO for future delta). (SV4/SV7)

## Source Vectors (SV1–SV8)
- **SV1:** `docs/Parallel-Paradox-Design.md` — design map enforcing anti-singularity stance, lens fusion, and forgiveness damping.
- **SV2:** `prototypes/LKB_POCs/readme.md` — PhaseCube ethos of bias-overwrite separation and non-collapse via noise.
- **SV3:** `prototypes/Readme.md` — PhaseGrid parameters, toroidal neighbors, and damping via `ALPHA`.
- **SV4:** `prototypes/LKB_POCs/V4H2J9/README.md` — dual-grid coupling, delay-driven bias, and structural plasticity constraints.
- **SV5:** `prototypes/LKB_POCs/Q6P3R8/README.md` — tri-grid dialogue and memory bias with harmonic safeguards.
- **SV6:** `prototypes/LKB_POCs/AI_Deltas/T4H9K2/README.md` — lens scheduler and echo bias bus for smooth modulation.
- **SV7:** `prototypes/LKB_POCs/AI_Deltas/M8K3Z1/README.md` — lens-weighted dynamics, bias field decay, and echo coupling.
- **SV8:** `prototypes/LKB_POCs/AI_Deltas/NCECI6/README.md` — lens fusion with trace/imprint memory and forgiveness damping.

## Parent Delta IDs
None; this delta starts a new branch.
