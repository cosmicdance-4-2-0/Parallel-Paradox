// InputField ingests external signal energy and diffuses it into the lattice.
export class InputField {
  constructor(config) {
    this.config = config;
    this.size = config.GRID;
    this.n = this.size ** 3;
    this.bias = new Float32Array(this.n);
    // TODO: Expose bias snapshots for reason: allow external memory/logging replay.
  }

  clearDecay() {
    const { INPUT_DECAY } = this.config;
    for (let i = 0; i < this.n; i++) this.bias[i] *= INPUT_DECAY;
  }

  ingest(left, right) {
    // left/right are normalized [0,1] arrays of BIN_COUNT length.
    const { INPUT_RADIUS, INPUT_STRENGTH } = this.config;
    this.clearDecay();
    for (let b = 0; b < Math.min(left.length, right.length); b++) {
      const aL = left[b] || 0;
      const aR = right[b] || 0;
      const energy = (aL + aR) * 0.5;
      const pan = (aR - aL) * (this.size * 0.18);
      const z = Math.floor((b / (left.length - 1 || 1)) * (this.size - 1));
      let x = Math.floor(this.size / 2 + pan + energy * (this.size - 1) * 0.3);
      x = clamp(x, 0, this.size - 1);
      const y = Math.floor(this.size / 2);

      // Radial kernel
      const r = INPUT_RADIUS;
      for (let dz = -r; dz <= r; dz++) {
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            const d2 = (dx * dx + dy * dy + dz * dz) / (r * r || 1);
            if (d2 > 1) continue;
            const kernel = Math.exp(-d2 * 2.4);
            const idx = (x + dx) + (y + dy) * this.size + (z + dz) * this.size * this.size;
            if (idx >= 0 && idx < this.n) this.bias[idx] += energy * INPUT_STRENGTH * kernel;
          }
        }
      }
    }
    for (let i = 0; i < this.n; i++) this.bias[i] = clamp(this.bias[i], -0.25, 0.25);
  }
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
