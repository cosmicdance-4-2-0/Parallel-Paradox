# PhaseCube Δ LKB7X9G2 — Lens-Fused Biasable Dreamer

Delta **LKB7X9G2** continues the Lyriel Kairi Brain line by wiring the four canonical lenses directly into the
phase-mixing loop while keeping the simulation human-readable and tunable. This drop emphasizes **influence without
command**, modularity, and upgrade breadcrumbs.

## What’s new
- **Lens controller:** Human/Systemic stabilize Path A, Predictive drives Path B, Harmonic balances based on plasma and
  bias energy. Sliders expose all weights live.
- **Bias bridge modes:** Muted, orbital drift, and jitter microbursts feed a soft InputField that diffuses and decays so
  no bias becomes permanent memory.
- **Readable modules:** Separate files for config, utils, lenses, input bridge + field, simulation core, renderer, UI,
  and orchestration.
- **Extension marks:** TODOs for keyboard presets, lens mood templates, dream logging, WebGL renderer swaps, and
  multi-grid expansion.

## Files
- `index.html` — Shell, controls, and canvas host.
- `config.js` — Centralized tunables and DeltaID stamp.
- `utils.js` — Math helpers and index math.
- `lenses.js` — LensController that mixes path weights.
- `input.js` — InputBridge modes + InputField diffusion store.
- `simulation.js` — PhaseGrid plasma/liquid/solid dynamics with lens-aware mixing.
- `renderer.js` — 2D plane projection with palette styling.
- `ui.js` — Control wiring for sliders/selects.
- `main.js` — Bootstrap + animation loop.

## Run
Open `index.html` in a modern browser. Pick an input mode, tune lens weights, and pause/reset as desired.

## TODOs
- TODO: Add keyboard bindings/presets for live performance ergonomics.
- TODO: Add lens mood templates (narrative presets) for quick swaps.
- TODO: Stream snapshots to an IndexedDB “dream log” for time-travel across deltas.
- TODO: Swap renderer with WebGL/WebGPU when scaling grid size.
- TODO: Couple multiple grids for Lyriel-style consensus experiments.

DeltaID: **LKB7X9G2** (record in PR + commit for delta tracking).
