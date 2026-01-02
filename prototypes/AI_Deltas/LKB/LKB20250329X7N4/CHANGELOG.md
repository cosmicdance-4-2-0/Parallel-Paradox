# CHANGELOG — Delta LKB20250329X7N4

## Added
- Dual-grid (core + echo) headless lattice with lens-gated path blending and forgiveness damping.
- Scenario pulse planner that injects decaying bias fields to emulate audio-like influence without control.
- CLI runner that prints smoothed metrics plus vitest suite for bias decay, forgiveness behavior, and smoke coverage.

## Changed
- Introduced metric smoothing and coupling tunables to keep echo feedback gentle and legible.

## Removed
- None (additive delta; upstream files untouched).
