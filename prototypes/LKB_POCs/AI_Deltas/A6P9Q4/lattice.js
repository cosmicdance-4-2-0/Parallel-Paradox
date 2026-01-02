// PhaseCube Delta lattice primitives (DeltaID: A6P9Q4)
// Defines the neighbor graph, structural plasticity, delay line, and phase grid logic.

export function wrap01(value) {
  const v = value % 1;
  return v < 0 ? v + 1 : v;
}

export class DelayLine {
  constructor(length, decay, gain) {
    this.buffer = new Float32Array(Math.max(1, length));
    this.decay = decay;
    this.gain = gain;
    this.index = 0;
  }

  push(value) {
    this.buffer[this.index] = value;
    this.index = (this.index + 1) % this.buffer.length;

    let influence = 0;
    let weight = 1;
    for (let i = 0; i < this.buffer.length; i++) {
      const idx = (this.index + i) % this.buffer.length;
      influence += this.buffer[idx] * weight;
      weight *= this.decay;
    }
    return (influence / this.buffer.length) * this.gain;
  }
}

export class NeighborGraph {
  constructor(size) {
    this.size = size;
    this.count = size * size * size;
    this.edges = new Int32Array(this.count * 6);
    this._seedCardinal();
  }

  _seedCardinal() {
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

  neighborIndices(cellIndex) {
    const start = cellIndex * 6;
    return this.edges.subarray(start, start + 6);
  }

  rewireRandomEdge() {
    // Structural plasticity: occasionally reshuffle a neighbor to keep the lattice adaptive.
    const cell = Math.floor(Math.random() * this.count);
    const edgeSlot = Math.floor(Math.random() * 6);
    const target = Math.floor(Math.random() * this.count);
    this.edges[cell * 6 + edgeSlot] = target;
  }
}

export class PlasticityManager {
  constructor(config, graph) {
    this.config = config;
    this.graph = graph;
    this.frame = 0;
  }

  tick() {
    this.frame += 1;
    if (this.frame % this.config.window !== 0) return;
    if (Math.random() < this.config.rewireProbability) {
      this.graph.rewireRandomEdge();
    }
  }
}

export class PhaseGrid {
  constructor(name, size, config, graph) {
    this.name = name;
    this.size = size;
    this.count = size * size * size;
    this.graph = graph;
    this.config = config;
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

  perturb(noise, parityProbability) {
    for (let i = 0; i < this.count; i++) {
      if (Math.random() < noise) {
        this.plasma[i] = wrap01(this.plasma[i] + (Math.random() - 0.5) * 0.25);
      }
      if (Math.random() < parityProbability) {
        this.parity[i] = this.parity[i] ? 0 : 1;
      }
    }
  }

  step(globalBias, modulation) {
    const { alpha, pathBProbability } = this.config;
    const newLiquid = new Float32Array(this.count);
    const newSolid = new Float32Array(this.count);

    for (let i = 0; i < this.count; i++) {
      const p = this.plasma[i];
      const l = this.liquid[i];
      const s = this.solid[i];

      const neighbors = this.graph.neighborIndices(i);
      let neighborMean = 0;
      for (let n = 0; n < neighbors.length; n++) neighborMean += this.plasma[neighbors[n]];
      neighborMean /= neighbors.length;

      const avg = (p + l + s) / 3;
      const curiosity = Math.abs(p - neighborMean) + modulation.crossBias;
      const mixShifted = Math.random() < pathBProbability + modulation.mixShift ? curiosity : avg;
      const blended = wrap01(mixShifted + globalBias + modulation.biasOffset + this.parity[i] * 0.05);

      newLiquid[i] = blended;
      const memoryGain = modulation.memoryBlend;
      newSolid[i] = wrap01(s * (1 - alpha * memoryGain) + mixShifted * alpha * memoryGain);
    }

    this.liquid = newLiquid;
    this.solid = newSolid;
  }

  metrics() {
    let energy = 0;
    let coherence = 0;
    for (let i = 0; i < this.count; i++) {
      energy += this.plasma[i];
      const neighbors = this.graph.neighborIndices(i);
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
