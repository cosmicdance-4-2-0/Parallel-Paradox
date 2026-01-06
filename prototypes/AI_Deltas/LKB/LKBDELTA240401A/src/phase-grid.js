import { averageNeighbors, clamp, idx3D, neighborhoodVariance } from "./utils.js";
import { harmonicLensAdjustments } from "./lens-hooks.js";

export class PhaseGrid {
  constructor(config) {
    this.config = config;
    this.size = config.gridSize;
    this.count = this.size ** 3;
    this.plasma = new Float32Array(this.count);
    this.liquid = new Float32Array(this.count);
    this.solid = new Float32Array(this.count);
    this.parity = new Uint8Array(this.count);
    this.forgivenessEvents = 0;
    this.seed();
  }

  seed() {
    for (let i = 0; i < this.count; i++) {
      this.plasma[i] = Math.random() * 0.5;
      this.liquid[i] = Math.random() * 0.5;
      this.solid[i] = Math.random() * 0.5;
      this.parity[i] = 0;
    }
  }

  perturb() {
    const { flipProbability, parityProbability } = this.config;
    for (let i = 0; i < this.count; i++) {
      if (Math.random() < flipProbability) {
        this.plasma[i] = 1 - this.plasma[i];
      }
      if (Math.random() < parityProbability) {
        this.parity[i] ^= 1;
      }
    }
  }

  step(biasField) {
    const nextLiquid = new Float32Array(this.count);
    const nextSolid = new Float32Array(this.count);
    const { solidBlend, pathBlend, forgivenessThreshold, forgivenessDamping, parityKick, biasGain } =
      this.config;

    for (let i = 0; i < this.count; i++) {
      const p = this.plasma[i];
      const l = this.liquid[i];
      const s = this.solid[i];

      const neighborAvg = averageNeighbors(this.plasma, i, this.size);
      const base = (p + l + s) / 3;
      const diff = Math.abs(p - neighborAvg) + this.parity[i] * parityKick;

      const localVariance = neighborhoodVariance(this.plasma, i, this.size);
      const biasEnergy = biasField ? biasField.field[i] : 0;
      const lensAdjust = harmonicLensAdjustments({ localVariance, biasEnergy }, this.config);
      // TODO: Integrate multi-grid cross-talk term here once secondary lattices are added.

      const blendedPath = clamp(pathBlend + lensAdjust.pathBlendShift, 0, 1);
      const forgivenessScale = clamp(
        forgivenessThreshold + lensAdjust.forgivenessBoost,
        forgivenessThreshold,
        1
      );

      let mix = base * (1 - blendedPath) + diff * blendedPath + biasEnergy * biasGain;

      if (localVariance > forgivenessScale) {
        mix *= forgivenessDamping;
        this.forgivenessEvents += 1;
      }

      nextLiquid[i] = clamp(mix, 0, 1);
      nextSolid[i] = clamp(s * (1 - solidBlend) + nextLiquid[i] * solidBlend, 0, 1);
    }

    this.liquid = nextLiquid;
    this.solid = nextSolid;
    this.time = (this.time || 0) + 1;
  }

  toPointCloud() {
    const half = (this.size - 1) / 2;
    const points = [];
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        for (let z = 0; z < this.size; z++) {
          const idx = idx3D(x, y, z, this.size);
          points.push({
            x: (x - half) * this.config.scale,
            y: (y - half) * this.config.scale,
            z: (z - half) * this.config.scale,
            plasma: this.plasma[idx],
            liquid: this.liquid[idx],
            solid: this.solid[idx],
            parity: this.parity[idx]
          });
        }
      }
    }
    return points;
  }
}
