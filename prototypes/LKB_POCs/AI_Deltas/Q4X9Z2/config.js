// PhaseCube Delta configuration (DeltaID: Q4X9Z2)
// Centralized tunables to keep the iteration minimal, human-readable, and easy to extend.

export const DELTA_ID = 'Q4X9Z2';

export const DEFAULT_CONFIG = {
  gridSize: 12, // Cube dimension. Keep modest for CPU friendliness; scale cautiously.
  scale: 22, // Spatial scale for projection.
  pointSize: 3.5, // Base rendered size per cell.
  noise: 0.02, // Plasma flip probability (prevents collapse).
  parityProbability: 0.0125, // Asymmetry toggles to avoid lock-in.
  pathBProbability: 0.55, // Difference-amplifying branch weight.
  alpha: 0.18, // Liquid→solid blending factor (persistence / damping).
  forgiveness: {
    threshold: 0.22, // Dispersion threshold that triggers kenotic damping.
    gain: 0.4 // Strength of damping when dispersion is high.
  },
  bias: {
    decay: 0.9, // How quickly injected bias fades.
    diffusion: 0.18, // Neighborhood spread per frame.
    gain: 0.24 // How strongly bias influences plasma during updates.
  },
  coupling: {
    coreToEcho: 0.15, // Cross-talk weight core → echo.
    echoToCore: 0.12 // Cross-talk weight echo → core.
  },
  renderer: {
    bg: '#050608',
    strokeAlpha: 0.3
  },
  lensProfiles: {
    Calm: { cognitive: 0.6, predictive: 0.2, systemic: 0.25, harmonic: 0.7 },
    Curious: { cognitive: 0.35, predictive: 0.55, systemic: 0.35, harmonic: 0.4 },
    Alert: { cognitive: 0.4, predictive: 0.65, systemic: 0.45, harmonic: 0.35 },
    Harmonic: { cognitive: 0.45, predictive: 0.35, systemic: 0.4, harmonic: 0.9 }
  },
  initialProfile: 'Calm'
};
