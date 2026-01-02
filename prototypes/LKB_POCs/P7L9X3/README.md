# PhaseCube — Harmonic Path Upgrade (DeltaID: P7L9X3)

This proof-of-concept iterates the PhaseCube upgrade path described in `prototypes/readme.md` and `docs/Parallel-Paradox-Design.md` by modularizing the simulation, layering harmonic forgiveness damping, and exposing tunable lens-inspired weights. The goal is a minimal yet robust scaffold that can scale toward memory-bearing, audio-responsive Lyriel/Kairi behavior without breaking transparency.

## What changed vs. `phasecube_dreaming_0001.html`
- **Modular ES modules:** Render, simulation, and input layers split for clarity and future swapping.
- **Harmonic forgiveness damping:** A configurable damping operator tempers divergence when dispersion spikes.
- **Lens-weighted branching:** Configurable weight presets map to the four-lens idea (human, predictive, systemic, harmonic) for experimentation.
- **Input drivers:** Audio (live mic), synthetic heartbeat, and static bias drivers share one interface for easier extension.
- **Config-first tuning:** Centralized `config.js` captures tunables; comments call out scalability points.

## Quick start
Open `index.html` in a modern browser that supports ES modules. Click **Start Live Audio** to stream mic input or use **Synthetic Pulse** for a non-audio demo. Drag to rotate; press **P** to pause and **S** to save a PNG snapshot.

## Expansion notes
- TODO: Plug in recorded audio/file playback and GPU-backed rendering for higher agent counts.
- TODO: Add multi-layer memory buffers and external lens adapters to feed structured inputs.
- TODO: Move configuration to JSON + URL params for reproducible experiment sharing.
