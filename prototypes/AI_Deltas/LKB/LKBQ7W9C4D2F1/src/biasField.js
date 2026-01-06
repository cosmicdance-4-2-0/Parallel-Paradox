export class BiasField {
  constructor(size, { decay, diffusionRate }) {
    this.size = size;
    this.decay = decay;
    this.diffusionRate = diffusionRate;
    this.field = new Float32Array(size ** 3).fill(0);
  }

  index(x, y, z) {
    const n = this.size;
    const wrap = (v) => (v + n) % n;
    const idx = wrap(x) * n * n + wrap(y) * n + wrap(z);
    return idx;
  }

  addPulse({ x, y, z }, magnitude) {
    const idx = this.index(x, y, z);
    this.field[idx] += magnitude;
  }

  sample(idx) {
    return this.field[idx] || 0;
  }

  decayAndDiffuse() {
    const n = this.size;
    const next = new Float32Array(this.field.length);
    const get = (x, y, z) => this.field[this.index(x, y, z)];

    for (let x = 0; x < n; x += 1) {
      for (let y = 0; y < n; y += 1) {
        for (let z = 0; z < n; z += 1) {
          const center = get(x, y, z) * this.decay;
          const neighborAvg = (
            get(x + 1, y, z) +
            get(x - 1, y, z) +
            get(x, y + 1, z) +
            get(x, y - 1, z) +
            get(x, y, z + 1) +
            get(x, y, z - 1)
          ) / 6;

          const diffused = center * (1 - this.diffusionRate) + neighborAvg * this.diffusionRate;
          next[this.index(x, y, z)] = diffused;
        }
      }
    }

    this.field = next;
  }

  energy() {
    let total = 0;
    for (let i = 0; i < this.field.length; i += 1) {
      total += this.field[i];
    }
    return total / this.field.length;
  }
}
