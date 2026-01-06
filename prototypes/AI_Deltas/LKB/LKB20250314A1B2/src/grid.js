import { config } from "./config.js";
import { clamp } from "./lens.js";

export class PhaseGrid {
  constructor(size = config.gridSize) {
    this.size = size;
    this.n = size ** 3;
    this.plasma = new Float32Array(this.n);
    this.liquid = new Float32Array(this.n);
    this.solid = new Float32Array(this.n);
    this.parity = new Int8Array(this.n);
    this.delayLine = Array.from({ length: config.delaySteps }, () => new Float32Array(this.n));
    this.delayPtr = 0;
    this.seed();
  }

  seed() {
    for (let i = 0; i < this.n; i++) {
      this.plasma[i] = Math.random() * 0.7 + 0.1;
      this.liquid[i] = Math.random() * 0.6 + 0.2;
      this.solid[i] = Math.random() * 0.3;
      this.parity[i] = Math.random() < 0.5 ? 1 : 0;
    }
  }

  idx(x, y, z) {
    return ((x + this.size) % this.size) + ((y + this.size) % this.size) * this.size + ((z + this.size) % this.size) * this.size * this.size;
  }

  neighborAvg(i, buffer) {
    const src = buffer || this.plasma;
    const s = this.size;
    const x = i % s;
    const y = Math.floor(i / s) % s;
    const z = Math.floor(i / (s * s));
    let sum = 0;
    let count = 0;
    const offsets = [
      [1, 0, 0],
      [-1, 0, 0],
      [0, 1, 0],
      [0, -1, 0],
      [0, 0, 1],
      [0, 0, -1]
    ];
    for (const [dx, dy, dz] of offsets) {
      sum += src[this.idx(x + dx, y + dy, z + dz)];
      count++;
    }
    return sum / count;
  }

  perturb(bias = null) {
    for (let i = 0; i < this.n; i++) {
      if (Math.random() < config.flipProbability) this.plasma[i] = 1 - this.plasma[i];
      if (Math.random() < config.parityProbability) this.parity[i] ^= 1;
      if (bias) {
        const delta = bias[i] * 0.6;
        this.plasma[i] = clamp(this.plasma[i] + delta, 0, 1);
      }
    }
  }

  step(opts) {
    const { bias = null, lens } = opts;
    const p0 = this.plasma.slice();
    const l0 = this.liquid.slice();
    const s0 = this.solid.slice();

    for (let i = 0; i < this.n; i++) {
      const p = p0[i];
      const l = l0[i];
      const s = s0[i];
      const avg = (p + l + s) / 3;
      const nb = Math.abs(p - this.neighborAvg(i, p0)) + this.parity[i] * 0.07;
      let probB = lens?.pathB ?? config.basePathB;
      if (bias) probB += bias[i] * 0.35;
      probB = clamp(probB, config.harmonicClamp[0], config.harmonicClamp[1]);

      const choice = Math.random() < probB ? nb : avg;
      const disp = Math.abs(choice - s);
      const forgiveness = disp > config.forgivenessThreshold ? lens?.damping ?? (1 - config.forgivenessDamp) : 1;

      this.liquid[i] = clamp(choice * forgiveness, 0, 1);
      this.solid[i] = clamp(s * (1 - config.alpha) + choice * config.alpha * forgiveness, 0, 1);
    }

    this.delayLine[this.delayPtr] = this.liquid.slice();
    this.delayPtr = (this.delayPtr + 1) % this.delayLine.length;
  }

  delayedBlend() {
    const out = new Float32Array(this.n);
    for (let i = 0; i < this.delayLine.length; i++) {
      const weight = (i + 1) / this.delayLine.length;
      const buffer = this.delayLine[(this.delayPtr + i) % this.delayLine.length];
      for (let j = 0; j < this.n; j++) out[j] += buffer[j] * weight;
    }
    for (let j = 0; j < this.n; j++) out[j] /= this.delayLine.length;
    return out;
  }

  metrics(biasAmplitude = 0) {
    let energy = 0;
    let dispersion = 0;
    for (let i = 0; i < this.n; i++) {
      energy += this.plasma[i];
      dispersion += Math.abs(this.liquid[i] - this.solid[i]);
    }
    return {
      energy: energy / this.n,
      dispersion: dispersion / this.n,
      biasAmplitude
    };
  }
}
