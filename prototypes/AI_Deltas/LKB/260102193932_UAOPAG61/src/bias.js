import { clamp, gridVolume } from "./config.js";

export class BiasField {
  constructor(size, params) {
    this.size = size;
    this.decay = params.decay;
    this.strength = params.strength;
    this.radius = Math.max(1, Math.round(params.radius));
    this.maxMagnitude = params.maxMagnitude;
    this.values = new Float32Array(gridVolume(size));
  }

  decayField() {
    for (let i = 0; i < this.values.length; i += 1) {
      this.values[i] *= this.decay;
    }
  }

  ingestPulse(pulse) {
    if (!pulse) return;
    const { pan = 0, depth = 0.5, amplitude = 0.5 } = pulse;
    const size = this.size;
    const centerY = Math.floor(size / 2);
    const clampedDepth = clamp(depth, 0, 1);
    const clampedPan = clamp(pan, -1, 1);
    const x = clamp(Math.floor(size / 2 + clampedPan * size * 0.16), 0, size - 1);
    const z = clamp(Math.floor(clampedDepth * (size - 1)), 0, size - 1);
    const energy = clamp(amplitude * this.strength, 0, 1);
    const r = this.radius;

    for (let dz = -r; dz <= r; dz += 1) {
      for (let dy = -r; dy <= r; dy += 1) {
        for (let dx = -r; dx <= r; dx += 1) {
          const d2 = (dx * dx + dy * dy + dz * dz) / (r * r);
          if (d2 > 1) continue;
          const kernel = Math.exp(-d2 * 2.4);
          const nx = (x + dx + size) % size;
          const ny = (centerY + dy + size) % size;
          const nz = (z + dz + size) % size;
          const idx = nx + ny * size + nz * size * size;
          this.values[idx] += energy * kernel;
        }
      }
    }
    this.#clampValues();
  }

  #clampValues() {
    for (let i = 0; i < this.values.length; i += 1) {
      this.values[i] = clamp(this.values[i], -this.maxMagnitude, this.maxMagnitude);
    }
  }

  valueAtIndex(i) {
    return this.values[i] ?? 0;
  }

  average() {
    let total = 0;
    for (let i = 0; i < this.values.length; i += 1) {
      total += this.values[i];
    }
    return total / this.values.length;
  }
}

export function blendBiasFields({ base, memory, crosstalk, memoryWeight, crosstalkWeight, maxMagnitude }) {
  const length = base?.length || memory?.length || crosstalk?.length || 0;
  const out = new Float32Array(length);
  for (let i = 0; i < length; i += 1) {
    const blended =
      (base ? base[i] : 0) +
      (memory ? memory[i] * memoryWeight : 0) +
      (crosstalk ? crosstalk[i] * crosstalkWeight : 0);
    out[i] = clamp(blended, -maxMagnitude, maxMagnitude);
  }
  return out;
}
