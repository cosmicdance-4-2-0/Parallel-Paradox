import { copyField } from "./utils.js";

export class DelayLine {
  constructor(length, decay) {
    this.length = length;
    this.decay = decay;
    this.buffer = [];
  }

  push(field) {
    const snapshot = copyField(field);
    this.buffer.unshift(snapshot);
    if (this.buffer.length > this.length) {
      this.buffer.pop();
    }
  }

  compose() {
    if (this.buffer.length === 0) return null;
    const length = this.buffer[0].length;
    const composite = new Float32Array(length);
    for (let i = 0; i < this.buffer.length; i += 1) {
      const decayFactor = Math.pow(this.decay, i);
      const frame = this.buffer[i];
      for (let j = 0; j < length; j += 1) {
        composite[j] += frame[j] * decayFactor;
      }
    }
    return composite;
  }
}
