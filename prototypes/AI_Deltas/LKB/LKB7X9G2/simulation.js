import { clamp, mix, neighbors6, idx3D } from "./utils.js";

export class PhaseGrid {
  constructor(size, config, lensController) {
    this.size = size;
    this.count = size * size * size;
    this.lens = lensController;
    this.config = config;
    this.plasma = new Float32Array(this.count);
    this.liquid = new Float32Array(this.count);
    this.solid = new Float32Array(this.count);
    this.parity = new Uint8Array(this.count);
    this.seed();
  }

  seed() {
    for (let i = 0; i < this.count; i++) {
      this.plasma[i] = Math.random();
      this.liquid[i] = Math.random() * 0.6;
      this.solid[i] = Math.random() * 0.4;
      this.parity[i] = Math.random() > 0.5 ? 1 : 0;
    }
  }

  step(inputField, biasPulse) {
    const nextLiquid = new Float32Array(this.count);
    const nextPlasma = new Float32Array(this.count);
    const nextSolid = new Float32Array(this.count);
    const nextParity = new Uint8Array(this.count);

    const { PLASMA, PATHS, SOLID } = this.config;
    const s = this.size;

    for (let z = 0; z < s; z++) {
      for (let y = 0; y < s; y++) {
        for (let x = 0; x < s; x++) {
          const i = idx3D(x, y, z, s);
          const bias = inputField.sample(x, y, z) + biasPulse.parityBias;

          // plasma noise keeps things lively; bias amplifies when present
          const plasma = clamp(
            this.plasma[i] * PLASMA.decay + Math.random() * PLASMA.noise + Math.abs(bias) * PLASMA.biasGain,
            0,
            1
          );
          const parityFlip = plasma > PLASMA.flipThreshold || Math.random() < PATHS.randomFlip;
          const parity = parityFlip ? 1 - this.parity[i] : this.parity[i];

          // neighbor influence
          let neighborSum = 0;
          for (const [nx, ny, nz] of neighbors6(x, y, z)) {
            neighborSum += this.liquid[idx3D(nx, ny, nz, s)];
          }
          const neighborAvg = neighborSum / 6;

          const delta = neighborAvg - this.liquid[i];
          const pathA = clamp(this.liquid[i] + delta * (PATHS.baseA + bias * PATHS.biasWeight), 0, 1);
          const pathB = clamp(
            this.liquid[i] + (delta + bias * 0.5) * (PATHS.baseB + plasma * 0.4),
            0,
            1
          );

          const [wA, wB] = this.lens.blendWeights(plasma, parity, bias);
          const chosen = pathA * wA + pathB * wB;

          nextPlasma[i] = plasma;
          nextLiquid[i] = chosen;
          nextSolid[i] = clamp(mix(this.solid[i] * SOLID.damping, chosen, SOLID.blend), 0, 1);
          nextParity[i] = parity;
        }
      }
    }

    this.plasma = nextPlasma;
    this.liquid = nextLiquid;
    this.solid = nextSolid;
    this.parity = nextParity;
  }

  probe(midPlane) {
    const s = this.size;
    const plane = new Array(s * s);
    const z = midPlane ?? Math.floor(s / 2);
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        const i = idx3D(x, y, z, s);
        plane[x + y * s] = {
          liquid: this.liquid[i],
          solid: this.solid[i],
          parity: this.parity[i],
          plasma: this.plasma[i],
        };
      }
    }
    return plane;
  }
}
