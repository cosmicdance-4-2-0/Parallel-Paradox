import { clamp, clamp01, mean, variance } from './math.js';

export class PhaseGrid {
  constructor(size) {
    this.size = size;
    this.n = size ** 3;
    this.plasma = new Float32Array(this.n);
    this.liquid = new Float32Array(this.n);
    this.solid = new Float32Array(this.n);
    this.parity = new Int8Array(this.n);
    for (let i = 0; i < this.n; i += 1) {
      this.plasma[i] = Math.random();
      this.liquid[i] = Math.random();
      this.solid[i] = Math.random();
      this.parity[i] = Math.random() < 0.5 ? 1 : 0;
    }
  }

  idx(x, y, z) {
    const s = this.size;
    return ((x % s + s) % s) + (((y % s + s) % s) * s) + (((z % s + s) % s) * s * s);
  }

  neighborAvg(i) {
    const s = this.size;
    const x = i % s;
    const y = Math.floor(i / s) % s;
    const z = Math.floor(i / (s * s));
    let sum = 0;
    for (const [dx, dy, dz] of neighbors) {
      sum += this.plasma[this.idx(x + dx, y + dy, z + dz)];
    }
    return sum / neighbors.length;
  }

  perturb(noiseFlip, parityFlip, biasField) {
    for (let i = 0; i < this.n; i += 1) {
      if (Math.random() < noiseFlip) this.plasma[i] = 1 - this.plasma[i];
      if (Math.random() < parityFlip) this.parity[i] ^= 1;
      if (biasField) this.plasma[i] = clamp01(this.plasma[i] + biasField[i] * 0.5);
    }
  }

  step(opts) {
    const {
      basePath,
      alpha,
      parityWeight,
      biasField,
      biasGain,
      lensMix,
      harmonicClamp
    } = opts;
    const p0 = this.plasma.slice();
    const l0 = this.liquid.slice();
    const s0 = this.solid.slice();
    const pathProb = Math.max(0.05, Math.min(0.95, basePath));

    for (let i = 0; i < this.n; i += 1) {
      const p = p0[i];
      const l = l0[i];
      const s = s0[i];
      const avg = (p + l + s) / 3;
      const nb = Math.abs(p - this.neighborAvg(i)) + this.parity[i] * parityWeight;
      const biasTerm = biasField ? biasField[i] * biasGain : 0;
      const lensTerm = lensMix ? lensMix.pathBoost * 0.5 : 0;
      const probB = clamp(pathProb + biasTerm + lensTerm, 0.05, 0.95);
      const mix = Math.random() < probB ? nb : avg;
      this.liquid[i] = clamp01(mix);
      const damp = lensMix ? lensMix.damping * (harmonicClamp ?? 0) : 0;
      const alphaAdj = clamp(alpha - damp, 0.05, 0.5);
      this.solid[i] = clamp01(s * (1 - alphaAdj) + mix * alphaAdj);
    }
  }

  metrics() {
    const energy = mean(Array.from(this.plasma));
    const coh = 1 - clamp01(Math.sqrt(variance(Array.from(this.plasma), energy)));
    const divergence = Math.sqrt(variance(Array.from(this.liquid)));
    return { energy, coherence: coh, divergence };
  }
}

const neighbors = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1]
];
