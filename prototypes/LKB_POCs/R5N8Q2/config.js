// DeltaID: R5N8Q2
// Centralized tunables to keep the system inspectable and tweakable.

export const GRID = 14; // 14^3 = 2744 cells; fast but dense enough to show texture.
export const POINT_SIZE = 4;
export const SCALE = 26;
export const TARGET_FPS = 60;
export const CAMERA_Z = 420;

export const phaseConfig = {
    flipP: 0.012,            // Random plasma flips per tick keep the dream alive.
    parityP: 0.008,          // Parity toggles inject asymmetry into neighbor comparisons.
    pathBProbability: 0.6,   // Bias toward the exploratory path.
    alpha: 0.2,              // Solid blend rate; higher = more stickiness.
    plasmaDecay: 0.12,       // Damp plasma toward the new mix.
    parityOffset: 0.11,      // Weight of the parity bit when amplifying differences.
    harmonicWeight: 0.5,     // Blend between consensus and divergence.
    forgivenessGain: 0.35,   // Kenotic damping to avoid runaway spikes.
    noise: 0.015             // Baseline noise injected into plasma.
};

export const biasConfig = {
    enabled: true,
    fieldDecay: 0.9,         // How quickly the bias field fades.
    diffusion: 0.18,         // How widely bias bleeds into neighbors.
    gain: 0.55,              // Scales the influence of external bias on liquid updates.
    micGain: 0.8,            // Additional multiplier when audio is present.
    fallbackGain: 0.35       // Multiplier for procedural bias when mic is off.
};

export const traceConfig = {
    traceBlend: 0.18,        // How strongly the short-term trace feeds back into solids.
    traceDecay: 0.92,        // Passive decay of the trace buffer.
    bufferInit: 0.05         // Baseline for the trace buffer to avoid cold-start deadness.
};

export const rendererConfig = {
    background: '#060608',
    trailOpacity: 0.12,      // Frame-to-frame fade for subtle persistence.
    hueSpeed: 0.08,          // Hue rotation speed over time.
    minAlpha: 0.28,
    maxAlpha: 0.86,
    depthFade: 0.35          // How much depth affects alpha.
};

export const controlsConfig = {
    deltaId: 'R5N8Q2',
    allowMic: true,
    saveKey: 's',
    pauseKey: ' ',
    sensitivity: 0.005       // Mouse rotation sensitivity.
};

// TODO: Move configs into a lightweight schema to validate user-supplied overrides at runtime.
