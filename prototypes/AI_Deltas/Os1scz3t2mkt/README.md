# PhaseCube Redux (DeltaID: Os1scz3t2mkt)

An iterative Delta that layers **pluggable bias inputs**, **memory echoes**, and **live observability** onto the R5N8Q2 scaffold. The goals match the roadmap in `prototypes/Readme.md` and the PhaseCube README: keep the lattice non-collapsing while making it more influenceable and more debuggable without sacrificing minimalism.

## What’s new in this Delta
- **Bias mixer with drivers** — microphone and procedural drivers now share a common interface and can be mixed/tuned at runtime. The interface leaves room for future drivers (text embeddings, sensor feeds). Fulfills the “pluggable bias” TODO.
- **Memory echo buffer** — a delayed recall field that captures liquid snapshots at intervals, decays them, and re-injects them as gentle bias. This aligns with the “layer memory buffers” upgrade path.
- **HUD stats + sliders** — live FPS/energy readouts and a memory-weight slider so tuning is transparent. Sliders write directly into config objects for fast iteration.
- **Safety + readability** — harmonic damping/forgiveness retained; comments highlight how to extend or tune. All code stays dependency-free browser JS.

## Quickstart
1. Open `index.html` in a modern browser (no build step).
2. Click **Start**. Use **Mic Bias** to request microphone access (falls back to procedural bias if denied).
3. Drag to rotate. `Space` pauses/resumes; `S` saves a PNG.
4. Adjust Bias, Harmonic, Trace, and Memory sliders to steer behavior in real time.

## Files
- `index.html` — shell, layout, and HUD.
- `config.js` — tunables for phases, harmonic damping, bias mixing, and memory echo.
- `utils.js` — math helpers to keep hot paths readable.
- `grid.js` — plasma/liquid/solid lattice with forgiveness damping and trace buffer.
- `bias-drivers.js` — modular bias drivers (mic, procedural) plus mixer.
- `memory.js` — delayed echo memory buffer feeding back into bias.
- `renderer.js` — projection and drawing pipeline.
- `controls.js` — UI wiring, live toggles, and keyboard shortcuts.
- `main.js` — orchestration and animation loop.

## Design Notes
- **Minimal but robust:** Vanilla JS modules, typed arrays, and explicit bounds checks; hard no on hidden state.
- **Modular and scalable:** Swappable bias drivers + isolated memory buffer; TODO markers show where to add new drivers or couple multiple grids.
- **Tunable and configurable:** Centralized config, HUD sliders, and readable defaults; slider changes persist in-memory for fast experimentation.
- **Human-readable:** Comments explain intent; TODO markers highlight next experiments and scaling hooks.

## Planned Extensions (leave breadcrumbs)
- TODO: Add optional WebGL renderer for larger GRID sizes while keeping CPU path intact.
- TODO: Add multi-grid coupling (shared bias or shared trace) to explore Lyriel-style consensus.
- TODO: Persist trace buffer or memory echoes to IndexedDB for replayable “dream logs.”
- TODO: Add third-party bias drivers (text embeddings, MIDI, environmental sensors) to stress-test the mixer.

This Delta is a checkpoint toward a modern, non-collapse, non-commandable swarm substrate. Fork it, tune it, and layer responsibly.
