export const DELTA_ID = "A9C3F7L2P5R8";

export const BASE_CONFIG = {
  dimensions: { x: 6, y: 6, z: 6 },
  noise: 0.08,
  alpha: 0.18,
  forgiveness: {
    threshold: 0.35,
    strength: 0.42
  },
  bias: {
    decay: 0.92,
    maxStrength: 0.45,
    echoReturn: 0.4,
    delayWeight: 0.35
  },
  coupling: {
    coreFromEcho: 0.24,
    coreFromMemory: 0.2,
    echoFromCore: 0.22,
    memoryFromCore: 0.16,
    memoryFromEcho: 0.12
  },
  delayDepth: 4,
  plasticityRate: 0.0025,
  lensPresets: {
    balanced: { human: 0.5, predictive: 0.5, systemic: 0.5, harmonic: 0.5 },
    exploratory: { human: 0.35, predictive: 0.8, systemic: 0.35, harmonic: 0.35 },
    harmonic: { human: 0.45, predictive: 0.35, systemic: 0.45, harmonic: 0.85 },
    systemic: { human: 0.35, predictive: 0.45, systemic: 0.85, harmonic: 0.55 }
  },
  schedulerScript: [
    { preset: "balanced", steps: 12 },
    { preset: "exploratory", steps: 10 },
    { preset: "harmonic", steps: 10 },
    { preset: "systemic", steps: 12 }
  ]
};
