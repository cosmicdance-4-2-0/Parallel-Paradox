// DeltaID: NCECI6
// Centralized tunables to keep the system inspectable and tweakable.

export const DELTA_ID = 'NCECI6';
export const GRID = 14; // 14^3 = 2,744 cells to stay smooth on CPU.
export const SCALE = 26;
export const POINT_SIZE = 4;
export const TARGET_FPS = 60;
export const CAMERA_Z = 420;

export const phaseConfig = {
    flipP: 0.011,          // Random plasma flips keep the dream alive.
    parityP: 0.009,        // Parity toggles inject asymmetry into neighbor comparisons.
    pathBProbability: 0.58, // Bias toward exploratory path (difference amplification).
    alpha: 0.21,           // Solid blend rate; higher = more stickiness.
    plasmaDecay: 0.14,     // Damp plasma toward the fused mix.
    parityOffset: 0.12,    // Weight of the parity bit when amplifying differences.
    harmonicWeight: 0.48,  // Default harmonic blend; adjustable via HUD.
    forgivenessGain: 0.33, // Kenotic damping to avoid runaway spikes.
    noise: 0.012           // Baseline noise injected into plasma.
};

export const biasConfig = {
    fieldDecay: 0.88,      // How quickly the bias field fades.
    diffusion: 0.16,       // How widely bias bleeds into neighbors.
    gain: 0.52,            // Scales influence of external bias on liquid updates (HUD-controlled).
    micGain: 0.85,         // Additional multiplier when audio is present.
    fallbackGain: 0.34     // Multiplier for procedural bias when mic is off.
};

export const memoryConfig = {
    traceBlend: 0.2,       // How strongly the short-term trace feeds back into solids.
    traceDecay: 0.9,       // Passive decay of the trace buffer.
    imprintBlend: 0.08,    // Slow imprint for bias echoes.
    imprintDecay: 0.985    // Decay for the imprint buffer so it never locks in.
};

export const lensProfiles = {
    baseline: { cognitive: 0.35, predictive: 0.3, systemic: 0.2, harmonic: 0.15 },
    exploratory: { cognitive: 0.2, predictive: 0.45, systemic: 0.2, harmonic: 0.15 },
    grounded: { cognitive: 0.5, predictive: 0.2, systemic: 0.15, harmonic: 0.15 },
    harmonized: { cognitive: 0.28, predictive: 0.28, systemic: 0.18, harmonic: 0.26 }
};

export const rendererConfig = {
    background: '#060608',
    trailOpacity: 0.12,
    hueSpeed: 0.08,
    minAlpha: 0.28,
    maxAlpha: 0.86,
    depthFade: 0.35
};

export const controlsConfig = {
    saveKey: 's',
    pauseKey: ' ',
    sensitivity: 0.005
};

// TODO: Make configs schema-validated at runtime so user-supplied overrides stay safe.
