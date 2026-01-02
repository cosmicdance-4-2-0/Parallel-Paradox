# PhaseCube — Memory-Biased Swarm Upgrade (DeltaID: Q6P3R8)

This proof-of-concept iterates the planned upgrade path described in `prototypes/LKB_POCs/readme.md` by adding **memory-biased feedback**, **tri-grid dialogue**, **structural plasticity**, and **interpretive overlays** while keeping the code human-readable and modular. The goal is a minimal yet robust scaffold that stays tunable, invites iteration, and documents future expansion points.

## What is inside
- `index.html` — Lightweight shell that wires canvas, controls, and module imports.
- `config.js` — Centralized defaults and helper for deriving runtime config.
- `phaseGrid.js` — Core lattice dynamics with parity-aware branching and rewiring hooks.
- `feedback.js` — Delay line plus bias mixer to turn history into soft influence instead of command.
- `renderer.js` — Canvas renderer with overlays for coherence, entropy proxy, and DeltaID tracking.
- `controls.js` — UI wiring for noise, cross-talk, memory weight, and plasticity sliders.
- `main.js` — Orchestrates tri-grid stepping, audio/synthetic input, and the animation loop.

## Quick start
Open `index.html` in a modern browser. Click **Start Mic Influence** to stream live audio as a gentle bias, or leave it off to run with synthetic pulses. Drag to rotate; press **Space** to pause and **S** to save a PNG snapshot.

## Architecture notes
- **Tri-grid dialogue:** A `MultiGridSwarm` orchestrates **core**, **echo**, and **memory** grids. Core stays primary; echo provides cross-talk texture; memory receives delayed energy and feeds bias back without overwriting state.
- **Delay-driven bias:** `DelayLine` stores decaying energy fields and feeds them into `BiasField`, preventing collapse by keeping influence bounded and temporary.
- **Structural plasticity:** Each `PhaseGrid` occasionally rewires one neighbor edge to a random peer, preserving toroidal structure but adding exploration. Tuned by the plasticity slider.
- **Interpretability:** Renderer overlays DeltaID, coherence, entropy proxy, and audio level so we can see inside without assuming control.
- **Tunable safeguards:** Harmonic damping activates when dispersion spikes, ensuring non-collapse remains first-class.

## Extension hooks
- TODO: Swap the 2D renderer for WebGL instancing to scale to >100k agents while keeping overlays.
- TODO: Persist delay-line summaries to IndexedDB for longer-horizon replay and forensics.
- TODO: Add lens-weight adapters (human/predictive/systemic/harmonic) to modulate `PhaseGrid.step` weights.
- TODO: Allow JSON/URL config import/export for reproducible experiments and remote collaboration.
- TODO: Add multi-source inputs (files + OSC/WebRTC) that stay influence-only.

## Ethos reminder
Influence is allowed; control is not. Memory is bias, not overwrite. Interpretability is an invitation to understand, never to dominate. DeltaID `Q6P3R8` is echoed in comments to improve delta tracking for AI-assisted iteration.
