import { clamp } from './utils.js';

export class PhaseGrid {
  constructor(size, swarmConfig) {
    this.size = size;
    this.length = size ** 3;
    this.plasma = new Float32Array(this.length);
    this.liquid = new Float32Array(this.length);
    this.solid = new Float32Array(this.length);
    this.parity = new Uint8Array(this.length);
    this.swarm = swarmConfig;
    this.energy = 0;
    this.seed();
  }

  seed() {
    for (let i = 0; i < this.length; i++) {
      this.plasma[i] = Math.random() * 0.2 - 0.1;
      this.liquid[i] = Math.random() * 0.2 - 0.1;
      this.solid[i] = 0;
      this.parity[i] = Math.random() > 0.5 ? 1 : 0;
    }
  }

  index(x, y, z) {
    const sx = (x + this.size) % this.size;
    const sy = (y + this.size) % this.size;
    const sz = (z + this.size) % this.size;
    return (sx * this.size + sy) * this.size + sz;
  }

  step(inputField) {
    const nextPlasma = new Float32Array(this.length);
    const nextLiquid = new Float32Array(this.length);
    const nextSolid = new Float32Array(this.length);
    const { flipProbability, parityProbability, pathBWeight, alpha, forgiveness } = this.swarm;
    let totalEnergy = 0;

    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        for (let z = 0; z < this.size; z++) {
          const idx = this.index(x, y, z);
          const p = this.parity[idx];
          const plasma = this.plasma[idx];
          const liquid = this.liquid[idx];
          const solid = this.solid[idx];

          // Neighbor influence for both exploration (Path B) and smoothing (Path A).
          const neighbor = this.sampleNeighbors(x, y, z);

          // Path A: drift toward neighbor mix.
          const pathA = (neighbor.avg - plasma) * 0.5;

          // Path B: accentuate directional difference to keep exploration alive.
          const pathB = neighbor.delta * pathBWeight;

          // Audio-biased push nudges plasma toward the bias.
          const bias = inputField.values[idx] * this.swarm.flipProbability * 2;

          // Parity introduces asymmetry; flip occasionally to avoid stasis.
          const paritySign = p === 1 ? 1 : -1;
          const parityJitter = Math.random() < parityProbability ? -paritySign : paritySign;

          // Forgiveness damping prevents runaway energy; this is the roadmap hook.
          const localEnergy = Math.abs(plasma) + Math.abs(liquid) + Math.abs(solid);
          const forgivenessFactor = localEnergy > 1 ? 1 - forgiveness * 0.5 : 1;

          let newPlasma = plasma + pathA + pathB + bias;
          newPlasma += (Math.random() - 0.5) * flipProbability * parityJitter;
          newPlasma = clamp(newPlasma * forgivenessFactor, -1.2, 1.2);

          const newLiquid = (liquid + newPlasma) * 0.5 * forgivenessFactor;
          const newSolid = solid * (1 - alpha) + newLiquid * alpha;

          nextPlasma[idx] = newPlasma;
          nextLiquid[idx] = newLiquid;
          nextSolid[idx] = newSolid;
          this.parity[idx] = parityJitter === paritySign ? p : p ^ 1;
          totalEnergy += Math.abs(newPlasma) + Math.abs(newLiquid);
        }
      }
    }

    this.plasma = nextPlasma;
    this.liquid = nextLiquid;
    this.solid = nextSolid;
    this.energy = totalEnergy / this.length;
  }

  sampleNeighbors(x, y, z) {
    const idxXp = this.index(x + 1, y, z);
    const idxXm = this.index(x - 1, y, z);
    const idxYp = this.index(x, y + 1, z);
    const idxYm = this.index(x, y - 1, z);
    const idxZp = this.index(x, y, z + 1);
    const idxZm = this.index(x, y, z - 1);

    const plasma = this.plasma;
    const avg = (
      plasma[idxXp] +
      plasma[idxXm] +
      plasma[idxYp] +
      plasma[idxYm] +
      plasma[idxZp] +
      plasma[idxZm]
    ) / 6;

    const delta = (
      plasma[idxXp] -
      plasma[idxXm] +
      plasma[idxYp] -
      plasma[idxYm] +
      plasma[idxZp] -
      plasma[idxZm]
    ) / 6;

    return { avg, delta };
  }
}
