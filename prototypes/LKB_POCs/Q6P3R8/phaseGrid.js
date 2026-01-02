// PhaseGrid core dynamics — DeltaID: Q6P3R8
// Implements a toroidal ternary-phase lattice with parity-aware branching and optional structural plasticity.

export class PhaseGrid {
  constructor(config, label = "core") {
    this.config = config;
    this.label = label;
    this.size = config.gridSize;
    this.count = this.size ** 3;
    this.plasma = new Float32Array(this.count).map(() => Math.random() * 0.5);
    this.liquid = new Float32Array(this.count).map(() => Math.random() * 0.5);
    this.solid = new Float32Array(this.count).map(() => Math.random() * 0.5);
    this.parity = new Int8Array(this.count);
    this.neighbors = this.#buildNeighborList();
    // TODO: Allow heterogeneous grid sizes per layer for richer multi-rate dynamics.
  }

  #index(x, y, z) {
    const { size } = this;
    const wrap = (v) => (v + size) % size;
    return wrap(x) * size * size + wrap(y) * size + wrap(z);
  }

  #buildNeighborList() {
    const neighbors = new Array(this.count);
    for (let x = 0; x < this.size; x += 1) {
      for (let y = 0; y < this.size; y += 1) {
        for (let z = 0; z < this.size; z += 1) {
          const i = this.#index(x, y, z);
          neighbors[i] = [
            this.#index(x + 1, y, z),
            this.#index(x - 1, y, z),
            this.#index(x, y + 1, z),
            this.#index(x, y - 1, z),
            this.#index(x, y, z + 1),
            this.#index(x, y, z - 1),
          ];
        }
      }
    }
    return neighbors;
  }

  perturb(noiseScale = 1) {
    const { flipProbability, parityProbability } = this.config;
    for (let i = 0; i < this.count; i += 1) {
      if (Math.random() < flipProbability * noiseScale) {
        this.plasma[i] = Math.random();
      }
      if (Math.random() < parityProbability * noiseScale) {
        this.parity[i] = this.parity[i] ? 0 : 1;
      }
    }
  }

  #neighborAverage(i) {
    const list = this.neighbors[i];
    let sum = 0;
    for (let k = 0; k < list.length; k += 1) {
      sum += this.plasma[list[k]];
    }
    return sum / list.length;
  }

  #harmonicForgiveness(mix, dispersion) {
    const { forgivenessThreshold, forgivenessDamping } = this.config;
    if (dispersion > forgivenessThreshold) {
      return mix * (1 - forgivenessDamping) + forgivenessDamping * 0.5;
    }
    return mix;
  }

  rewire(plasticity = this.config.plasticityProbability) {
    if (Math.random() > plasticity) return;
    const idx = Math.floor(Math.random() * this.count);
    const slot = Math.floor(Math.random() * this.neighbors[idx].length);
    const replacement = Math.floor(Math.random() * this.count);
    this.neighbors[idx][slot] = replacement;
    // TODO: Track rewiring history to study plasticity patterns over time.
  }

  step(biasField) {
    const {
      pathBProbability,
      alpha,
      biasWeight,
      maxBiasMagnitude,
    } = this.config;
    const newLiquid = new Float32Array(this.count);
    const newSolid = new Float32Array(this.count);

    let energySum = 0;
    let varianceSum = 0;

    for (let i = 0; i < this.count; i += 1) {
      const p = this.plasma[i];
      const l = this.liquid[i];
      const s = this.solid[i];
      const parity = this.parity[i] ? 0.13 : -0.07;
      const avg = (p + l + s) / 3;
      const neighborDelta = Math.abs(p - this.#neighborAverage(i)) + parity;
      let mix = Math.random() < pathBProbability ? neighborDelta : avg;

      if (biasField) {
        const bias = Math.max(
          -maxBiasMagnitude,
          Math.min(maxBiasMagnitude, biasField[i] || 0),
        );
        mix += bias * biasWeight;
      }

      const dispersion = Math.abs(mix - avg);
      mix = this.#harmonicForgiveness(mix, dispersion);
      mix = ((mix % 1) + 1) % 1; // Keep bounded in [0,1).

      newLiquid[i] = mix;
      newSolid[i] = (s * (1 - alpha) + mix * alpha) % 1;

      const energy = (p + mix + newSolid[i]) / 3;
      energySum += energy;
      varianceSum += Math.abs(mix - energy);
    }

    this.liquid = newLiquid;
    this.solid = newSolid;

    return {
      energy: energySum / this.count,
      dispersion: varianceSum / this.count,
    };
  }
}
