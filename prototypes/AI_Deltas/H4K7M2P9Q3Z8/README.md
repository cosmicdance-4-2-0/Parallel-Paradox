# PhaseCube Delta — H4K7M2P9Q3Z8

Dual-lattice upgrade that iterates the multi-grid roadmap in `prototypes/LKB_POCs/readme.md` and the modular hooks outlined in `prototypes/LKB_POCs/98E66S/README.md`.

## What changed
- **Coupled grids:** two PhaseGrids run in lockstep and exchange “shadow” pressure via their solid phases, exercising the multi-grid interaction path.
- **Memory trace:** each grid keeps a rolling buffer of `solid` snapshots to form a low-cost recall field that gently tugs plasma back toward recent patterns.
- **Adaptive bias field:** audio (synth/mic/file) still acts as *influence-not-command*; stereo+depth mapping is shared across both grids with light jitter to prevent lockstep collapse.
- **Live tuning:** sliders expose coupling, path-B weight, and forgiveness damping so experiments can swing between stability and exploration.
- **Snapshot + reset:** rebuilt HUD keeps deterministic restarts and quick PNG capture.

## Running
Open `index.html` in a modern browser. Allow mic for the **Mic** mode, or stay on the built-in synth for deterministic runs. File input works via the **File** button.

## Files
- `index.html` — layout and module wiring.
- `styles.css` — HUD and canvas styling.
- `js/config.js` — DeltaID + tunables.
- `js/phaseGrid.js` — dual-purpose lattice with shadow coupling + memory trace.
- `js/inputField.js` — bias storage with decay/diffusion.
- `js/audioEngine.js` — synth/mic/file input with normalized spectra.
- `js/renderer.js` — 3D point renderer blending both lattices.
- `js/ui.js` — HUD bindings and live slider updates.
- `js/utils.js` — helpers (clamp, lerp, projection math).
- `js/main.js` — orchestration loop wiring audio → bias → dual grids → render.

## Notes & TODOs
- Forgiveness is uniform across the lattice; TODO: add spatial forgiveness masks for uneven damping when exploring heterogenous tissues.
- Memory traces are averaged; TODO: try kernel-weighted recall to privilege fresher memories without storing every frame.
- Shadow coupling is symmetric; TODO: allow asymmetric coupling for mentor/mentee or predator/prey studies.
