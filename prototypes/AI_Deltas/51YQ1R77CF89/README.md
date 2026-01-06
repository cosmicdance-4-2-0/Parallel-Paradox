# PhaseCube Delta — Lens-Fused Memory Swarm (DeltaID: 51YQ1R77CF89)

This delta iterates the upgrade path sketched in `prototypes/Readme.md` and recent LKB POCs by introducing **lens-weighted fusion**, a **forgiveness damper**, and a **short-term memory shadow** while keeping everything human-readable and dependency-free.

## Why this version
- **Lens fusion:** Four tunable lenses (Human, Predictive, Systemic, Harmonic) blend their influences per step. Harmonic automatically modulates weights using a forgiveness factor when divergence spikes.
- **Memory shadow:** A lightweight shadow field (rolling exponential memory) feeds back into updates, nudging the swarm with recent history without locking it in place.
- **Bias pulses:** A minimal external bias pulse keeps the system influenceable but never controlled, aligning with the “input as influence” philosophy.
- **Interpretability:** On-canvas overlay reports DeltaID, energy, coherence, divergence, and harmonic damping so deltas remain traceable during AI-assisted iteration.

## Files
- `index.html` — Minimal shell wiring canvas + controls to the ES module.
- `config.js` — Centralized defaults and helper for live overrides.
- `app.js` — Core simulation (grid, lens fusion, memory shadow, renderer, controls).

## Run
Open `index.html` in a modern browser with ES module support. No build step or external dependencies.

## Controls
- **Space** — pause/resume.
- **Noise slider** — tweak stochastic plasma flips (collapse prevention).
- **Lens sliders** — tune weights for Human / Predictive / Systemic / Harmonic lenses.
- **Bias slider** — scale the gentle external pulse strength.
- **Memory slider** — adjust how strongly the memory shadow feeds back.

## Extension notes
- TODO: Add audio/file-derived bias fields to replace the placeholder pulse so inputs can “sing” to the swarm.
- TODO: Swap canvas rendering for WebGL instancing when scaling beyond ~20k agents, to keep FPS stable.
- TODO: Persist metric traces (energy/coherence/damping) to local storage for session-over-session comparisons.
- TODO: Promote harmonic modulation into its own module that can host ethics/goal-tuning lenses without central control.

The DeltaID (51YQ1R77CF89) is baked into overlay text and comments to keep diffs legible for future AI-assisted iterations.
