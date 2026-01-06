export class DelayLine {
  constructor(length, decay) {
    this.length = length;
    this.decay = decay;
    this.buffer = [];
  }

  push(snapshot) {
    this.buffer.unshift(new Float32Array(snapshot));
    if (this.buffer.length > this.length) {
      this.buffer.pop();
    }
  }

  mix() {
    if (this.buffer.length === 0) return null;
    const result = new Float32Array(this.buffer[0].length);
    let weightSum = 0;
    for (let i = 0; i < this.buffer.length; i += 1) {
      const weight = Math.pow(this.decay, i);
      weightSum += weight;
      const frame = this.buffer[i];
      for (let j = 0; j < frame.length; j += 1) {
        result[j] += frame[j] * weight;
      }
    }
    const norm = weightSum === 0 ? 1 : weightSum;
    for (let k = 0; k < result.length; k += 1) {
      result[k] /= norm;
    }
    return result;
  }
}
