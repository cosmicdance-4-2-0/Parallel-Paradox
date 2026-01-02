import { idx3d, clamp01, wrapIndex } from "./utils.js";

export class PhaseGrid {
  constructor(size, defaults) {
    this.size = size;
    this.defaults = defaults;
    this.plasma = new Float32Array(size.x * size.y * size.z);
    this.liquid = new Float32Array(size.x * size.y * size.z);
    this.solid = new Float32Array(size.x * size.y * size.z);
    this.parity = new Uint8Array(size.x * size.y * size.z);
    this.seed();
  }

  seed() {
    for (let i = 0; i < this.plasma.length; i += 1) {
      this.plasma[i] = Math.random();
      this.liquid[i] = Math.random();
      this.solid[i] = Math.random() * 0.2;
      this.parity[i] = Math.random() > 0.5 ? 1 : 0;
    }
  }

  step(biasField, dynamics, couplingInput = null, memoryBias = 0) {
    const {
      pathBWeight,
      forgiveness,
      damping,
      flipProb,
      parityProb,
      solidBlend,
      biasBoost,
    } = dynamics;

    const { x: maxX, y: maxY, z: maxZ } = this.size;
    const nextLiquid = new Float32Array(this.liquid.length);
    const nextSolid = new Float32Array(this.solid.length);
    const nextPlasma = new Float32Array(this.plasma.length);
    const nextParity = new Uint8Array(this.parity.length);

    for (let z = 0; z < maxZ; z += 1) {
      for (let y = 0; y < maxY; y += 1) {
        for (let x = 0; x < maxX; x += 1) {
          const idx = idx3d(x, y, z, this.size);

          // Neighbor sampling (6-neighborhood on a torus)
          const neighbors = [
            this.liquid[idx3d(wrapIndex(x + 1, maxX), y, z, this.size)],
            this.liquid[idx3d(wrapIndex(x - 1, maxX), y, z, this.size)],
            this.liquid[idx3d(x, wrapIndex(y + 1, maxY), z, this.size)],
            this.liquid[idx3d(x, wrapIndex(y - 1, maxY), z, this.size)],
            this.liquid[idx3d(x, y, wrapIndex(z + 1, maxZ), this.size)],
            this.liquid[idx3d(x, y, wrapIndex(z - 1, maxZ), this.size)],
          ];

          const neighborMean = neighbors.reduce((acc, v) => acc + v, 0) / neighbors.length;

          // Path A: gentle blending toward neighbors
          const pathA = this.liquid[idx] * 0.6 + neighborMean * 0.4;

          // Path B: difference amplification + coupling energy
          const couplingEnergy = couplingInput ? couplingInput[idx] * 0.25 : 0;
          const divergence = neighborMean - this.liquid[idx];
          const pathB = this.liquid[idx] + divergence * (1.0 + pathBWeight) + couplingEnergy;

          // Blend paths according to lens-derived weight
          let liquidNext = pathA * (1 - pathBWeight) + pathB * pathBWeight;

          // Inject bias and plasma drift
          const bias = biasField ? biasField.get(x, y, z) * biasBoost : 0;
          const plasmaDrift = this.plasma[idx] * 0.05;
          liquidNext += bias + plasmaDrift + memoryBias;

          // Harmonic forgiveness: suppress runaway agitation beyond threshold
          const agitation = Math.abs(liquidNext - neighborMean);
          if (agitation > forgiveness) {
            const excess = agitation - forgiveness;
            liquidNext -= excess * 0.5;
          }

          // Damping keeps the system bounded
          liquidNext *= 1 - damping;
          liquidNext = clamp01(liquidNext);

          // Solid state softly accumulates liquid history
          const solidNext = clamp01(this.solid[idx] * (1 - solidBlend) + liquidNext * solidBlend);

          // Plasma occasionally re-rolls to keep dreaming alive
          const plasmaNext = Math.random() < flipProb ? Math.random() : clamp01(this.plasma[idx] * 0.97 + Math.random() * 0.03);

          // Parity flips bias certain pixels toward cooler hues
          const parityNext = Math.random() < parityProb + bias * 0.2 ? 1 - this.parity[idx] : this.parity[idx];

          nextLiquid[idx] = liquidNext;
          nextSolid[idx] = solidNext;
          nextPlasma[idx] = plasmaNext;
          nextParity[idx] = parityNext;
        }
      }
    }

    this.liquid = nextLiquid;
    this.solid = nextSolid;
    this.plasma = nextPlasma;
    this.parity = nextParity;

    return {
      liquidMean: this.liquid.reduce((acc, v) => acc + v, 0) / this.liquid.length,
    };
  }

  getLiquid() {
    return this.liquid;
  }

  getSolidAverage() {
    return this.solid.reduce((acc, v) => acc + v, 0) / this.solid.length;
  }
}

// TODO: allow asymmetric coupling kernels and delayed feedback to explore phase-shifted echo behavior.
