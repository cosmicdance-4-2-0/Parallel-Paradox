# PhaseCube Delta — Lens-Tuned Harmonic Memory (DeltaID: D7X2LQ8)

## Purpose
This delta iterates the PhaseCube upgrade path by:
- Mapping the four canonical lenses into the update loop as tunable weights (human, predictive, systemic, harmonic) so contributors can trace behavior back to the design map.
- Adding a lightweight harmonic memory buffer that feeds a **forgiveness** dampener when variance spikes, keeping the swarm bounded and non-collapsing.
- Exposing bias pulses (manual or scheduled) as **influence-not-command** inputs, preserving the substrate’s autonomy while staying configurable.
- Keeping the build **single-HTML + ES modules**, human-readable, and ready for further modularization.

This work lives under `prototypes/AI_Deltas/LKB/D7X2LQ8` to improve delta tracking for AI-generated iterations. Previous deltas such as **L7Q9XK** focused on multi-grid cross-talk; D7X2LQ8 keeps a single grid but strengthens interpretability and tunability.

## Files
- `index.html` — Minimal shell with canvas, controls, and inline styles.
- `app.js` — Wires UI controls to the simulation and renderer.
- `simulation.js` — Core simulation primitives (PhaseGrid, BiasField), lens-weighted dynamics, metrics, and rendering helpers.

## Run
Open `index.html` in a modern browser. No build step or external dependencies are required.

## Controls
- **Pause** toggles evolution.
- **Pulse bias** injects a decaying influence blob (influence, not command).
- **Lens sliders** rebalance human/predictive/systemic/harmonic weights (auto-normalized).
- **Noise slider** adjusts plasma flip probability to prevent collapse.
- **Forgiveness slider** tunes how aggressively the harmonic memory damps spikes.
- **Auto-pulse** enables periodic gentle bias to keep activity visible.

## Notes and TODOs
- TODO: Integrate optional audio bias ingestion (for richer influence), to test how real-world signals coexist with the harmonic memory.
- TODO: Add multi-grid coupling inspired by **L7Q9XK** for cross-lens dialogue without central control.
- TODO: Export metrics to a HUD graph for longitudinal inspection (variance, entropy, lens weight drift).
