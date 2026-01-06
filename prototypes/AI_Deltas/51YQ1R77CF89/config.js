// PhaseCube Delta config (DeltaID: 51YQ1R77CF89)
// Tunable defaults kept in one place for readability. Adjust sliders in the UI to override live.

export const DEFAULT_CONFIG = {
  gridSize: 14,
  scale: 24,
  flipProbability: 0.015,
  parityProbability: 0.006,
  alpha: 0.18,
  memory: {
    decay: 0.9,
    gain: 0.35
  },
  lenses: {
    human: 0.28, // smoothing & persistence
    predictive: 0.32, // difference amplification
    systemic: 0.22, // global drift toward swarm mean
    harmonic: 0.18 // dynamic damping to avoid collapse
  },
  bias: {
    amplitude: 0.08,
    period: 480,
    jitter: 0.25
  },
  forgiveness: {
    varianceSoftCap: 0.12,
    minDamp: 0.65,
    maxBoost: 1.15
  },
  renderer: {
    pointSize: 4,
    bg: '#06080b',
    stroke: 'rgba(255,255,255,0.85)'
  }
};

// Small helper for nested overrides without losing defaults.
export function withOverrides(base, overrides = {}) {
  const merged = structuredClone(base);
  for (const key of Object.keys(overrides)) {
    const value = overrides[key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      merged[key] = { ...merged[key], ...value };
    } else {
      merged[key] = value;
    }
  }
  return merged;
}

// TODO: Add URL param ingestion so remote runs can share configs, for easier collaborative tuning.
