# PhaseCube Delta (98E66S)

Modular follow-on to the single-file dreaming swarm. This version keeps the ternary lattice (plasma/liquid/solid) but adds explicit hooks for the upgrade path outlined in the parent `readme.md`:

- **Forgiveness damping:** harmonic-style guardrail that lowers energy when local activity spikes.
- **Tunable path blending:** exposes Path B (difference amplification) to mimic harmonic lens weighting.
- **Configurable input bias:** radius/decay/strength sliders; audio routing stays “influence-not-command.”
- **Modular layout:** split into renderer, audio, input field, phase grid, UI helpers for easier iteration.
- **Snapshot + reset:** quick loops for exploratory runs.

## Running
Open `index.html` in a modern browser. Allow microphone access for live input, or stay on the built-in synth for deterministic behavior. File input is supported via the “Audio File” mode.

## Structure
- `index.html`: layout, HUD, control surfaces.
- `styles.css`: theming (dark, HUD-friendly).
- `js/config.js`: shared tunables, DeltaID.
- `js/phaseGrid.js`: ternary lattice dynamics + forgiveness damping.
- `js/inputField.js`: bias field storage, diffusion, and injection.
- `js/audioEngine.js`: WebAudio wiring (synth, mic, file).
- `js/renderer.js`: 2D canvas renderer with simple camera controls.
- `js/ui.js`: slider binding + HUD updates.
- `js/main.js`: orchestration loop; audio → bias → grid → render.

## Upgrade hooks
- **Multi-grid coupling:** add a secondary `PhaseGrid` and share the same `InputField`, or pass distinct biases to observe cross-talk. TODO markers are left in `main.js` and `renderer.js`.
- **External memory buffers:** record `solid` phase history into a ring buffer for longer-term recall. TODO markers noted in `phaseGrid.js`.
- **Lens fusion experiments:** map higher-level lens weights onto `pathBWeight` and `forgiveness` for controllable exploration/stability blends.

## Notes
- Values are intentionally small and clamped to keep the lattice bounded.
- All sliders update live; hit **Reset** to re-seed without reloading.
- Snapshots are client-side PNG downloads (no network dependency).
