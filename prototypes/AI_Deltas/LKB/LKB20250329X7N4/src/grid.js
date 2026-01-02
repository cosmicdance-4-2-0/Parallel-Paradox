import { clamp, wrapIndex, avg, variance } from "./utils.js";

export class PhaseGrid {
  constructor(size, alpha) {
    this.size = size;
    this.alpha = alpha;
    this.count = size * size * size;
    this.plasma = new Float32Array(this.count);
    this.liquid = new Float32Array(this.count);
    this.solid = new Float32Array(this.count);
    this.parity = new Int8Array(this.count);
    for (let i = 0; i < this.count; i++) {
      this.plasma[i] = Math.random() * 0.5;
      this.liquid[i] = Math.random() * 0.5;
      this.solid[i] = Math.random() * 0.5;
      this.parity[i] = 0;
    }
  }

  idx(x, y, z) {
    const s = this.size;
    return x + y * s + z * s * s;
  }

  perturb(flipProbability, parityProbability) {
    for (let i = 0; i < this.count; i++) {
      if (Math.random() < flipProbability) this.plasma[i] = 1 - this.plasma[i];
      if (Math.random() < parityProbability) this.parity[i] ^= 1;
    }
  }

  effectivePlasma(index, biasField, biasGain, echoField, echoGain) {
    const bias = biasField ? biasField.valueAt(index) * biasGain : 0;
    const echo = echoField ? echoField[index] * echoGain : 0;
    return clamp(this.plasma[index] + bias + echo, 0, 1);
  }

  neighborAvg(index, biasField, biasGain, echoField, echoGain) {
    const s = this.size;
    const x = index % s;
    const y = Math.floor(index / s) % s;
    const z = Math.floor(index / (s * s));
    const get = (dx, dy, dz) => {
      const ix = wrapIndex(x + dx, s);
      const iy = wrapIndex(y + dy, s);
      const iz = wrapIndex(z + dz, s);
      const idx = this.idx(ix, iy, iz);
      return this.effectivePlasma(idx, biasField, biasGain, echoField, echoGain);
    };
    return (
      get(1, 0, 0) +
      get(-1, 0, 0) +
      get(0, 1, 0) +
      get(0, -1, 0) +
      get(0, 0, 1) +
      get(0, 0, -1)
    ) / 6;
  }

  step(options) {
    const {
      pathBProb,
      damping,
      forgiveness,
      biasField,
      biasGain,
      echoField,
      echoGain
    } = options;

    const nextLiquid = new Float32Array(this.count);
    const nextSolid = new Float32Array(this.count);

    for (let i = 0; i < this.count; i++) {
      const p = this.effectivePlasma(i, biasField, biasGain, echoField, echoGain);
      const l = this.liquid[i];
      const s = this.solid[i];

      const avgBlend = (p + l + s) / 3;
      const diff = Math.abs(p - this.neighborAvg(i, biasField, biasGain, echoField, echoGain)) + (this.parity[i] ? 0.13 : 0);
      let mix = Math.random() < pathBProb ? diff : avgBlend;

      const delta = Math.abs(diff - avgBlend);
      const forgivenessFactor = delta > forgiveness.threshold ? 1 - forgiveness.damp : 1;
      mix = mix * forgivenessFactor + avgBlend * (1 - forgivenessFactor);

      const damped = mix * (1 - damping) + avgBlend * damping;
      nextLiquid[i] = clamp(damped, 0, 1);
      nextSolid[i] = (s * (1 - this.alpha) + nextLiquid[i] * this.alpha) % 1;
    }

    this.liquid = nextLiquid;
    this.solid = nextSolid;
  }

  metrics() {
    const energy = avg(Array.from(this.plasma));
    const dispersion = variance(Array.from(this.liquid), avg(Array.from(this.liquid)));
    return { energy, dispersion };
  }
}
