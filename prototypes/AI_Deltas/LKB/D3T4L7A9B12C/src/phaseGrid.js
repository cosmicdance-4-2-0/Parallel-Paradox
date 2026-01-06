import { clamp, toroidalIndex } from './utils.js';

export class PhaseGrid {
  constructor(size, config, rng = Math) {
    this.size = size;
    this.length = size * size * size;
    this.config = config;
    this.rng = rng;
    this.plasma = new Float32Array(this.length);
    this.liquid = new Float32Array(this.length);
    this.solid = new Float32Array(this.length);
    this.parity = new Int8Array(this.length);
    this._init();
  }

  _init() {
    for (let i = 0; i < this.length; i += 1) {
      this.plasma[i] = this.rng.random ? this.rng.random() * 0.5 : Math.random() * 0.5;
      this.liquid[i] = this.rng.random ? this.rng.random() * 0.5 : Math.random() * 0.5;
      this.solid[i] = this.rng.random ? this.rng.random() * 0.5 : Math.random() * 0.5;
      this.parity[i] = 0;
    }
  }

  perturb() {
    const { flipProbability, parityProbability } = this.config;
    for (let i = 0; i < this.length; i += 1) {
      const rand = this.rng.random ? this.rng.random() : Math.random();
      if (rand < flipProbability) {
        this.plasma[i] = 1 - this.plasma[i];
      }
      const randParity = this.rng.random ? this.rng.random() : Math.random();
      if (randParity < parityProbability) {
        this.parity[i] = 1 - this.parity[i];
      }
    }
  }

  neighborAverage(idx) {
    const size = this.size;
    const layer = size * size;
    const z = Math.floor(idx / layer);
    const remainder = idx % layer;
    const y = Math.floor(remainder / size);
    const x = remainder % size;

    const neighbors = [
      toroidalIndex(x + 1, y, z, size),
      toroidalIndex(x - 1, y, z, size),
      toroidalIndex(x, y + 1, z, size),
      toroidalIndex(x, y - 1, z, size),
      toroidalIndex(x, y, z + 1, size),
      toroidalIndex(x, y, z - 1, size)
    ];

    let sum = 0;
    for (const n of neighbors) {
      sum += this.plasma[n];
    }
    return sum / neighbors.length;
  }

  maybeRewire() {
    // Minimal structural plasticity: occasionally swap plasma values between random neighbors.
    const { plasticityProbability } = this.config;
    const rand = this.rng.random ? this.rng.random() : Math.random();
    if (rand < plasticityProbability) {
      const i = Math.floor((this.rng.random ? this.rng.random() : Math.random()) * this.length);
      let j = Math.floor((this.rng.random ? this.rng.random() : Math.random()) * this.length);
      if (i === j) {
        j = (j + 1) % this.length;
      }
      const tmp = this.plasma[i];
      this.plasma[i] = this.plasma[j];
      this.plasma[j] = tmp;
    }
  }

  step(biasField, lensWeights, options = {}) {
    const {
      pathBProbability,
      alpha,
      forgiveness: { threshold, strength },
      bias: { gain }
    } = this.config;

    const biasData = biasField ? biasField.field : null;
    const delayBias = options.delayBias || null;
    const systemicGain = clamp(0.1 + (lensWeights.systemic || 0) * 0.3, 0, 0.6);
    const predictiveTilt = clamp(pathBProbability * (0.8 + (lensWeights.predictive || 0) * 0.6), 0, 1);
    const harmonicStrength = clamp(strength * (0.5 + (lensWeights.harmonic || 0) * 0.7), 0, 1);

    const newLiquid = new Float32Array(this.length);
    const newSolid = new Float32Array(this.length);
    let energySum = 0;
    let divergenceSum = 0;

    for (let i = 0; i < this.length; i += 1) {
      const p = this.plasma[i];
      const l = this.liquid[i];
      const s = this.solid[i];
      const nb = this.neighborAverage(i);
      const baseAvg = (p + l + s) / 3;
      const diff = Math.abs(p - nb) + this.parity[i] * 0.13;
      const pathChoice = (this.rng.random ? this.rng.random() : Math.random()) < predictiveTilt;
      let mix = pathChoice ? diff : baseAvg;

      const biasValue = biasData ? biasData[i] : 0;
      const delayed = delayBias ? delayBias[i] : 0;
      const combinedBias = (biasValue + delayed) * gain;
      mix = mix * (1 - systemicGain) + combinedBias * systemicGain + (lensWeights.cognitive || 0) * 0.05;

      const dispersion = Math.abs(mix - s);
      if (dispersion > threshold) {
        mix = s + (mix - s) * (1 - harmonicStrength);
      }

      newLiquid[i] = mix;
      newSolid[i] = (s * (1 - alpha) + mix * alpha) % 1;
      energySum += mix;
      divergenceSum += dispersion;
    }

    this.liquid = newLiquid;
    this.solid = newSolid;
    this.maybeRewire();

    return {
      averageEnergy: energySum / this.length,
      averageDivergence: divergenceSum / this.length
    };
  }
}
