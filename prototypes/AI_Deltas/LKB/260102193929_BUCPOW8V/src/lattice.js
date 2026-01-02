import { DELTA_ID } from './config.js';

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

export class PhaseLattice {
  constructor(size, phases) {
    this.size = size;
    this.count = size ** 3;
    this.phases = phases;
    this.plasma = new Float32Array(this.count);
    this.liquid = new Float32Array(this.count);
    this.solid = new Float32Array(this.count);
    this.parity = new Int8Array(this.count);
    this.positions = new Float32Array(this.count * 3);
    this._seed();
    this._precomputePositions();
  }

  _seed() {
    for (let i = 0; i < this.count; i++) {
      this.plasma[i] = Math.random() * 0.8 + 0.1;
      this.liquid[i] = Math.random() * 0.6 + 0.2;
      this.solid[i] = Math.random() * 0.3;
      this.parity[i] = Math.random() < 0.5 ? 1 : 0;
    }
  }

  _precomputePositions() {
    const half = (this.size - 1) / 2;
    let ptr = 0;
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        for (let z = 0; z < this.size; z++) {
          this.positions[ptr++] = x - half;
          this.positions[ptr++] = y - half;
          this.positions[ptr++] = z - half;
        }
      }
    }
  }

  idx(x, y, z) {
    const s = this.size;
    return ((x + s) % s) + ((y + s) % s) * s + ((z + s) % s) * s * s;
  }

  neighborAvg(index, plasmaSnapshot) {
    const s = this.size;
    const x = index % s;
    const y = Math.floor(index / s) % s;
    const z = Math.floor(index / (s * s));
    let sum = 0;
    for (let dz = -1; dz <= 1; dz++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0 && dz === 0) continue;
          sum += plasmaSnapshot[this.idx(x + dx, y + dy, z + dz)];
        }
      }
    }
    return sum / 26;
  }

  perturb(bias) {
    const { flipProbability, parityProbability } = this.phases;
    for (let i = 0; i < this.count; i++) {
      if (Math.random() < flipProbability) this.plasma[i] = 1 - this.plasma[i];
      if (Math.random() < parityProbability) this.parity[i] ^= 1;

      const dreamJitter = (Math.random() * 0.5 + 0.5) * 0.004;
      this.liquid[i] = clamp01(this.liquid[i] + (this.parity[i] ? dreamJitter : -dreamJitter));

      if (bias) {
        const b = bias[i] || 0;
        this.plasma[i] = clamp01(this.plasma[i] + b * 0.01);
        if (Math.abs(b) > 0.02) {
          const audioJitter = Math.abs(b) * 0.01;
          this.liquid[i] = clamp01(this.liquid[i] + (this.parity[i] ? audioJitter : -audioJitter));
        }
      }
    }
  }

  forgivenessOperator(value, forgiveness) {
    const f = clamp01(forgiveness);
    return value * (1 - f * Math.min(1, value));
  }

  step(bias, lensWeights) {
    const { alpha, pathBClamp } = this.phases;
    const basePathB = lensWeights?.basePathB ?? this.phases.basePathB;
    const forgiveness = lensWeights?.forgiveness ?? this.phases.forgiveness;
    const biasCoupling = lensWeights?.biasCoupling ?? 1;

    const p0 = this.plasma.slice();
    const l0 = this.liquid.slice();
    const s0 = this.solid.slice();

    for (let i = 0; i < this.count; i++) {
      const p = p0[i];
      const l = l0[i];
      const s = s0[i];
      const avg = (p + l + s) / 3;
      const neighborDelta = Math.abs(p - this.neighborAvg(i, p0)) + this.parity[i] * 0.08;
      const biasTerm = bias ? bias[i] * 0.08 * biasCoupling : 0;
      let pathB = basePathB + biasTerm;
      pathB = Math.max(pathBClamp[0], Math.min(pathBClamp[1], pathB));
      const chosen = Math.random() < pathB ? neighborDelta : avg;
      const damped = this.forgivenessOperator(chosen, forgiveness);
      this.liquid[i] = clamp01(damped);
      this.solid[i] = s * (1 - alpha) + damped * alpha;
    }
  }

  metrics(biasEnergy = 0) {
    let liquidSum = 0;
    let liquidSq = 0;
    for (let i = 0; i < this.count; i++) {
      const l = this.liquid[i];
      liquidSum += l;
      liquidSq += l * l;
    }
    const mean = liquidSum / this.count;
    const variance = clamp01(liquidSq / this.count - mean * mean);
    return {
      energy: clamp01(mean),
      dispersion: Math.sqrt(variance),
      biasEnergy,
      deltaId: DELTA_ID
    };
  }

  witness(sampleCount = 5) {
    const picks = [];
    for (let i = 0; i < sampleCount; i++) {
      const idx = Math.floor(Math.random() * this.count);
      picks.push({
        index: idx,
        plasma: Number(this.plasma[idx].toFixed(3)),
        liquid: Number(this.liquid[idx].toFixed(3)),
        solid: Number(this.solid[idx].toFixed(3)),
        parity: this.parity[idx]
      });
    }
    return picks;
  }
}
