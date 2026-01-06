# Changelog — LKBDELTA240401A

## Added
- New Node-friendly lattice modules (`config`, `bias-field`, `phase-grid`, `lens-hooks`, `simulator`) implementing influence-only biasing, forgiveness damping, and lens-ready modulation.
- CLI demo (`src/demo.js`) for quick inspection of lattice metrics and forgiveness events.
- Vitest suite covering bias decay, lattice bounds, and smoke stepping for NaN detection.

## Notes
- This delta is additive and keeps all changes scoped to `prototypes/AI_Deltas/LKB/LKBDELTA240401A/`.
- No parent delta; derives directly from the PhaseCube baseline sources.
