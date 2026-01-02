# PhaseCube Delta — Lens-Guided Tri-Grid (DeltaID: A6P9Q4)

This POC advances the upgrade path outlined in `prototypes/LKB_POCs/readme.md` and earlier deltas by combining **multi-grid interaction**, **delayed biasing**, **structural plasticity**, and a lightweight **lens stack** inspired by the four-lens model. The goal is a minimal yet modern scaffold that stays human-readable while supporting iterative tuning.

## Why this version
- **Tri-grid dialogue:** Core, echo, and scout swarms exchange soft biases instead of hard synchronization, demonstrating layered emergence without central authority.
- **Lens-guided modulation:** Human, Predictive, Systemic, and Harmonic lenses translate observed metrics into mix shifts, memory blending, and cross-grid nudges. Sliders let you retune the blend live.
- **Delayed memory & plasticity:** A shared delay line recirculates recent energy; slow rewiring keeps the neighbor graph adaptive without collapsing locality.
- **Interpretability:** On-canvas overlays show per-grid energy/coherence, divergence, history bias, and the active lens blend. Comments mark TODOs for scale-up pathways.

Design goals: minimal but robust, modular, scalable, tunable, and entirely human-readable.

## Files
- `index.html` — UI shell, layout, and module bootstrapping.
- `config.js` — Centralized defaults for simulation, renderer, plasticity, and lens gains.
- `lattice.js` — Neighbor graph, structural plasticity, delay line, and phase grid dynamics.
- `lenses.js` — Four-lens-inspired modulators that turn metrics into bias/memory/noise controls.
- `renderer.js` — Canvas renderer with orbiting camera and metrics overlay.
- `controls.js` — Slider controls for noise, coupling, delay gain, and per-lens weights.
- `main.js` — Orchestrates swarm lifecycle, applies lens guidance, and wires renderer + controls.

## How to run
Open `index.html` in a modern browser (ES modules enabled). No build or external dependencies are required.

## Controls
- **Space** — Pause/resume simulation.
- **Mouse move** — Orbit the viewport.
- **Noise slider** — Adjust stochastic phase flips (prevents collapse).
- **Cross slider** — Tune cross-grid biasing strength.
- **Delay slider** — Scale the strength of recirculated energy.
- **Lens sliders** — Rebalance Human/Predictive/Systemic/Harmonic modulation in real time.

## Extension notes
- TODO: Thing, for reasons — add optional audio/file input as an external bias field without overwriting internal state.
- TODO: Thing, for reasons — swap the canvas renderer for WebGL instancing when scaling past ~20k agents.
- TODO: Thing, for reasons — allow per-grid delay lines and heterogeneous tempos to explore asynchronous coordination.
- TODO: Thing, for reasons — surface OSC/WebSocket hooks so remote tools can tune lenses in live sessions.

## Ethos
The DeltaID (A6P9Q4) is embedded across files for traceability. The system remains a dreaming, bounded swarm: autonomous, influenceable, interpretable, and intentionally below goal-seeking AI.
