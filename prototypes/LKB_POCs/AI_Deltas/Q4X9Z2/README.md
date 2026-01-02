# PhaseCube Delta — Lens-Coupled Dual Swarm (DeltaID: Q4X9Z2)

This AI-generated iteration advances the **planned upgrade path** from `prototypes/LKB_POCs/readme.md` by merging **multi-grid dialogue**, **lens-aware modulation**, and a **diffusive bias field** into a minimal, browser-native package. The goal is to keep the dreaming lattice bounded, interpretable, and easy to extend while leaving clear TODO hooks for future scaling.

## Why this Delta
- **Lens fusion on live controls:** Four-lens weights (Cognitive, Predictive, Systemic, Harmonic) drive noise, path selection, and forgiveness damping so explorers can tune stability vs. divergence without touching code.
- **Dual-grid conversation:** Core and Echo lattices exchange soft cross-talk; a shared bias field keeps influence-not-command as audio/procedural energy drifts through the cube.
- **Bias plumbing:** Optional microphone input (with graceful fallback to procedural oscillators) injects energy as a spatially localized bias that diffuses and decays.
- **Kenotic guardrails:** Local dispersion triggers forgiveness damping to prevent collapse or runaway excitation—safe by default, tunable by sliders and lens profiles.
- **Interpretability:** A compact HUD exposes energies, coherence, divergence, and active lens profile alongside the DeltaID for tight delta tracking.

## Files
- `index.html` — Minimal shell, canvas, and control panel wiring the modules.
- `config.js` — Centralized defaults, lens presets, and rendering options (DeltaID included for traceability).
- `lens.js` — Lens fusion math that maps four weights to tuned simulation parameters.
- `biasField.js` — Diffusive bias lattice with decay plus helpers to inject audio/procedural energy.
- `grid.js` — Plasma/liquid/solid lattice with forgiveness damping, parity flips, and bias-aware steps.
- `renderer.js` — 2D canvas renderer with simple camera rotation and HUD overlay.
- `controls.js` — Slider + dropdown bindings for lens profiles, bias gain, and cross-talk weights.
- `input.js` — Audio/procedural bias driver with safe fallbacks and human-readable comments.
- `main.js` — Orchestration loop wiring input → bias field → dual grids → renderer.

## How to run
1. Open `index.html` in a modern browser (no build step or dependencies).
2. Click **Start** to wake the simulation. Space toggles pause. Drag to rotate the view.
3. Optionally toggle **Mic Bias** to request microphone input; if denied, procedural bias stays active.

## Controls
- **Lens Profile** — Selects the four-lens weighting preset (affects stability vs. exploration).
- **Bias Gain** — Scales how strongly the diffusive bias field nudges the grids.
- **Cross-Talk** — Tunes coupling between Core ↔ Echo grids.
- **Noise / Forgiveness / Path-B** — Fine-grain sliders for plasma flips, kenotic damping, and difference amplification.

## Design notes
- **Minimal but robust:** Vanilla JS modules, typed arrays, and explicit clamps keep behavior bounded.
- **Modular and scalable:** Clear seams in `renderer.js` and `grid.js` marked with TODOs for WebGL instancing and multi-grid expansion.
- **Tunable and configurable:** Central defaults plus HUD controls make the system tweakable without editing code.
- **Human-readable:** Comments favor intent over cleverness; DeltaID is embedded in logs and overlays for delta tracking.

## Breadcrumbs for the next Delta
- TODO: Swap the canvas renderer with a WebGL instanced path for >50k agents without CPU strain.
- TODO: Add optional multi-grid ensembles (>2) with heterogeneous update cadences to probe consensus dynamics.
- TODO: Persist HUD metrics to IndexedDB for replayable “dream logs” and comparative lens testing.
- TODO: Allow user-defined lens profiles (import/export JSON) to encourage community experimentation.
