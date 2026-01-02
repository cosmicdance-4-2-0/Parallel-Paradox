# PhaseCube Delta — M8K3Z1

A modular, tunable follow-on to the PhaseCube dreaming lattice. This delta focuses on **upgrade-path hooks** called out in the parent `readme.md` while keeping the system bounded and human-readable:

- **Lens-weighted dynamics:** slider-controlled weights for the four lenses map into path blending, damping, and forgiveness tuning.
- **Dual-grid coupling:** a secondary echo lattice can siphon or return bias energy to probe cross-talk without hard overrides.
- **Bias field + memory buffer:** short-term bias storage decays over time; a rolling history of solid-state averages can gently steer excitation (and is ready for richer recall).
- **Config-first tuning:** all major constants live in `config.js`, with inline comments and TODO markers for future expansion.
- **Renderable without tooling:** open `index.html` directly; no build step or network calls.

## Running

Open `index.html` in a modern browser. Controls appear on the left; the canvas renders the active liquid phase. Toggle **Echo Grid** to enable dual-grid coupling. Sliders apply immediately.

## Files

- `index.html` — layout and module wiring.
- `styles.css` — minimal HUD styling.
- `js/config.js` — shared tunables and DeltaID reference.
- `js/utils.js` — small helpers for clamping, indexing, and averaging.
- `js/lenses.js` — maps the four lens sliders into concrete simulation parameters.
- `js/biasField.js` — decaying bias volume with injection helpers.
- `js/phaseGrid.js` — ternary lattice update loop with forgiveness damping and coupling hooks.
- `js/renderer.js` — 2D canvas rendering of the liquid phase with parity coloring.
- `js/ui.js` — slider and toggle binding; HUD updates.
- `js/main.js` — orchestration loop connecting lens weights, bias, grids, memory, and render.

## Upgrade hooks

- **Longer-term memory:** `main.js` tracks `solidHistory` with a TODO to turn history into selective replay instead of soft biasing.
- **Richer multi-grid play:** `phaseGrid.js` leaves TODOs for asymmetric coupling (e.g., delay lines, different lattice sizes) beyond the current mirrored echo.
- **External inputs:** `biasField.js` exposes `injectSphere` for audio or sensor inputs; currently seeded by slider-driven pulses.

## Notes

- The simulation remains bounded via clamping, forgiveness damping, and decay.
- Comments favor clarity over terseness; surfaces are marked where future contributors can iterate safely.
- DeltaID is stamped in the UI for easier diff tracking.
