// PhaseCube Delta (DeltaID: A6P9Q4)
// Centralized defaults plus a helper for tuned overrides.
// TODO: Thing, for reasons — expose a preset loader that can switch between experimental configs.

export const DEFAULT_CONFIG = {
  deltaId: 'A6P9Q4',
  gridSize: 10,
  scale: 12,
  flipProbability: 0.018,
  parityProbability: 0.04,
  alpha: 0.14,
  pathBProbability: 0.32,
  renderer: {
    pointSize: 2.4,
    bg: 'rgba(6, 8, 12, 0.92)',
    strokeAlpha: 0.9
  },
  coupling: {
    cross: 0.16,
    scoutToCore: 0.1,
    echoToCore: 0.18
  },
  delay: {
    length: 18,
    decay: 0.9,
    gain: 0.22
  },
  plasticity: {
    window: 12,
    rewireProbability: 0.0025
  },
  lenses: {
    human: 0.68,
    predictive: 0.52,
    systemic: 0.56,
    harmonic: 0.74
  },
  lensGains: {
    bias: 0.14,
    mixShift: 0.1,
    memoryGain: 0.12,
    noiseFloor: 0.6
  }
};

export function withOverrides(base, updates) {
  const next = structuredClone(base);
  const apply = (target, source) => {
    Object.entries(source).forEach(([key, value]) => {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        target[key] = target[key] || {};
        apply(target[key], value);
      } else {
        target[key] = value;
      }
    });
  };
  apply(next, updates);
  return next;
}
