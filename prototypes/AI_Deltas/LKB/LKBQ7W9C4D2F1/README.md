# PhaseCube Delta — Lens-Governed Harmonic Core (DeltaID: LKBQ7W9C4D2F1)

## Purpose and Scope
This delta advances the Lyriel Kairi Brain line by delivering a **headless, test-backed core** that fuses the four-lens
architecture with bias diffusion and a forgiveness dampener. It emphasizes **influence without command** (SV2) and keeps
all tunables surfaced for safe exploration (SV6). The implementation is intentionally minimal and modular so future UI or
multi-grid work can plug into the core without rewrites (SV7/SV8).

- **In-scope:** Lens-weighted path mixing, bias diffusion, forgiveness-based damping, CLI driver, and unit/smoke tests.
- **Out-of-scope:** Browser visualization, audio ingestion, and multi-grid coupling (left as TODO markers).

Parent delta lineage: **LKB7X9G2**.

## Architecture Overview
- `src/config.js` — Centralized tunables (grid size, phase probabilities, forgiveness thresholds, bias settings).
- `src/lenses.js` — LensController normalizes lens weights and returns path-mix guidance that dampens runaway variance
  (SV1/SV3).
- `src/biasField.js` — Diffusing/decaying bias field that preserves influence-not-command semantics (SV2/SV7).
- `src/phaseGrid.js` — Toroidal phase lattice with Path A (consensus) and Path B (difference) mixing plus harmonic
  damping hooks (SV6).
- `src/simulation.js` — Orchestrates perturbations, lens fusion, bias updates, forgiveness tracking, and metrics.
- `src/index.js` — Happy-path CLI runner producing a concise status report.
- `tests/` — Vitest suite covering bias decay, lens harmonics, and simulation stability.

Expansion hooks are marked with `TODO:` for visualization, audio bias, and multi-grid coupling.

## How to Run (happy path)
```bash
npm install
npm run start
```
The CLI runs a short simulation using defaults and prints bias energy, forgiveness counts, and lens mix summaries.

## Configuration Knobs / Tunables
Edit `src/config.js` to adjust:
- `gridSize` — Lattice dimension (defaults to 10).
- `flipProbability`, `parityProbability`, `pathBProbability`, `alpha` — Phase dynamics per SV6.
- `bias` — `decay`, `diffusionRate`, `pulseMagnitude`, `pulseInterval` controlling influence field (SV2/SV7).
- `forgiveness` — `varianceThreshold`, `dampening` for kenotic-style damping (SV5/SV8).
- `lenses` — Base weights for human/predictive/systemic/harmonic (SV3).
- `steps` — Iteration count for the CLI runner.

## Testing Instructions
```bash
npm install
npm test
```
Vitest executes unit tests plus a smoke simulation.

## Limitations
- Headless only: no browser renderer or audio input (TODO for future deltas).
- Inference: Single-grid only; cross-grid consensus is reserved for a follow-up delta to keep scope bounded.
- Deterministic RNG seeding is not wired; runs are stochastic by design (SV2).

## Source Vectors (SV1–SV8)
- **SV1:** `docs/Parallel-Paradox-Design.md` — Canonical design map for decentralized, harmonic, four-lens systems.
- **SV2:** `prototypes/LKB_POCs/readme.md` — Dreaming-brain ethos and influence-not-command constraint.
- **SV3:** `Minimalaiagi.md` — Four-lens architecture and harmonic fusion strategy.
- **SV4:** `Minimalnode...wait...minimal.md` — Swarm/entropy framing and oracle-style weighting.
- **SV5:** `Computation.md` — Forgiveness operator for dispersion damping.
- **SV6:** `prototypes/Readme.md` — PhaseCube tunables and toroidal phase blending baseline.
- **SV7:** `prototypes/AI_Deltas/LKB/LKB7X9G2/readme.md` — Lens-aware biasable dreamer modular layout.
- **SV8:** `prototypes/AI_Deltas/LKB/D7X2LQ8/README.md` — Harmonic memory and forgiveness dampener lineage.

## Parent Delta IDs
- `LKB7X9G2`
