import { clamp } from "./utils.js";

export class LensFusion {
  constructor(config) {
    this.weights = { ...config.baseWeights };
    this.maxBiasGain = config.maxBiasGain;
    this.maxCrossTalkGain = config.maxCrossTalkGain;
    this.forgivenessBoost = config.forgivenessBoost;
    this.pathBlendBoost = config.pathBlendBoost;
  }

  setWeights(overrides = {}) {
    this.weights = { ...this.weights, ...overrides };
  }

  deriveControls(metrics) {
    const { energy, coherence, divergence } = metrics;
    const harmonicWeight = this.weights.harmonic ?? 0.25;
    const systemicWeight = this.weights.systemic ?? 0.25;
    const predictiveWeight = this.weights.predictive ?? 0.25;
    const humanWeight = this.weights.human ?? 0.25;

    const stability = clamp(coherence, 0, 1);
    const exploration = clamp(divergence, 0, 1);
    const drive = clamp(energy, 0, 1);

    const biasGain =
      clamp(
        drive * systemicWeight + exploration * predictiveWeight,
        0,
        this.maxBiasGain
      ) + humanWeight * 0.05;

    const crossTalkGain = clamp(
      stability * harmonicWeight * 0.5 + exploration * systemicWeight * 0.5,
      0,
      this.maxCrossTalkGain
    );

    const forgivenessBoost =
      harmonicWeight * this.forgivenessBoost * (1 - stability);
    const pathBlend =
      clamp(
        predictiveWeight * exploration + humanWeight * 0.2,
        0,
        this.pathBlendBoost
      ) + 0.05;

    return {
      biasGain,
      crossTalkGain,
      forgivenessBoost,
      pathBlend,
    };
  }
}
