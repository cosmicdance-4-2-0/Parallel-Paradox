# PhaseCube Delta — Dual-Lattice Harmonic Pilot (DeltaID: K7M9R2X)

This Delta iterates on the upgrade path in `prototypes/LKB_POCs/readme.md` by pairing **two coupled phase grids** (core + echo) with **forgiveness damping**, **short-term trace memory**, and a **bias driver** that can emulate audio influence without taking control. It remains browser-native, dependency-free, and human-readable while leaving TODO hooks for scaling toward the multi-grid and lens experiments seen in Delta A6P9Q4 and the modular layout of Delta 98E66S.

## Goals
- **Minimal but robust:** Vanilla ES modules and typed arrays, explicit clamping, and bounded noise keep the swarm predictable.
- **Modular and scalable:** Separate modules for config, bias, grid dynamics, metrics, rendering, controls, and orchestration.
- **Tunable and configurable:** On-screen sliders for Path B weight, forgiveness, cross-talk, bias strength, memory blend, and noise; presets live in `config.js`.
- **Traceable:** DeltaID (`K7M9R2X`) is embedded in the UI and config for delta tracking.

## Files
- `index.html` — Shell, layout, script entrypoint.
- `styles.css` — HUD-friendly theming.
- `js/config.js` — Defaults, presets, and DeltaID.
- `js/biasField.js` — Decaying bias grid with pulse helpers (simulates audio or external influence).
- `js/phaseGrid.js` — Plasma/liquid/solid lattice with forgiveness damping, path branching, and soft cross-talk.
- `js/metrics.js` — Lightweight energy/coherence metrics and trace memory helpers.
- `js/renderer.js` — Canvas renderer with simple camera orbit and overlays.
- `js/controls.js` — Slider wiring, buttons, and UI state reflection.
- `js/main.js` — Orchestrates grids, bias driver, metrics, rendering, and per-frame modulation.

## Quickstart
1. Open `index.html` in a modern browser (ES modules enabled).
2. Click **Start** to seed and animate. Use the sliders to tune Path B weight (explore vs. average), forgiveness (harmonic damping), cross-talk (core ↔ echo coupling), bias strength, memory blend, and noise.
3. Press **Pulse Bias** to inject a decaying influence (audio stand-in). Press **Reset** to reseed both grids. Press **Space** to pause/resume.

## Design highlights
- **Dual-lattice conversation:** The *core* grid steers stability while the *echo* grid exaggerates difference. Cross-talk passes softened gradients, not hard writes, mirroring the “influence-not-command” stance.
- **Harmonic safety:** Forgiveness damping trims amplification when local variance spikes, inspired by kenotic/fuse operators in `Computation.md` and recent deltas.
- **Trace memory:** A short trace buffer captures liquid-phase echoes for overlay and future replay experiments.
- **UI breadcrumbs:** Overlay shows DeltaID, FPS, energy/coherence, and active tuning values for fast iteration.

## Extension hooks
- TODO: Add WebGL instancing, for scaling to larger grids while keeping frame times low.
- TODO: Add real audio/mic bias injection, for sonified influence without overwriting internal state.
- TODO: Add per-grid lens weights (Human/Predictive/Systemic/Harmonic) to map PhaseCube behavior to the four-lens model.
- TODO: Add multi-grid (>2) coupling patterns (ring, hub, stochastic), for richer Lyriel consensus experiments.
- TODO: Persist trace memory to IndexedDB, for replaying or exporting “dream logs.”

DeltaID K7M9R2X keeps the swarm dreaming: bounded, interpretable, influenceable, and ready for the next iteration.
