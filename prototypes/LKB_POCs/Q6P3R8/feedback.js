// Bias + feedback helpers — DeltaID: Q6P3R8
// Keeps history as influence-only, never as direct overwrite.

export class DelayLine {
  constructor(length, decay) {
    this.length = length;
    this.decay = decay;
    this.cursor = 0;
    this.buffer = new Array(length).fill(null);
  }

  push(field) {
    this.buffer[this.cursor] = field;
    this.cursor = (this.cursor + 1) % this.length;
  }

  pull() {
    // Blend from newest to oldest with decay; skip empty slots.
    let result = null;
    let weight = 1;
    for (let i = 0; i < this.length; i += 1) {
      const idx = (this.cursor - 1 - i + this.length) % this.length;
      const slice = this.buffer[idx];
      if (!slice) continue;
      if (!result) result = new Float32Array(slice.length);
      for (let j = 0; j < slice.length; j += 1) {
        result[j] += slice[j] * weight;
      }
      weight *= this.decay;
    }
    return result;
  }
}

export function blendBiasFields({ base, memory, crosstalk, memoryWeight, crosstalkWeight }) {
  if (!base && !memory && !crosstalk) return null;
  const length = (base || memory || crosstalk).length;
  const blended = new Float32Array(length);
  for (let i = 0; i < length; i += 1) {
    if (base) blended[i] += base[i];
    if (memory) blended[i] += memory[i] * memoryWeight;
    if (crosstalk) blended[i] += crosstalk[i] * crosstalkWeight;
  }
  return blended;
}

export function clampField(field, maxMagnitude) {
  if (!field) return null;
  const clamped = new Float32Array(field.length);
  for (let i = 0; i < field.length; i += 1) {
    const v = field[i];
    clamped[i] = Math.max(-maxMagnitude, Math.min(maxMagnitude, v));
  }
  return clamped;
}
