import { clamp } from "./config.js";

export class PhaseGrid {
  constructor(size, params) {
    this.size = size;
    this.alpha = params.alpha;
    this.traceAlpha = params.traceAlpha;
    this.flipProbability = params.flipProbability;
    this.parityProbability = params.parityProbability;

    const n = size * size * size;
    this.plasma = new Float32Array(n);
    this.liquid = new Float32Array(n);
    this.solid = new Float32Array(n);
    this.trace = new Float32Array(n);
    this.parity = new Int8Array(n);

    for (let i = 0; i < n; i += 1) {
      const seed = Math.random() * 0.6;
      this.plasma[i] = seed;
      this.liquid[i] = seed;
      this.solid[i] = seed;
      this.trace[i] = seed * 0.5;
    }
  }

  perturb(scale = 1, rng = Math.random) {
    const flipP = Math.min(0.45, this.flipProbability * scale);
    const parityP = Math.min(0.45, this.parityProbability * scale);
    for (let i = 0; i < this.plasma.length; i += 1) {
      if (rng() < flipP) this.plasma[i] = 1 - this.plasma[i];
      if (rng() < parityP) this.parity[i] ^= 1;
    }
  }

  neighborAvg(index) {
    const s = this.size;
    const x = index % s;
    const y = Math.floor(index / s) % s;
    const z = Math.floor(index / (s * s));
    const idx = (nx, ny, nz) => ((nx + s) % s) + ((ny + s) % s) * s + ((nz + s) % s) * s * s;
    return (
      this.plasma[idx(x + 1, y, z)] +
      this.plasma[idx(x - 1, y, z)] +
      this.plasma[idx(x, y + 1, z)] +
      this.plasma[idx(x, y - 1, z)] +
      this.plasma[idx(x, y, z + 1)] +
      this.plasma[idx(x, y, z - 1)]
    ) / 6;
  }

  step(lensMix, biasField, rng = Math.random) {
    const { pathBProbability = 0.62, damping = 1, biasGain = 1 } = lensMix ?? {};
    const n = this.plasma.length;
    const newLiquid = new Float32Array(n);
    const newSolid = new Float32Array(n);
    const newTrace = new Float32Array(n);

    for (let i = 0; i < n; i += 1) {
      const p = this.plasma[i];
      const l = this.liquid[i];
      const s = this.solid[i];
      const avg = (p + l + s) / 3;
      const neighborDelta = Math.abs(p - this.neighborAvg(i)) + this.parity[i] * 0.13;
      const branch = rng() < pathBProbability ? neighborDelta : avg;
      const bias = biasField ? biasField[i] * biasGain : 0;
      const mix = avg + (branch + bias - avg) * damping;

      newLiquid[i] = clamp(mix, 0, 1);
      newSolid[i] = clamp(s * (1 - this.alpha) + mix * this.alpha, 0, 1);
      newTrace[i] = clamp(this.trace[i] * (1 - this.traceAlpha) + mix * this.traceAlpha, 0, 1);
    }

    this.liquid = newLiquid;
    this.solid = newSolid;
    this.trace = newTrace;
  }

  metrics(biasField) {
    const n = this.plasma.length;
    let energy = 0;
    let traceTotal = 0;
    for (let i = 0; i < n; i += 1) {
      energy += this.liquid[i];
      traceTotal += this.trace[i];
    }
    const meanEnergy = energy / n;

    let dispersionAccumulator = 0;
    for (let i = 0; i < n; i += 1) {
      const diff = this.liquid[i] - meanEnergy;
      dispersionAccumulator += diff * diff;
    }

    const dispersion = Math.sqrt(dispersionAccumulator / n);
    const biasLoad = biasField ? (typeof biasField.average === "function" ? biasField.average() : 0) : 0;

    return {
      energy: meanEnergy,
      dispersion,
      biasLoad,
      traceMean: traceTotal / n
    };
  }

  oracle(sampleCount = 8, rng = Math.random) {
    let best = null;
    for (let i = 0; i < sampleCount; i += 1) {
      const idx = Math.floor(rng() * this.liquid.length);
      const score = this.liquid[idx] + this.trace[idx] * 0.2 + this.parity[idx] * 0.05;
      if (!best || score > best.score) {
        best = { idx, score };
      }
    }
    const idx = best?.idx ?? 0;
    const s = this.size;
    const x = idx % s;
    const y = Math.floor(idx / s) % s;
    const z = Math.floor(idx / (s * s));
    return {
      index: idx,
      coords: { x, y, z },
      liquid: this.liquid[idx],
      solid: this.solid[idx],
      trace: this.trace[idx],
      parity: this.parity[idx]
    };
  }
}
