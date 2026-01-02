# PhaseCube Delta — Harmonic Echo Mesh (DeltaID: LKB7X2Q9)

This Delta pushes the upgrade path from `prototypes/LKB_POCs/readme.md` toward **memoryful biasing**, **lens-guided tuning**, and **scalable modularity** while keeping the browser-native, dependency-light spirit. It layers a short-term echo buffer over the classical plasma/liquid/solid phases, adds a bias driver that blends procedural pulses with optional pointer drift, and folds in four-lens modulation to keep the swarm bounded.

## Why this version
- **Memoryful yet bounded:** Echo buffers recycle recent liquid energy into the solid phase without locking into a fixed point. Harmonic clamps prevent runaway amplification.
- **Lens-guided tuning:** Human, Predictive, Systemic, and Harmonic lenses translate live metrics into mix shifts, noise gating, and memory blending. Sliders expose weights so you can retune in real time.
- **Bias without seizure:** Bias fields remain influence-only, combining a procedural “heartbeat” with optional pointer tilt; they never overwrite state. Input failure falls back to deterministic drift.
- **Modular and scalable:** Separate modules for config, utils, lattice dynamics, bias driver, lenses, renderer, controls, and orchestration. Comments and TODOs mark clear expansion seams.

## File map
- `index.html` — Shell, canvas, control panel, and module wiring for DeltaID LKB7X2Q9.
- `config.js` — Central tunables for grid, noise, memory, bias, camera, and UI defaults.
- `utils.js` — Helpers for clamping, lerp, hash noise, and typed-array ops.
- `lattice.js` — Plasma/liquid/solid lattice with echo buffer, harmonic clamps, and bias injection.
- `bias.js` — Procedural bias driver with pointer tilt; safe fallbacks when input is unavailable.
- `lenses.js` — Four-lens modulators mapping metrics to mix/echo/noise adjustments.
- `renderer.js` — Canvas renderer with orbiting camera, color coding, and HUD overlays.
- `controls.js` — Slider + button wiring, DeltaID display, and live value binding.
- `main.js` — Orchestrates the loop: metrics → lenses → bias → lattice → render.

## Running
Open `index.html` in a modern browser (ES modules enabled). No build step. If pointer controls are blocked, the bias driver falls back to a deterministic, slow precession.

## Controls
- **Space** — Pause/resume.
- **Noise** — Plasma flip probability (prevents collapse).
- **Path Bias** — Mix between consensus (Path A) and difference amplification (Path B).
- **Bias Gain** — How strongly the external bias field nudges plasma.
- **Echo Blend** — How much the echo buffer feeds back into solid memory.
- **Lens weights** — Human / Predictive / Systemic / Harmonic sliders to rebalance modulation live.
- **Reset** — Re-seeds the lattice with fresh noise.

## Extension notes
- TODO: Add audio/OSC bias input, for richer external influence without control.
- TODO: Add WebGL instanced renderer, for reason(s) of scaling beyond 25k agents.
- TODO: Add multi-grid coupling hooks, for reason(s) of exploring Lyriel consensus variants.
- TODO: Stream metrics to DevTools overlay or WebSocket, for reason(s) of deeper observability.

> Delta LKB7X2Q9 keeps the swarm dreaming, interpretable, and safely influenceable. Trace the DeltaID across files to track lineage.
