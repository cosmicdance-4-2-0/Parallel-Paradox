# PhaseCube Delta — Harmonic Tri-Grid with Audio Bias (DeltaID: J8L2Q9)

This delta iterates the upgrade path from `prototypes/LKB_POCs/readme.md` and the prior dual-grid deltas by adding a **harmonic stabilizer grid**, **optional audio biasing**, and **lens-style weighting** that modulates path selection based on observed energy/coherence. It stays minimal, modular, and human-readable while marking TODO spots for larger-scale experiments.

## Why this version matters
- **Tri-grid dialogue:** Core + Echo + Harmonic grids exchange soft bias fields; the harmonic grid dampens divergence using a forgiveness-like blend, keeping the swarm bounded without central control.
- **Audio influence, not command:** A lightweight Web Audio bridge (with oscillator fallback) injects a decaying bias field proportional to amplitude. Input nudges exploration without overwriting internal state.
- **Lens-style weighting:** A tiny lens mixer adjusts path-B bias using "Predictive" (explore) and "Harmonic" (stabilize) weights derived from live metrics and audio. This sketches the lens idea from the design docs in executable form.
- **Interpretability overlay:** Metrics panel shows per-grid energy/coherence, divergence, audio bias, and current lens weights for transparent debugging.
- **Modular tunings:** Centralized config + live sliders (noise, cross-talk, plasticity, delay, audio gain, harmonic clamp). TODO markers highlight where to plug in more inputs, storage, or GPU renderers.

## Files
- `index.html` — Minimal shell with canvas + sidebar controls.
- `config.js` — Default tunables and shallow override helper.
- `app.js` — ES module implementing grids, plasticity, delay line, lens mixer, audio bridge, renderer, and control wiring.

## How to run
Open `index.html` in a modern browser with ES module support. Press **"Start Mic"** to feed microphone amplitude; otherwise the built-in oscillator keeps the bias field gently alive for demo purposes.

## Controls
- **Space** — Pause/resume simulation.
- **Noise** — Random plasma flips (anti-collapse energy).
- **Cross-talk** — Coupling strength between grids.
- **Plasticity** — Rewire probability for structural plasticity.
- **Delay Gain** — Influence of recent energy history.
- **Audio Gain** — How strongly external sound nudges the bias field.
- **Harmonic Clamp** — Cap on stabilizer bias to avoid over-damping.
- **Start Mic** — Request microphone input; falls back gracefully if denied/unavailable.

## Extension notes
- TODO: Route lens weights to rendering (e.g., hue/size) for richer interpretability.
- TODO: Swap canvas for WebGL instancing when scaling beyond ~20k agents.
- TODO: Persist metric history (IndexedDB/localStorage) to study long-form behavior.
- TODO: Add multi-source sensory bias (text/OSC/MIDI) merged with the audio bridge.
- TODO: Expose grid state sampling hooks for embedding downstream reasoning agents.

Ethos: still a dreaming, bounded mind — influenceable, never commanded. DeltaID `J8L2Q9` appears in code comments for traceability.
