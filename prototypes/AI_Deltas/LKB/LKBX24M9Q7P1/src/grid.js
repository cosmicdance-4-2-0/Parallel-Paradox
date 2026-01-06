import { clamp, idx, randomSigned, variance, wrapIndex } from "./utils.js";

export class PhaseGrid {
  constructor(size, config) {
    this.size = size;
    this.config = config;
    const total = size * size * size;
    this.plasma = new Float32Array(total).fill(0).map(() => randomSigned(0.25));
    this.liquid = new Float32Array(total).fill(0).map(() => randomSigned(0.25));
    this.solid = new Float32Array(total);
    this.trace = new Float32Array(total);
    this.parity = new Uint8Array(total);
    this.rewireCount = 0;
    this.neighborOffsets = [
      [1, 0, 0],
      [-1, 0, 0],
      [0, 1, 0],
      [0, -1, 0],
      [0, 0, 1],
      [0, 0, -1],
    ];
    // TODO: Add GPU-friendly neighbor cache to scale beyond CPU-friendly lattice sizes.
  }

  maybeRewireNeighbors() {
    if (Math.random() > this.config.plasticityProbability) return;
    const axis = Math.floor(Math.random() * 3);
    const delta = Math.random() > 0.5 ? 1 : -1;
    const newOffset = [0, 0, 0];
    newOffset[axis] = delta;
    const slot = Math.floor(Math.random() * this.neighborOffsets.length);
    this.neighborOffsets[slot] = newOffset;
    this.rewireCount += 1;
  }

  neighborAverage(x, y, z) {
    let sum = 0;
    let count = 0;
    for (const [dx, dy, dz] of this.neighborOffsets) {
      const nx = wrapIndex(x + dx, this.size);
      const ny = wrapIndex(y + dy, this.size);
      const nz = wrapIndex(z + dz, this.size);
      sum += this.liquid[idx(nx, ny, nz, this.size)];
      count += 1;
    }
    return sum / count;
  }

  step(biasField, controls = {}) {
    this.maybeRewireNeighbors();
    const { plasmaNoise, liquidCoupling, biasGain, pathBlend, forgivenessThreshold, forgivenessDamping, traceBlend, solidBlend } =
      this.config;
    const nextPlasma = new Float32Array(this.plasma.length);
    const nextLiquid = new Float32Array(this.liquid.length);
    const size = this.size;
    let energyAcc = 0;
    let coherenceSamples = [];

    for (let z = 0; z < size; z += 1) {
      for (let y = 0; y < size; y += 1) {
        for (let x = 0; x < size; x += 1) {
          const pos = idx(x, y, z, size);
          const neighborAvg = this.neighborAverage(x, y, z);
          const plasmaNoiseTerm = randomSigned(plasmaNoise);
          let liquidValue =
            this.liquid[pos] +
            (neighborAvg - this.liquid[pos]) * liquidCoupling +
            plasmaNoiseTerm;

          liquidValue += biasField[pos] * biasGain * (controls.biasGain ?? 1);

          const pathBlendControl = clamp(
            pathBlend + (controls.pathBlend ?? 0),
            0,
            1
          );
          const divergence = liquidValue - this.solid[pos];
          liquidValue = liquidValue * (1 - pathBlendControl) + (liquidValue + divergence) * pathBlendControl;

          const localVariance = Math.abs(neighborAvg - liquidValue);
          if (localVariance > forgivenessThreshold) {
            const forgiveness =
              forgivenessDamping +
              clamp(controls.forgivenessBoost ?? 0, 0, 1) * 0.5;
            liquidValue *= 1 - clamp(forgiveness, 0, 0.95);
          }

          const traceNext =
            this.trace[pos] * (1 - traceBlend) + liquidValue * traceBlend;
          const solidNext =
            this.solid[pos] * (1 - solidBlend) + traceNext * solidBlend;

          nextPlasma[pos] =
            this.plasma[pos] * 0.9 + plasmaNoiseTerm * 0.5 + divergence * 0.1;
          nextLiquid[pos] = clamp(liquidValue, -1.5, 1.5);
          this.trace[pos] = traceNext;
          this.solid[pos] = solidNext;

          if (Math.abs(nextPlasma[pos]) > 0.8) {
            this.parity[pos] = this.parity[pos] ? 0 : 1;
          }

          energyAcc += Math.abs(nextLiquid[pos]);
          coherenceSamples.push(neighborAvg - nextLiquid[pos]);
        }
      }
    }

    this.plasma = nextPlasma;
    this.liquid = nextLiquid;

    const energy = energyAcc / this.liquid.length;
    const coherenceVar = variance(coherenceSamples, 0);
    const coherence = 1 - clamp(coherenceVar, 0, 1);
    const divergenceMetric = variance(this.trace, averageTrace(this.trace));

    return {
      energy,
      coherence,
      divergence: clamp(divergenceMetric, 0, 1),
    };
  }
}

function averageTrace(trace) {
  let acc = 0;
  for (let i = 0; i < trace.length; i += 1) {
    acc += trace[i];
  }
  return trace.length ? acc / trace.length : 0;
}
