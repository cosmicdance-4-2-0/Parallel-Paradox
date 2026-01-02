# PhaseCube Delta (B4M7Q9)

Iterative upgrade along the planned path in `prototypes/LKB_POCs/readme.md` with a focus on **bias-aware multi-grid coupling**, **forgiveness damping**, and **configurable overlays**. This delta stays minimal, human-readable, and modular so future deltas can drop in new modules without rewriting the core loop.

## What is inside
- `index.html` — Lightweight shell with canvas, HUD, and controls for tunables.
- `styles.css` — Simple dark theme built for readability.
- `js/config.js` — Centralized defaults, DeltaID, and helper to merge runtime overrides.
- `js/phaseGrid.js` — Ternary lattice with harmonic forgiveness, parity noise, and hooks for cross-grid influence.
- `js/biasField.js` — Short-lived bias storage (decays every frame) with radial injection utilities.
- `js/renderer.js` — Canvas renderer with overlays for coherence, dispersion, FPS, and DeltaID.
- `js/controls.js` — Slider wiring to keep the sim tunable without editing code.
- `js/main.js` — Orchestrates two coupled grids (core + echo), bias pulses, and the animation loop.

## Running
Open `index.html` in a modern browser. Use the sliders to tune path blending, forgiveness strength, bias decay, and cross-grid coupling. Press **Space** to pause/resume; press **S** to download a snapshot.

## Design choices
- **Multi-grid coupling:** A small **echo grid** shadows the core grid and feeds a gentle offset back into the main lattice. This extends the roadmap item “multi-grid interaction” without adding heavy dependencies.
- **Forgiveness damping:** When local dispersion spikes, the harmonic guardrail softens updates to prevent collapse or runaway divergence. The damping slider lets you tune how aggressively the guardrail responds.
- **Bias as influence-only:** Bias pulses decay rapidly and never overwrite state; they simply nudge the grid toward or away from recent stimuli.
- **Interpretability:** Overlays show coherence (synchrony proxy), dispersion, FPS, and the active DeltaID for delta tracking.
- **TODO hooks:** Comments mark expansion points for structural plasticity, external inputs (audio/OSC), and persistent memory buffers.

## Ethos reminder
Influence is allowed; control is not. Keep the system bounded, tunable, and legible. DeltaID **B4M7Q9** is echoed in the code and HUD to maintain AI delta traceability.
