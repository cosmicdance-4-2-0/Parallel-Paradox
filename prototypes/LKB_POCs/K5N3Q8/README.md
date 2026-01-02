# PhaseCube Pathfinder (DeltaID: K5N3Q8)

A modular, tunable proof-of-concept that advances the Lyriel Kairi Brain roadmap without sacrificing the minimal, browser-native spirit of PhaseCube. This version leans into the planned upgrade path called out in the PhaseCube README: **memory layers**, **biasable inputs that never seize control**, **harmonic safety (forgiveness)**, and **hooks for multi-grid or richer renderers**.

## Why this Delta
- **Minimal but robust:** Vanilla ES modules, typed arrays, and explicit bounds checks keep the loop predictable. No build step.
- **Modular and scalable:** Discrete files for config, math helpers, grid dynamics, bias drivers, rendering, controls, and orchestration. Comments mark TODOs for scale-outs (WebGL, multi-grid, persistence).
- **Tunable and configurable:** Central `config.js` plus on-screen sliders/buttons for harmonic damping, bias weight, and trace memory depth.
- **Human-readable:** Straightforward functions, no magic numbers hidden in-line, and TODO breadcrumbs for future contributors.

## Quickstart
1. Open `index.html` in a modern browser.
2. Click **Start**. Use **Mic Bias** to request audio access; it gracefully falls back to a procedural bias field if denied.
3. Drag to rotate. Press **Space** to pause/resume. Press **S** to save a PNG snapshot.

## File map
- `index.html` — Shell, layout, and script imports.
- `config.js` — All tunables (grid size, noise, damping, bias field behavior, render options).
- `utils.js` — Math helpers for projection, smoothing, and randomness.
- `grid.js` — Plasma/liquid/solid lattice with harmonic forgiveness, trace buffer, and bias injection.
- `input-layer.js` — Microphone + procedural bias driver that diffuses energy into the lattice without seizing control.
- `renderer.js` — Canvas-based projection with depth sorting and color coding for phase/parity. TODO hooks for WebGL expansion.
- `controls.js` — UI wiring for buttons/sliders and keyboard shortcuts.
- `main.js` — Orchestrates initialization, animation loop, and cross-module wiring.

## Design notes
- **Bias stays influence-only:** Bias fields modulate probabilities and local energy but never overwrite state. Safety-first by design.
- **Harmonic forgiveness:** A damping term reduces amplification when local variance spikes, keeping the swarm bounded.
- **Trace memory:** An adjustable trace buffer keeps short-term echoes without collapsing into fixed points.
- **Upgrade breadcrumbs:** TODO comments highlight where to plug in WebGL rendering, multi-grid coupling, or richer input sources.

## Planned extensions
- TODO: Swap the 2D canvas renderer for a WebGL path when GRID grows beyond ~24^3.
- TODO: Add multi-grid coupling (phase cross-talk) to mirror Lyriel consensus experiments.
- TODO: Persist trace snapshots to IndexedDB for replayable “dream logs.”
- TODO: Promote the bias driver into a pluggable interface (text embeddings, sensor streams).
- TODO: Add lens-inspired weighting presets to map the four-lens model onto plasma/liquid/solid blending.

> Keep it dreaming, not converging. Tune, observe, iterate—responsibly.
