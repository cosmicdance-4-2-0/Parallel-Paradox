import { clamp, computeVariance, randomFloat } from './util.js';

export class PhaseGrid {
  constructor(size, { flipProbability, parityProbability, pathBProbability, alpha }) {
    this.size = size;
    this.flipProbability = flipProbability;
    this.parityProbability = parityProbability;
    this.pathBProbability = pathBProbability;
    this.alpha = alpha;

    const total = size ** 3;
    this.plasma = new Float32Array(total).map(() => randomFloat(0, 0.5));
    this.liquid = new Float32Array(total).map(() => randomFloat(0, 0.5));
    this.solid = new Float32Array(total).map(() => randomFloat(0, 0.5));
    this.parity = new Int8Array(total).map(() => 0);
  }

  index(x, y, z) {
    const n = this.size;
    const wrap = (v) => (v + n) % n;
    return wrap(x) * n * n + wrap(y) * n + wrap(z);
  }

  neighborAvg(i) {
    const n = this.size;
    const z = i % n;
    const y = Math.floor(i / n) % n;
    const x = Math.floor(i / (n * n));

    const get = (dx, dy, dz) => this.plasma[this.index(x + dx, y + dy, z + dz)];
    return (
      get(1, 0, 0) +
      get(-1, 0, 0) +
      get(0, 1, 0) +
      get(0, -1, 0) +
      get(0, 0, 1) +
      get(0, 0, -1)
    ) / 6;
  }

  perturb() {
    for (let i = 0; i < this.plasma.length; i += 1) {
      if (Math.random() < this.flipProbability) {
        this.plasma[i] = (this.plasma[i] + randomFloat(-0.15, 0.25)) % 1;
        if (this.plasma[i] < 0) this.plasma[i] += 1;
      }
      if (Math.random() < this.parityProbability) {
        this.parity[i] = this.parity[i] === 0 ? 1 : 0;
      }
    }
  }

  variance() {
    return computeVariance(this.plasma);
  }

  step(lensMix, biasField, forgiveness) {
    const { pathBWeight } = lensMix;
    const len = this.plasma.length;
    const nextLiquid = new Float32Array(len);
    const nextSolid = new Float32Array(len);

    const forgivenessEvents = [];
    const variance = this.variance();
    const applyForgiveness = variance > forgiveness.varianceThreshold;
    const dampening = applyForgiveness ? forgiveness.dampening : 1;

    for (let i = 0; i < len; i += 1) {
      const p = this.plasma[i];
      const l = this.liquid[i];
      const s = this.solid[i];
      const nb = this.neighborAvg(i);
      const bias = biasField.sample(i);

      const pathA = (p + l + s) / 3;
      const pathBDiff = Math.abs(p - nb) + this.parity[i] * 0.13 + bias * 0.5;
      const biasWeightedP = clamp(this.pathBProbability + bias * 0.2, 0, 1);
      const usePathB = Math.random() < (pathBWeight * 0.5 + biasWeightedP * 0.5);
      const mix = usePathB ? pathBDiff : pathA;

      const damped = mix * dampening + pathA * (1 - dampening);
      nextLiquid[i] = damped;
      nextSolid[i] = (s * (1 - this.alpha) + damped * this.alpha) % 1;
    }

    this.liquid = nextLiquid;
    this.solid = nextSolid;

    if (applyForgiveness) forgivenessEvents.push({ variance, dampening });
    return forgivenessEvents;
  }
}
