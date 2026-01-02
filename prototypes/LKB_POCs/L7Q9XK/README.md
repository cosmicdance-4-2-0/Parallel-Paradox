# PhaseCube Delta — Multi-Layer Dreaming Swarm (DeltaID: L7Q9XK)

## Why this exists
This proof-of-concept iterates on the planned upgrade path outlined in the prior PhaseCube readme by:
- Introducing **multi-grid interaction** (core + echo grids) to explore coupled swarms without central control.
- Adding a **delayed feedback loop** that re-injects past energy as a tunable bias instead of direct command-and-control.
- Demonstrating lightweight **structural plasticity** with probabilistic neighbor rewiring to keep the substrate adaptive.
- Surfacing an **interpretive layer** (live metrics and overlays) to make inner dynamics legible while keeping the substrate autonomous.

Design goals: minimal but robust, modular, scalable, tunable, and human-readable. Comments call out the intended extension points.

## Files
- `index.html` — UI shell (canvas + controls) that imports the module-based simulation.
- `app.js` — ES module implementing configuration, grids, feedback, rendering, and controls.

## How to run
Open `index.html` in a modern browser. No build step or external dependencies are required.

## Controls
- **Space**: Pause/resume simulation.
- **Noise slider**: Adjust stochastic plasma flip rate (prevents collapse).
- **Cross-talk slider**: Tune coupling strength between the core grid and the echo grid.
- **Plasticity slider**: Set the rewiring probability for structural plasticity.

## Architecture highlights
- **Config-first**: All tunables live in `SIM_CONFIG`, making it easy to re-seed or scale grid sizes, delays, and coupling strengths.
- **MultiGridSwarm**: Orchestrates two `PhaseGrid` instances and exchanges soft bias between them to keep them in dialogue without central authority.
- **DelayLine**: Implements bounded, decaying feedback so history influences but never dominates current state.
- **Renderer**: Human-readable 2D canvas projection with overlays for coherence and entropy to keep the system interpretable.
- **ControlPanel**: Minimal event wiring that updates config in real time and leaves TODO hooks for richer UX.

## Extension notes
- TODO: Add optional audio bias input to modulate the bias field with real-world signals, keeping influence non-destructive.
- TODO: Swap the 2D canvas renderer for WebGL instancing to scale beyond tens of thousands of agents.
- TODO: Persist metrics to IndexedDB for offline inspection and longer-horizon delayed feedback experiments.
- TODO: Experiment with >2 grids and heterogeneous update rates to probe emergent coordination regimes.
- TODO: Introduce lens-inspired weighting (human/predictive/systemic/harmonic) as additional modulators in `PhaseGrid.step`.

## Ethos
The system stays below goal-driven AI: it is autonomous, bounded, and observable; it accepts influence, not commands. The DeltaID is embedded in comments to improve delta tracking for this AI-assisted iteration.
