# PhaseCube Delta — Memory-Biased Dual Swarm (DeltaID: V4H2J9)

This proof-of-concept iterates the planned upgrade path from `prototypes/LKB_POCs/readme.md` by layering **multi-grid interaction**, **delayed feedback**, **structural plasticity**, and a richer **interpretive layer** while keeping the implementation minimal, human-readable, and tunable.

## Why this version matters
- **Multi-grid dialogue:** A core grid and an echo grid exchange soft bias fields rather than hard control, exploring coupled swarms without central authority.
- **Delayed memory bias:** A bounded delay line re-injects recent energy as a gentle modulation, showing how history can guide without dominating.
- **Structural plasticity:** Low-rate rewiring periodically refreshes neighborhood links to keep the lattice adaptive without losing locality.
- **Interpretability first:** A small metrics overlay (energy, coherence, divergence) plus a pauseable timeline keep the swarm legible. Comments mark TODO pathways for scaling and lens-driven extensions.

Design goals: minimal but robust, modular, scalable, tunable, and fully human-readable. DeltaID markers appear in code comments for easier delta tracking.

## Files
- `index.html` — UI shell with canvas + controls wiring the module-based simulation.
- `config.js` — Centralized defaults and helper to apply live tunings.
- `app.js` — ES module implementing grids, delay line, plasticity, renderer, and control glue.

## How to run
Open `index.html` in a modern browser with ES module support. No build step or external dependencies are required.

## Controls
- **Space** — Pause/resume simulation.
- **Noise slider** — Adjust stochastic plasma flip rate (prevents collapse).
- **Cross-talk slider** — Tune coupling strength between the core and echo grids.
- **Plasticity slider** — Set the rewiring probability for structural plasticity.
- **Delay slider** — Adjust the strength of the historical bias reinjection.

## Extension notes
- TODO: Add optional audio/file bias input that feeds the shared bias field without overwriting internal state.
- TODO: Swap the 2D canvas renderer for WebGL instancing to scale beyond tens of thousands of agents.
- TODO: Persist metrics to local storage or IndexedDB for offline, longer-horizon feedback studies.
- TODO: Expand to >2 grids with heterogeneous update cadences to explore emergent coordination regimes.
- TODO: Introduce lens-inspired weighting (human/predictive/systemic/harmonic) as separate modulators in `PhaseGrid.step`.

## Ethos
The system stays below goal-driven AI: autonomous, bounded, observable, and influenceable. The DeltaID (V4H2J9) is embedded in comments to improve delta tracking for this AI-assisted iteration.
