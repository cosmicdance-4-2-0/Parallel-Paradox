import { gridVolume } from "./config.js";

export class DelayLine {
  constructor(length, decay, gridSize) {
    this.length = Math.max(1, length);
    this.decay = decay;
    this.capacity = gridVolume(gridSize);
    this.buffer = [];
  }

  push(field) {
    if (!field) return;
    const snapshot = new Float32Array(this.capacity);
    const len = Math.min(this.capacity, field.length);
    for (let i = 0; i < len; i += 1) snapshot[i] = field[i];
    this.buffer.unshift(snapshot);
    if (this.buffer.length > this.length) this.buffer.pop();
  }

  mix() {
    const out = new Float32Array(this.capacity);
    for (let i = 0; i < this.buffer.length; i += 1) {
      const weight = Math.pow(this.decay, i);
      const snapshot = this.buffer[i];
      for (let j = 0; j < out.length; j += 1) {
        out[j] += snapshot[j] * weight;
      }
    }
    return out;
  }
}
