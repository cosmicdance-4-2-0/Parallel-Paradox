import { clamp, wrapIndex } from "./utils.js";

export class PhaseLattice {
  constructor(size, config) {
    this.size = size;
    this.count = size * size * size;
    this.config = config;
    this.plasma = new Float32Array(this.count);
    this.liquid = new Float32Array(this.count);
    this.solid = new Float32Array(this.count);
    this.parity = new Int8Array(this.count);
    this.echo = new Float32Array(this.count);
    this._seed();
  }

  _seed() {
    for (let i = 0; i < this.count; i += 1) {
      this.plasma[i] = Math.random();
      this.liquid[i] = Math.random();
      this.solid[i] = Math.random();
      this.parity[i] = Math.random() > 0.5 ? 1 : 0;
      this.echo[i] = 0;
    }
  }

  reset() {
    this._seed();
  }

  _idx(x, y, z) {
    const s = this.size;
    return wrapIndex(x, s) + wrapIndex(y, s) * s + wrapIndex(z, s) * s * s;
  }

  _neighborAvg(src, i) {
    const s = this.size;
    const z = Math.floor(i / (s * s));
    const y = Math.floor((i - z * s * s) / s);
    const x = i - y * s - z * s * s;

    const px = wrapIndex(x + 1, s);
    const nx = wrapIndex(x - 1, s);
    const py = wrapIndex(y + 1, s);
    const ny = wrapIndex(y - 1, s);
    const pz = wrapIndex(z + 1, s);
    const nz = wrapIndex(z - 1, s);

    const total =
      src[this._idx(px, y, z)] +
      src[this._idx(nx, y, z)] +
      src[this._idx(x, py, z)] +
      src[this._idx(x, ny, z)] +
      src[this._idx(x, y, pz)] +
      src[this._idx(x, y, nz)];

    return total / 6;
  }

  applyBias(field, gain) {
    for (let i = 0; i < this.count; i += 1) {
      const nudged = this.plasma[i] + field[i] * gain;
      this.plasma[i] = clamp(nudged, 0, 1);
    }
  }

  perturb(noiseProb, parityProb) {
    for (let i = 0; i < this.count; i += 1) {
      if (Math.random() < noiseProb) {
        this.plasma[i] = clamp(this.plasma[i] + (Math.random() * 0.4 - 0.2), 0, 1);
      }
      if (Math.random() < parityProb) {
        this.parity[i] = this.parity[i] ? 0 : 1;
      }
    }
  }

  metrics() {
    let energy = 0;
    let variance = 0;
    let parityRatio = 0;
    for (let i = 0; i < this.count; i += 1) {
      energy += this.plasma[i];
      variance += this.liquid[i] * this.liquid[i];
      parityRatio += this.parity[i];
    }
    const meanEnergy = energy / this.count;
    return {
      meanEnergy,
      variance: variance / this.count,
      parityBias: parityRatio / this.count,
    };
  }

  step(params, biasField) {
    const {
      alpha,
      basePathBias,
      echoBlend,
      echoDecay,
      harmonicClamp,
      pathBiasShift,
      echoBoost,
      dampingBoost,
    } = params;

    const pathMix = clamp(basePathBias + pathBiasShift, harmonicClamp.min, harmonicClamp.max);
    const echoMix = clamp(echoBlend + echoBoost, 0, 1);
    const damp = clamp(1 - dampingBoost, 0.25, 1);

    const nextLiquid = new Float32Array(this.count);
    const nextSolid = new Float32Array(this.count);

    for (let i = 0; i < this.count; i += 1) {
      const p = this.plasma[i];
      const l = this.liquid[i];
      const s = this.solid[i];
      const e = this.echo[i];
      const nb = this._neighborAvg(this.plasma, i);
      const bias = biasField ? biasField[i] : 0;

      const pathA = (p + l + s) / 3;
      const pathB = Math.abs(p - nb) + this.parity[i] * 0.12 + bias * 0.6;
      const mix = pathA * (1 - pathMix) + pathB * pathMix;

      nextLiquid[i] = clamp(mix * damp, 0, 1);
      const blendedEcho = e * echoDecay + nextLiquid[i] * echoMix;
      nextSolid[i] = clamp(s * (1 - alpha) + blendedEcho * alpha, 0, 1);
      this.echo[i] = blendedEcho;
    }

    this.liquid = nextLiquid;
    this.solid = nextSolid;
  }
}
