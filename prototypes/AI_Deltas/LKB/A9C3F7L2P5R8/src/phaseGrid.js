import { neighborsOf, clamp } from "./utils.js";
import { computeCoherence, entropyProxy } from "./metrics.js";

export class PhaseGrid {
  constructor(dims, { alpha, noise, forgiveness }) {
    this.dims = dims;
    this.alpha = alpha;
    this.baseNoise = noise;
    this.baseForgiveness = forgiveness;
    const size = dims.x * dims.y * dims.z;
    this.plasma = new Float32Array(size).fill(0.5);
    this.liquid = new Float32Array(size).fill(0.5);
    this.solid = new Float32Array(size).fill(0.5);
    this.parity = new Uint8Array(size);
    this.plasticNeighbors = new Map();
  }

  maybeRewire(rng, rate) {
    if (rng.nextFloat() > rate) return;
    const idx = Math.floor(rng.nextFloat() * this.liquid.length);
    const target = Math.floor(rng.nextFloat() * this.liquid.length);
    this.plasticNeighbors.set(idx, target);
  }

  step(params, biasField, couplingField, rng) {
    const { pathBWeight, forgivenessStrength, forgivenessThreshold, biasGain, couplingGain, noise } =
      params;
    const size = this.liquid.length;
    const nextLiquid = new Float32Array(size);
    const nextSolid = new Float32Array(size);
    const nextPlasma = new Float32Array(size);

    for (let idx = 0; idx < size; idx += 1) {
      const neighborIdxs = neighborsOf(idx, this.dims);
      let neighborSum = 0;
      for (const n of neighborIdxs) neighborSum += this.liquid[n];
      if (this.plasticNeighbors.has(idx)) {
        neighborSum += this.liquid[this.plasticNeighbors.get(idx)];
      }
      const neighborCount = neighborIdxs.length + (this.plasticNeighbors.has(idx) ? 1 : 0);
      const neighborAvg = neighborSum / Math.max(1, neighborCount);

      const dispersion = Math.abs(this.liquid[idx] - neighborAvg);
      const pathA = (this.liquid[idx] + neighborAvg) * 0.5;
      const pathB = (neighborAvg - this.liquid[idx]) * pathBWeight;
      const bias =
        ((biasField ? biasField[idx] : 0) + (couplingField ? couplingField[idx] : 0)) *
        biasGain *
        (1 + couplingGain * 0.5);
      const stochastic = (rng.nextFloat() - 0.5) * (this.baseNoise + noise);

      let candidate = clamp(pathA + pathB + bias + stochastic, 0, 1);
      if (dispersion > (forgivenessThreshold ?? this.baseForgiveness.threshold)) {
        const damp = forgivenessStrength ?? this.baseForgiveness.strength;
        candidate = clamp(
          candidate * (1 - damp) + neighborAvg * damp * 0.75 + this.solid[idx] * damp * 0.25,
          0,
          1
        );
      }

      nextLiquid[idx] = candidate;
      nextSolid[idx] = this.solid[idx] * (1 - this.alpha) + candidate * this.alpha;
      const plasmaNoise = (rng.nextFloat() - 0.5) * (this.baseNoise + noise * 0.5);
      nextPlasma[idx] = clamp(this.plasma[idx] + plasmaNoise, 0, 1);
      if (rng.nextFloat() < (this.baseNoise + noise) * 0.5) {
        this.parity[idx] = (this.parity[idx] + 1) % 2;
      }
    }

    this.liquid = nextLiquid;
    this.solid = nextSolid;
    this.plasma = nextPlasma;

    return {
      coherence: computeCoherence(this.liquid),
      entropy: entropyProxy(this.liquid)
    };
  }
}
