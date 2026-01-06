# PhaseCube Delta DX7F9L2Q1A3B — Lens-Guided Tri-Grid Swarm

## Purpose and scope
- Implement a minimal **tri-grid swarm** with lens-weighted path selection and decaying audio-inspired bias to advance the PhaseCube upgrade path. The design keeps behavior bounded, interpretable, and influence-only (no hard control) per the decentralization ethos (SV1/SV2).
- Scope: Additive delta only within this folder. No external assets or repo-wide mutations. Parent deltas: _none_ (fresh branch point).

## Upgrade path selected
- **Tri-grid with harmonic stabilizer + exploratory echo:** Extends the multi-grid and delay-line concepts while keeping the system minimal (SV3, SV5–SV7).
- **Lens-style weighting for path selection:** Predictive vs. harmonic signals adjust exploratory bias and damping, echoing prior lens mixes (SV1, SV5, SV8).
- **Influence-only sensory bias:** Synthetic spectral bias fields decay quickly, mirroring audio influence patterns without overwriting state (SV2, SV4, SV8).

## Architecture overview
- **`src/config.js`** — Centralized tunables and DeltaID; `mergeConfig` enables future overrides.
- **`src/grid.js`** — PhaseGrid with plasma/liquid/solid states, parity-aware branching, and bounded updates; exposes basic metrics.
- **`src/bias.js`** — BiasField that decays over time and injects radial kernels from spectral frames (pan → x, frequency → z).
- **`src/lens.js`** — Lens mixer translating energy/divergence/coherence into path boosts and damping.
- **`src/engine.js`** — TriGridEngine coordinating core, echo, and harmonic grids; applies lens mix, bias, and grid-specific blends.
- **`src/render.js`** — Lightweight canvas renderer with rotating camera and on-canvas overlay for lens + metric readouts.
- **`src/main.js`** — Browser bootstrap wiring the loop, pause/inject controls, and synthetic bias pulses for demo without mic.

### Dependencies
- **Vite 5.2.0** for zero-config dev serving and ES module support (keeps browser demo trivial to run).
- **Vitest 1.6.0** for fast, dependency-light unit tests aligned with the ES module stack.

## How to run (happy path)
```bash
npm install
npm run dev
```
Then open the printed Vite dev URL (defaults to http://localhost:5173) and use **Pause** / **Inject Bias Pulse** to interact.

## Configuration knobs / tunables
- **Grid + dynamics:** `gridSize`, `basePathBias`, `alpha`, `noiseFlip`, `parityFlip`, `parityWeight`, `biasGain`, `harmonicClamp` (see `src/config.js`).
- **Bias field:** `decay`, `biasRadius`, `biasStrength`, `biasBins` (BiasField kernel strength/extent).
- **Lens mix:** `predictiveWeight`, `harmonicWeight`, `energyFloor/energyCeil`, `divergenceTarget` (lens sensitivity).
- **Rendering:** `render.pointSize`, `render.scale`, `render.visThreshold`.

## Testing instructions
```bash
npm test
```
- `tests/grid.test.js` — bounds and bias response for PhaseGrid.
- `tests/lens.test.js` — lens path boost and clamping behavior.
- `tests/smoke.test.js` — TriGridEngine tick smoke test on a small lattice.

## Limitations
- Input is synthetic (no live mic) to keep the delta dependency-light; plug real audio into `engine.tick({left,right})` as needed (Inference).
- Renderer is canvas-only and tuned for modest grids; WebGL or downsampled overlays are TODO items for scale (SV6/SV7 guidance).
- No persistence or storage; bias decays per frame to honor influence-overwrite constraint (SV2/SV8).

## Source Vectors (SV1–SV8)
- **SV1:** `docs/Parallel-Paradox-Design.md` — Canonical design and anti-singularity stance; honor decentralization and harmonic damping. Constraints: keep systems bounded, modular lens fusion, and avoid central control.
- **SV2:** `prototypes/LKB_POCs/readme.md` — Base PhaseCube description; treat inputs as influence-only and maintain non-collapsing dynamics. Constraints: no hard goals, avoid collapse, audio bias must not overwrite state.
- **SV3:** `prototypes/Readme.md` — PhaseCube system architecture and tunables. Constraints: preserve tunability (noise, path-B, damping) and toroidal lattice behavior.
- **SV4:** `prototypes/LKB_POCs/phasecube_dreaming_0001.html` — Audio bias mapping (freq→depth, pan→x) and analyzer-style overlays. Constraints: map spectral bands spatially; decay bias over time; keep overlays lightweight.
- **SV5:** `prototypes/LKB_POCs/AI_Deltas/A6P9Q4/README.md` — Lens-guided tri-grid dialogue with delay/echo layers. Constraints: multi-grid biasing, lens weights influencing mix, interpretability overlays.
- **SV6:** `prototypes/LKB_POCs/Q6P3R8/README.md` — Memory-biased feedback and structural plasticity hooks. Constraints: delay-style bias reinjection must remain soft; keep code human-readable and modular.
- **SV7:** `prototypes/LKB_POCs/V4H2J9/README.md` — Dual-grid with delayed bias and plasticity emphasis. Constraints: support cross-grid dialogue, keep damping safeguards, mark scale-up TODOs.
- **SV8:** `prototypes/LKB_POCs/AI_Deltas/J8L2Q9/README.md` — Harmonic stabilizer grid with audio bias and lens mixing. Constraints: add harmonic damping layer, allow audio-like bias injection, surface metrics for transparency.

## Parent delta IDs
- None; this delta is a new leaf rooted at the baseline sources (SV1–SV8).
