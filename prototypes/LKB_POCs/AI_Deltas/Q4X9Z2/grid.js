// PhaseCube lattice (DeltaID: Q4X9Z2)
// Implements plasma/liquid/solid phases with kenotic damping and bias-aware updates.

const TWO_PI = Math.PI * 2;

const wrap01 = (v) => {
  const wrapped = v % 1;
  return wrapped < 0 ? wrapped + 1 : wrapped;
};

class NeighborGraph {
  constructor(size) {
    this.size = size;
    this.count = size * size * size;
    this.edges = new Int32Array(this.count * 6);
    this._seed();
  }

  _seed() {
    const { size } = this;
    const idx = (x, y, z) => ((x * size + y) * size + z);
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        for (let z = 0; z < size; z++) {
          const base = idx(x, y, z) * 6;
          this.edges[base + 0] = idx((x + 1) % size, y, z);
          this.edges[base + 1] = idx((x + size - 1) % size, y, z);
          this.edges[base + 2] = idx(x, (y + 1) % size, z);
          this.edges[base + 3] = idx(x, (y + size - 1) % size, z);
          this.edges[base + 4] = idx(x, y, (z + 1) % size);
          this.edges[base + 5] = idx(x, y, (z + size - 1) % size);
        }
      }
    }
  }

  neighbors(index) {
    const start = index * 6;
    return this.edges.subarray(start, start + 6);
  }
}

export class PhaseGrid {
  constructor(size, config) {
    this.size = size;
    this.count = size * size * size;
    this.graph = new NeighborGraph(size);
    this.alpha = config.alpha;
    this.parityProbability = config.parityProbability;
    this.plasma = new Float32Array(this.count);
    this.liquid = new Float32Array(this.count);
    this.solid = new Float32Array(this.count);
    this.parity = new Int8Array(this.count);
    this._seed();
  }

  _seed() {
    for (let i = 0; i < this.count; i++) {
      this.plasma[i] = Math.random();
      this.liquid[i] = Math.random();
      this.solid[i] = Math.random();
      this.parity[i] = Math.random() > 0.5 ? 1 : 0;
    }
  }

  perturb(noise) {
    for (let i = 0; i < this.count; i++) {
      if (Math.random() < noise) {
        this.plasma[i] = wrap01(this.plasma[i] + (Math.random() - 0.5) * 0.25);
      }
      if (Math.random() < this.parityProbability) {
        this.parity[i] = this.parity[i] ? 0 : 1;
      }
    }
  }

  step(params) {
    const {
      biasField,
      biasGain,
      couplingBias = 0,
      pathBProbability,
      forgivenessGain,
      forgivenessThreshold
    } = params;

    const nextPlasma = new Float32Array(this.count);
    const nextLiquid = new Float32Array(this.count);
    const nextSolid = new Float32Array(this.count);

    for (let i = 0; i < this.count; i++) {
      const p = this.plasma[i];
      const l = this.liquid[i];
      const s = this.solid[i];

      const neighbors = this.graph.neighbors(i);
      let neighborMean = 0;
      for (let n = 0; n < neighbors.length; n++) neighborMean += this.plasma[neighbors[n]];
      neighborMean /= neighbors.length;

      const dispersion = Math.abs(p - neighborMean);
      const base = (p + l + s) / 3 + couplingBias;
      const pathB = neighborMean + couplingBias + this.parity[i] * 0.08;
      const candidate = Math.random() < pathBProbability ? pathB : base;
      const biasTerm = biasField ? biasField[i] * biasGain : 0;

      const damp = dispersion > forgivenessThreshold
        ? Math.max(0.1, 1 - forgivenessGain * (dispersion - forgivenessThreshold))
        : 1;

      const nextP = wrap01((candidate + biasTerm) * damp);
      nextPlasma[i] = nextP;
      nextLiquid[i] = wrap01((l + nextP) * 0.5 + biasTerm * 0.1);
      nextSolid[i] = wrap01(s * (1 - this.alpha) + nextP * this.alpha);
    }

    this.plasma = nextPlasma;
    this.liquid = nextLiquid;
    this.solid = nextSolid;
  }

  metrics() {
    let energy = 0;
    let coherence = 0;
    for (let i = 0; i < this.count; i++) {
      energy += this.plasma[i];
      const neighbors = this.graph.neighbors(i);
      let local = 0;
      for (let n = 0; n < neighbors.length; n++) local += this.plasma[neighbors[n]];
      coherence += 1 - Math.abs(this.plasma[i] - local / neighbors.length);
    }
    return {
      energy: energy / this.count,
      coherence: coherence / this.count
    };
  }
}
