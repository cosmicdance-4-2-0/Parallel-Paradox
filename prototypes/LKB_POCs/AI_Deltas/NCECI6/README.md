# PhaseCube LensBridge (DeltaID: NCECI6)

A modular, lens-aware iteration of the Lyriel Kairi Brain proof-of-concept that pushes the **planned upgrade path** toward configurable fusion and richer short-term memory while staying browser-native and dependency-free.

## Why this Delta
- **Lens fusion:** Brings the four-lens framing (Cognitive, Predictive, Systemic, Harmonic) into the update loop with tunable weights and preset profiles.
- **Bias plumbing:** Keeps audio/procedural bias but routes it through the Systemic lens so influence never becomes command-and-control.
- **Dual memory tracks:** Adds a slow imprint buffer alongside the fast trace buffer so we can experiment with short-term recall without collapse.
- **Forgiveness damping:** Applies kenotic-style damping per cell when divergence spikes, keeping the lattice bounded as we scale parameters.
- **HUD + sliders:** Live controls for lens profiles, harmonic weight, bias gain, and trace strength to encourage safe tinkering.

## Quickstart
1. Open `index.html` in a modern browser.
2. Click **Start** to wake the loop.
3. Optional: click **Mic Bias** to request audio input (falls back to procedural bias if denied).
4. Drag to rotate. Press **Space** to pause/resume, **S** to save a PNG.

## Files
- `index.html` — Shell and HUD wiring.
- `config.js` — Central tunables, lens profiles, and rendering defaults.
- `utils.js` — Math helpers and position builder.
- `lens.js` — Four-lens fusion with preset profiles and per-frame weight adjustment.
- `grid.js` — Plasma/liquid/solid lattice with bias injection, trace+imprint memory, and forgiveness damping.
- `input-layer.js` — Microphone + procedural bias drivers (graceful fallback).
- `renderer.js` — Projection, coloring, and drawing pipeline.
- `controls.js` — UI wiring, live sliders, and keyboard shortcuts.
- `main.js` — Orchestration and animation loop.

## Design Notes
- **Minimal but robust:** Vanilla JS modules, typed arrays, and explicit bounds checks keep it readable and fast without bundlers.
- **Modular and scalable:** Clear seams for swapping renderers, adding multi-grid coupling, or extending lens math.
- **Tunable and configurable:** Centralized config plus HUD sliders for lens harmony, bias gain, and trace strength; profiles encourage safe presets.
- **Human-readable:** Comments explain intent; TODO markers flag likely next upgrades.

## Breadcrumbs for the next Delta
- TODO: Add WebGL renderer behind a feature flag to push GRID beyond CPU comfort.
- TODO: Make lens profiles user-editable (JSON import/export) to share experiments.
- TODO: Persist trace/imprint snapshots to IndexedDB for replayable “dream logs.”
- TODO: Add multi-grid cross-talk (diffusive or competitive) to explore Lyriel consensus behaviors.
