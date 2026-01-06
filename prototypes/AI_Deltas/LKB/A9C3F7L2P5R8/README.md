# PhaseCube Delta — A9C3F7L2P5R8

## Purpose and scope
- **Upgrade path:** A lens-scheduled **tri-grid** (core/echo/memory) PhaseCube scaffold with decaying bias memory, forgiveness damping, and tunable lens → parameter mapping. This follows the influence-not-command and non-collapse constraints while making the swarm testable off-browser. (per SV1/SV2/SV3/SV6/SV8)
- **Scope:** Provide a modular Node-based simulation plus tests and runnable demo loop. Visuals are out-of-scope; hooks remain for future rendering or audio ingestion.

## Architecture overview
- **Lens scheduler:** Blends named lens presets over time so weights shift smoothly without abrupt jumps. (SV6)
- **Lens mapper:** Converts four-lens weights into concrete tunables (path blending, forgiveness damping, bias gain, coupling). (SV1/SV4/SV8)
- **BiasField:** 3D field with sphere injection, decay, and normalization so bias stays temporary. (SV2/SV3/SV5)
- **PhaseGrid:** Ternary plasma/liquid/solid lattice with parity, stochastic noise, forgiveness damping, and path blending. (SV2/SV4/SV8)
- **MultiGridSwarm:** Core/echo/memory grids exchange soft bias, delay-line feedback, and optional plasticity nudges while staying bounded. (SV3/SV4/SV5/SV7)
- **Metrics:** Coherence/entropy proxies plus per-grid energy snapshots for interpretability. (SV3/SV7)

## How to run (happy path)
```bash
npm install && npm run simulate
```
Runs a short demo loop printing per-step metrics. No external dependencies beyond Node’s standard library are required.

## Configuration knobs / tunables
- `config.js`: lattice dimensions, decay rates, forgiveness thresholds, noise level, coupling weights, and lens presets. (SV4/SV5/SV8)
- `lensScheduler.js`: preset sequence and dwell time for automatic blending. (SV6)
- `MultiGridSwarm` options: delay depth, plasticity rate, bias gains for each grid (memory/echo/core). (SV3/SV4/SV7)
- CLI overrides: set `STEPS`, `SEED`, `PRESET` env vars for quick experiments.

## Testing instructions
```bash
npm test
```
Runs Node’s built-in test runner for smoke + unit tests covering bias decay, lens mapping, and tri-grid boundedness.

## Limitations
- No browser renderer; this scaffold focuses on dynamics and testability. (Inference)
- Bias injection is synthetic (noise pulses); audio/text adapters are TODO markers. (SV2/SV5)
- Plasticity is minimal and uniform; heterogeneous rewiring strategies remain future work. (SV4/SV7)

## Source Vectors (SV1–SV8)
- **SV1:** docs/Parallel-Paradox-Design.md — canonical design (four lenses, anti-collapse). Constraints: harmonic balance, decentralization, interpretability.
- **SV2:** prototypes/LKB_POCs/readme.md — baseline PhaseCube (influence-not-command, tri-phase). Constraints: bias never overwrites state; maintain bounded stochasticity.
- **SV3:** prototypes/LKB_POCs/Q6P3R8/README.md — memory-biased tri-grid with delay. Constraints: tri-grid dialogue, decaying delay bias, exposed metrics.
- **SV4:** prototypes/LKB_POCs/F6N2Q4/README.md — lens-modulated tri-swarm with pulses and plasticity. Constraints: lens weights reshape stability/exploration; cross-talk without central control; bounded plasticity.
- **SV5:** prototypes/LKB_POCs/M8K3Z1/README.md — lens-weighted dual-grid with decaying bias. Constraints: lens mapping, echo coupling, decaying storage.
- **SV6:** prototypes/LKB_POCs/T4H9K2/README.md — lens scheduler + echo bias bus. Constraints: scheduler blending, bounded echo buffer, input gain tunables.
- **SV7:** prototypes/LKB_POCs/L7Q9XK/README.md — multi-grid with delay feedback + plasticity. Constraints: delay-line influence, probabilistic rewiring, readable overlays/metrics.
- **SV8:** prototypes/LKB_POCs/98E66S/README.md — forgiveness damping + tunable path blending. Constraints: throttle spikes with forgiveness, tunable path balance, modular structure.

## Parent delta ids
- None (rooted at SV1/SV2 + prior deltas cited above for lineage).

## CHANGELOG
See `CHANGELOG.md` for delta-specific changes versus the baseline/SVs.
