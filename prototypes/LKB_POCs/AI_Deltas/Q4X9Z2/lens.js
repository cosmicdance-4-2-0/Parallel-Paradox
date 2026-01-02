// Lens fusion helpers (DeltaID: Q4X9Z2)
// Maps four-lens weights into tunable simulation parameters to keep intent clear.

import { DEFAULT_CONFIG } from './config.js';

const clamp01 = (v) => Math.max(0, Math.min(1, v));

export function resolveProfile(name) {
  return DEFAULT_CONFIG.lensProfiles[name] || DEFAULT_CONFIG.lensProfiles[DEFAULT_CONFIG.initialProfile];
}

export function fuseLens(baseConfig, weights) {
  const cognitive = weights.cognitive ?? 0;
  const predictive = weights.predictive ?? 0;
  const systemic = weights.systemic ?? 0;
  const harmonic = weights.harmonic ?? 0;

  const noise = clamp01(baseConfig.noise * (1 + cognitive * 0.2 + predictive * 0.15));
  const pathBProbability = clamp01(baseConfig.pathBProbability * (1 + predictive * 0.25 - harmonic * 0.15));
  const forgivenessGain = Math.max(0.01, baseConfig.forgiveness.gain * (1 + harmonic * 0.6 - predictive * 0.2));
  const biasGain = Math.max(0, baseConfig.bias.gain * (1 + systemic * 0.35));
  const coupling = {
    coreToEcho: baseConfig.coupling.coreToEcho * (1 + systemic * 0.45),
    echoToCore: baseConfig.coupling.echoToCore * (1 + systemic * 0.35)
  };

  return {
    noise,
    pathBProbability,
    forgivenessGain,
    biasGain,
    coupling,
    weights
  };
}
