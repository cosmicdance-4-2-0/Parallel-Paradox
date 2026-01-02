import { clamp } from './utils.js';

export class InputField {
  constructor(size, settings) {
    this.size = size;
    this.length = size ** 3;
    this.values = new Float32Array(this.length);
    this.settings = settings;
  }

  decayAndDiffuse() {
    const { decay } = this.settings;
    const next = new Float32Array(this.length);
    // Gentle diffusion smooths spikes without erasing structure.
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        for (let z = 0; z < this.size; z++) {
          const idx = this.index(x, y, z);
          let accum = this.values[idx] * 0.5;
          accum += this.values[this.index(x + 1, y, z)] * 0.083;
          accum += this.values[this.index(x - 1, y, z)] * 0.083;
          accum += this.values[this.index(x, y + 1, z)] * 0.083;
          accum += this.values[this.index(x, y - 1, z)] * 0.083;
          accum += this.values[this.index(x, y, z + 1)] * 0.083;
          accum += this.values[this.index(x, y, z - 1)] * 0.083;
          next[idx] = accum * decay;
        }
      }
    }
    this.values = next;
  }

  injectEnergy(x, y, z, amount) {
    const radius = this.settings.radius;
    const radiusSq = radius * radius;
    for (let ix = -radius; ix <= radius; ix++) {
      for (let iy = -radius; iy <= radius; iy++) {
        for (let iz = -radius; iz <= radius; iz++) {
          const distSq = ix * ix + iy * iy + iz * iz;
          if (distSq > radiusSq) continue;
          const falloff = 1 - distSq / radiusSq;
          const idx = this.index(x + ix, y + iy, z + iz);
          this.values[idx] = clamp(this.values[idx] + amount * falloff, -2, 2);
        }
      }
    }
  }

  index(x, y, z) {
    const sx = (x + this.size) % this.size;
    const sy = (y + this.size) % this.size;
    const sz = (z + this.size) % this.size;
    return (sx * this.size + sy) * this.size + sz;
  }
}
