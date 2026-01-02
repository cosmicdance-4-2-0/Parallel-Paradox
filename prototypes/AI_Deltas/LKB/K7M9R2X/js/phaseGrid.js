import { clamp01, modulo } from "./utils.js";

export class PhaseGrid {
  constructor(size, label = "grid") {
    this.size = size;
    this.count = size * size * size;
    this.label = label;
    this.plasma = new Float32Array(this.count);
    this.liquid = new Float32Array(this.count);
    this.solid = new Float32Array(this.count);
    this.parity = new Int8Array(this.count);
    this._nextLiquid = new Float32Array(this.count);
    this._nextSolid = new Float32Array(this.count);
    this._scratchCross = new Float32Array(this.count);
    this.seed(Math.random);
    this._neighborOffsets = this.buildNeighborOffsets();
  }

  buildNeighborOffsets() {
    const n = this.size;
    const offsets = new Int32Array(6);
    offsets[0] = 1;
    offsets[1] = -1;
    offsets[2] = n;
    offsets[3] = -n;
    offsets[4] = n * n;
    offsets[5] = -n * n;
    return offsets;
  }

  seed(rng = Math.random) {
    for (let i = 0; i < this.count; i++) {
      this.plasma[i] = rng() * 0.6;
      this.liquid[i] = rng() * 0.6;
      this.solid[i] = rng() * 0.6;
      this.parity[i] = rng() > 0.5 ? 1 : 0;
    }
  }

  perturb(noise = 0.01, parityFlip = 0.002, rng = Math.random) {
    for (let i = 0; i < this.count; i++) {
      if (rng() < parityFlip) {
        this.parity[i] = this.parity[i] ? 0 : 1;
      }
      // Plasma noise prevents collapse.
      this.plasma[i] = clamp01((this.plasma[i] + (rng() - 0.5) * noise) % 1);
    }
  }

  neighborAverage(i, data) {
    const n = this.size;
    const z = Math.floor(i / (n * n));
    const y = Math.floor((i - z * n * n) / n);
    const x = i % n;
    const neighbors = [
      [x + 1, y, z],
      [x - 1, y, z],
      [x, y + 1, z],
      [x, y - 1, z],
      [x, y, z + 1],
      [x, y, z - 1],
    ];
    let sum = 0;
    for (let k = 0; k < neighbors.length; k++) {
      const [nx, ny, nz] = neighbors[k];
      const idx =
        modulo(nx, n) + modulo(ny, n) * n + modulo(nz, n) * n * n;
      sum += data[idx];
    }
    return sum / neighbors.length;
  }

  computeCrossGradient(target) {
    const n = this.size;
    for (let i = 0; i < this.count; i++) {
      const grad = Math.abs(this.plasma[i] - this.neighborAverage(i, this.plasma));
      target[i] = grad;
    }
  }

  step({
    biasField,
    crossField,
    pathBWeight,
    forgiveness,
    memoryBlend,
    noise,
    rng = Math.random,
  }) {
    const { plasma, liquid, solid, parity, _nextLiquid, _nextSolid } = this;
    const bias = biasField?.field;
    const cross = crossField || this._scratchCross;

    if (!crossField) {
      this.computeCrossGradient(cross);
    }

    let energySum = 0;
    let varianceSum = 0;

    for (let i = 0; i < this.count; i++) {
      const p = plasma[i];
      const l = liquid[i];
      const s = solid[i];
      const avg = (p + l + s) / 3;
      const neighbor = this.neighborAverage(i, plasma);
      const variance = Math.abs(p - neighbor);
      const biasEnergy = bias ? bias[i] : 0;
      const crossEnergy = cross ? cross[i] : 0;

      // Path B amplifies gradients; Path A smooths them.
      const pathA = avg;
      const pathB = variance + parity[i] * 0.12 + biasEnergy + crossEnergy;
      const mix = rng() < pathBWeight ? pathB : pathA;

      const damp = 1 - clamp01(forgiveness * variance);
      const blended = mix * damp + pathA * (1 - damp) * 0.4;
      const next = blended % 1;

      _nextLiquid[i] = next;
      _nextSolid[i] = (s * (1 - memoryBlend) + next * memoryBlend) % 1;
      plasma[i] = clamp01((p + (rng() - 0.5) * noise + biasEnergy * 0.05) % 1);

      energySum += next;
      varianceSum += variance;
    }

    // Swap buffers.
    this.liquid.set(_nextLiquid);
    this.solid.set(_nextSolid);

    // TODO: Add optional per-cell tempo to explore asynchronous updates, for richer swarm textures.
    return {
      energy: energySum / this.count,
      coherence: 1 - clamp01(varianceSum / this.count),
    };
  }
}
