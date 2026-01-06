import { clamp, mix } from "./utils.js";

export class LensController {
  constructor(config) {
    this.weights = { ...config.LENSES };
    this.biasTrace = 0;
  }

  setWeight(name, value) {
    if (this.weights[name] !== undefined) {
      this.weights[name] = clamp(value, 0, 1);
    }
  }

  tick(biasEnergy) {
    this.biasTrace = mix(this.biasTrace, Math.abs(biasEnergy), 0.1);
  }

  /**
   * Returns [wA, wB] weights for path blending.
   * - Human/Systemic lean toward stabilization (Path A).
   * - Predictive leans toward exploration (Path B).
   * - Harmonic tempers both based on accumulated bias.
   */
  blendWeights(plasma, parity, biasEnergy) {
    const stabilizer = (this.weights.human + this.weights.systemic) * 0.5;
    const explorer = this.weights.predictive;
    const harmonic = this.weights.harmonic;

    const biasPulse = clamp(Math.abs(biasEnergy) * (0.4 + this.biasTrace), 0, 1);
    const parityNudge = parity ? 0.08 : -0.06;

    let wA = clamp(stabilizer + parityNudge + harmonic * (1 - plasma), 0, 1);
    let wB = clamp(explorer + biasPulse + harmonic * plasma, 0, 1);

    const total = wA + wB || 1;
    wA /= total;
    wB /= total;
    return [wA, wB];
  }
}
