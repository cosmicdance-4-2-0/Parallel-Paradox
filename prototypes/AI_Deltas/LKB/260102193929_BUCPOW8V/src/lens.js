function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function computeLensWeights(metrics, config) {
  const { phases, lens } = config;
  const weights = { ...lens.weights };
  const total = Object.values(weights).reduce((a, b) => a + b, 0) || 1;
  Object.keys(weights).forEach((k) => { weights[k] = weights[k] / total; });

  const biasEnergy = metrics.biasEnergy ?? 0;
  const dispersion = metrics.dispersion ?? 0;
  const energy = metrics.energy ?? 0.5;

  const predictiveBoost = weights.predictive * 0.05;
  const harmonicBrake = weights.harmonic * 0.03;
  const basePathB = clamp(
    phases.basePathB + predictiveBoost - harmonicBrake + biasEnergy * lens.biasGain,
    phases.pathBClamp[0],
    phases.pathBClamp[1]
  );

  const forgiveness = clamp(
    Math.max(lens.forgivenessFloor, phases.forgiveness + weights.harmonic * 0.4 + (dispersion > lens.dispersionThreshold ? 0.2 : 0)),
    0,
    1
  );

  const biasCoupling = clamp(1 + weights.systemic * 0.15 + (energy - 0.5) * 0.2, 0.5, 1.4);

  return {
    basePathB,
    forgiveness,
    biasCoupling,
    weights
  };
}
