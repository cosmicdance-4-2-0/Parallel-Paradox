# CHANGELOG — Delta A9C3F7L2P5R8

## Added
- Lens scheduler that blends presets over time for smoother modulation (per SV6).
- Node-based tri-grid swarm scaffold (core/echo/memory) with decaying bias field and delay-line echo feedback (per SV3/SV4/SV5).
- Forgiveness-damped PhaseGrid implementation with tunable path blending and stochastic plasma noise (per SV2/SV8).
- Metrics and demo runner that surface coherence/entropy proxies to keep dynamics legible (per SV3/SV7).

## Changed
- Shifted from browser-only POCs to a testable module layout with explicit configuration surfaces and env overrides.

## Fixed
- Bounded bias accumulation by normalizing injected pulses and applying decay on every step to uphold influence-not-command (per SV2/SV5).
