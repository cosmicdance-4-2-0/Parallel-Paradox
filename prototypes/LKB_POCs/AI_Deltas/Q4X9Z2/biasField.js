// Diffusive bias field (DeltaID: Q4X9Z2)
// Carries external influence into the lattice without turning into hard control.

const buildNeighbors = (size) => {
  const idx = (x, y, z) => ((x * size + y) * size + z);
  const neighbors = Array(size * size * size);
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      for (let z = 0; z < size; z++) {
        neighbors[idx(x, y, z)] = [
          idx((x + 1) % size, y, z),
          idx((x + size - 1) % size, y, z),
          idx(x, (y + 1) % size, z),
          idx(x, (y + size - 1) % size, z),
          idx(x, y, (z + 1) % size),
          idx(x, y, (z + size - 1) % size)
        ];
      }
    }
  }
  return neighbors;
};

const clamp01 = (v) => Math.max(0, Math.min(1, v));

export class BiasField {
  constructor(size, decay, diffusion) {
    this.size = size;
    this.count = size * size * size;
    this.decay = decay;
    this.diffusion = diffusion;
    this.field = new Float32Array(this.count);
    this.neighbors = buildNeighbors(size);
    this.scratch = new Float32Array(this.count);
  }

  _indexFromFocus(focus) {
    const fx = clamp01(focus?.x ?? 0.5);
    const fy = clamp01(focus?.y ?? 0.5);
    const fz = clamp01(focus?.z ?? 0.5);
    const x = Math.floor(fx * this.size) % this.size;
    const y = Math.floor(fy * this.size) % this.size;
    const z = Math.floor(fz * this.size) % this.size;
    return (x * this.size + y) * this.size + z;
  }

  update(strength = 0, focus = { x: 0.5, y: 0.5, z: 0.5 }) {
    // Step 1: decay + diffusion into scratch.
    for (let i = 0; i < this.count; i++) {
      const current = this.field[i] * this.decay;
      const nb = this.neighbors[i];
      let neighborMean = 0;
      for (let n = 0; n < nb.length; n++) neighborMean += this.field[nb[n]];
      neighborMean /= nb.length;
      this.scratch[i] = current + this.diffusion * (neighborMean - current);
    }

    // Step 2: inject new bias around focus.
    if (strength !== 0) {
      const center = this._indexFromFocus(focus);
      const nb = this.neighbors[center];
      this.scratch[center] += strength;
      for (let i = 0; i < nb.length; i++) {
        this.scratch[nb[i]] += strength * 0.5;
      }
    }

    // Swap buffers.
    const tmp = this.field;
    this.field = this.scratch;
    this.scratch = tmp;
  }
}
