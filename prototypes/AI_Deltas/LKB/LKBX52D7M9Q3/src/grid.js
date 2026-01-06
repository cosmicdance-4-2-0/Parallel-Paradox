import { coordFromIndex, idxFromCoord } from "./config.js";

export class PhaseLattice {
  constructor({ size, alpha, traceAlpha }) {
    this.size = size;
    this.alpha = alpha;
    this.traceAlpha = traceAlpha;
    const n = size * size * size;
    this.plasma = new Float32Array(n);
    this.liquid = new Float32Array(n);
    this.solid = new Float32Array(n);
    this.trace = new Float32Array(n);
    this.parity = new Int8Array(n);

    for (let i = 0; i < n; i += 1) {
      const seed = Math.random() * 0.5;
      this.plasma[i] = seed;
      this.liquid[i] = seed;
      this.solid[i] = seed;
      this.trace[i] = seed * 0.5;
    }
  }

  perturb({ flipProbability, parityProbability }, rng = Math.random) {
    for (let i = 0; i < this.plasma.length; i += 1) {
      if (rng() < flipProbability) {
        this.plasma[i] = 1 - this.plasma[i];
      }
      if (rng() < parityProbability) {
        this.parity[i] ^= 1;
      }
    }
  }

  neighborAvg(index) {
    const s = this.size;
    const x = index % s;
    const y = Math.floor(index / s) % s;
    const z = Math.floor(index / (s * s));

    const sample = (dx, dy, dz) => {
      const nx = (x + dx + s) % s;
      const ny = (y + dy + s) % s;
      const nz = (z + dz + s) % s;
      return this.plasma[idxFromCoord(nx, ny, nz, s)];
    };

    return (
      sample(1, 0, 0) +
      sample(-1, 0, 0) +
      sample(0, 1, 0) +
      sample(0, -1, 0) +
      sample(0, 0, 1) +
      sample(0, 0, -1)
    ) / 6;
  }

  step(lensMix, biasField, rng = Math.random) {
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
      const choosePathB = rng() < lensMix.pathBProbability;
      const bias = biasField ? biasField.valueAtIndex(i) * lensMix.biasGain : 0;

      let mix = choosePathB ? neighborDelta : avg;
      mix = (mix + bias) % 1;
      mix = avg + (mix - avg) * lensMix.damping;

      newLiquid[i] = mix;
      newSolid[i] = (s * (1 - this.alpha) + mix * this.alpha) % 1;
      newTrace[i] = this.trace[i] * (1 - this.traceAlpha) + mix * this.traceAlpha;
    }

    this.liquid = newLiquid;
    this.solid = newSolid;
    this.trace = newTrace;
  }

  metrics(biasField) {
    const n = this.plasma.length;
    let energy = 0;
    let traceTotal = 0;
    let dispersionAccumulator = 0;

    for (let i = 0; i < n; i += 1) {
      energy += this.plasma[i];
      traceTotal += this.trace[i];
    }

    const meanEnergy = energy / n;

    for (let i = 0; i < n; i += 1) {
      const diff = this.plasma[i] - meanEnergy;
      dispersionAccumulator += diff * diff;
    }

    const dispersion = Math.sqrt(dispersionAccumulator / n);
    const biasLoad = biasField ? biasField.average() : 0;

    return {
      energy: meanEnergy,
      dispersion,
      biasLoad,
      traceMean: traceTotal / n
    };
  }

  selectOracle(sampleCount = 16, rng = Math.random) {
    let best = null;
    for (let i = 0; i < sampleCount; i += 1) {
      const idx = Math.floor(rng() * this.liquid.length);
      const score = this.liquid[idx] + this.trace[idx] * 0.2 + this.parity[idx] * 0.05;
      if (!best || score > best.score) {
        best = { idx, score };
      }
    }
    // TODO: Explore multi-grid or quorum-based oracle selection for richer consensus sampling.
    const coords = best ? coordFromIndex(best.idx, this.size) : { x: 0, y: 0, z: 0 };
    return {
      index: best?.idx ?? 0,
      coords,
      liquid: best ? this.liquid[best.idx] : 0,
      solid: best ? this.solid[best.idx] : 0,
      trace: best ? this.trace[best.idx] : 0,
      parity: best ? this.parity[best.idx] : 0
    };
  }
}
