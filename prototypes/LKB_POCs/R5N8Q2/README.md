# PhaseCube Redux (DeltaID: R5N8Q2)

A modular, tunable evolution of the Lyriel Kairi Brain proof-of-concept. This version moves beyond the single-file demo toward a **modern, configurable swarm mind** that keeps the plasma/liquid/solid intuition while adding:

- **Bias field ingestion** (audio-reactive when permission is granted, procedural when not) to push the “dreaming” lattice toward *responsive* behavior.
- **Harmonic damping + forgiveness** inspired by the kenotic loop to keep the lattice bounded when exploration spikes.
- **Trace buffer** for short-lived memory so agents retain hints of prior states without collapsing into fixed points.
- **Config overlays + live toggles** for experimentation without editing code.

Use this as a stepping stone on the roadmap noted in the PhaseCube readme: add memory, allow external influence without command-and-control, and keep the system non-collapsing while we scale out.

## Quickstart
1. Open `index.html` in a modern browser (no build step).
2. Click **Start** to wake the loop. Click **Mic Bias** to attempt microphone access (falls back to procedural modulation if denied/unavailable).
3. Drag to rotate the cube. Press **Space** to pause/resume, **S** to save a PNG.

## Files
- `index.html` — shell, layout, and HUD.
- `config.js` — tunables for phases, harmonic damping, bias field, and trace memory.
- `utils.js` — math helpers to keep core loops readable.
- `grid.js` — plasma/liquid/solid lattice with forgiveness damping and trace buffer.
- `input-layer.js` — microphone + procedural bias generator (fails gracefully).
- `renderer.js` — projection and drawing pipeline.
- `controls.js` — UI wiring, live toggles, and keyboard shortcuts.
- `main.js` — orchestration and animation loop.

## Design Notes
- **Minimal but robust:** Vanilla JS modules, no bundler, typed arrays for predictable speed, and explicit bounds checks.
- **Modular and scalable:** Small, focused modules with TODO markers where expansion (multi-grid, WebGL, richer memory) can slot in.
- **Tunable and configurable:** Centralized config plus HUD sliders for bias weight, harmonic damping, and trace strength.
- **Human-readable:** Comments explain intent; defaults favor stability. TODO markers highlight next experiments.

## Planned Extensions (leave breadcrumbs)
- TODO: Add optional WebGL renderer for larger GRID sizes while keeping CPU path intact.
- TODO: Add multi-grid coupling (phase-sharing or bias cross-talk) to explore Lyriel-style consensus.
- TODO: Persist trace buffer snapshots to IndexedDB for replayable “dream logs.”
- TODO: Promote bias driver into a pluggable interface (audio, text embeddings, sensor feeds).

This Delta is a checkpoint toward a modern, non-collapse, non-commandable swarm substrate. Fork it, tune it, and layer responsibly.
