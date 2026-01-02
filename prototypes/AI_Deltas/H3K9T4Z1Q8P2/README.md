# PhaseCube — Harmonic Lens + Kenotic Bias (DeltaID: H3K9T4Z1Q8P2)

This delta iterates the planned upgrade path outlined in `prototypes/LKB_POCs/readme.md` and the recent multi-grid/memory explorations under `prototypes/LKB_POCs` by adding a **harmonic lens modulator**, a **kenotic damping bias**, and a **bounded delay line** to the influence-only pipeline. The goal remains minimal, modular, tunable, and human-readable while keeping collapse avoidance first-class.

## What changed in this Delta
- **Harmonic lens modulation:** A small `HarmonicLens` observes coherence/divergence and adjusts path branching plus damping to prevent runaway sync or collapse.
- **Kenotic biasing:** A forgiveness-style clamp softens bias when dispersion spikes, echoing the kenotic motif from `docs/Parallel-Paradox-Design.md`.
- **Bounded delay line:** Recent influence fields are blended back as gentle bias, giving short-term memory without overwriting agent state.
- **Dual-grid dialogue:** Core and echo grids exchange softened bias to keep patterns lively without central control.
- **DeltaID surfaced:** UI and comments include DeltaID `H3K9T4Z1Q8P2` for traceable iteration tracking.

## Files
- `index.html` — Lightweight shell and canvas.
- `config.js` — Centralized defaults and a helper to derive runtime config.
- `grid.js` — PhaseGrid implementation with parity-aware branching and kenotic damping.
- `bias.js` — BiasField and DelayLine to ingest, diffuse, and decay influence.
- `harmonic.js` — HarmonicLens that modulates probabilities from live metrics.
- `renderer.js` — 2D canvas renderer plus overlay for metrics and DeltaID.
- `controls.js` — Minimal UI wiring for tunables and snapshots.
- `main.js` — Orchestrates the swarm loop, audio-free synthetic nudges, and cross-grid exchange.

## Quick start
Open `index.html` in a modern browser (no build step). Press **Space** to pause, **S** to save a PNG, and move sliders to tune noise, cross-talk, delay strength, and harmonic gain. The demo runs headless of audio by default but leaves TODO hooks for live input.

## Extension notes
- TODO: Add real audio/file ingestion that maps frequency to depth and stereo to lateral bias (influence-only).
- TODO: Swap the 2D renderer for WebGL instancing to scale beyond 100k agents.
- TODO: Persist delay summaries to IndexedDB for replay/forensics and lens-training.
- TODO: Expose lens parameters via URL/JSON to enable reproducible experiments and remote collaboration.

Ethos: Influence is allowed; control is not. Memory is bias, not overwrite. Interpretability is an invitation to understand, never to dominate.
