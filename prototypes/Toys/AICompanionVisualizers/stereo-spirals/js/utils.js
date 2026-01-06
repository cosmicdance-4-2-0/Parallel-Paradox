/*
File: js/utils.js
Purpose: Math aliases + clamp/lerp helpers + RingBuffer class (wrap-aware stats).
*/

/* ----------------------------
 * Math aliases (tiny + fast)
 * ---------------------------- */
export const S = Math.sin;
export const C = Math.cos;
export const PI = Math.PI;

/**
 * Clamp a value to [lo, hi].
 * @param {number} v
 * @param {number} lo
 * @param {number} hi
 */
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/**
 * Linear interpolation.
 * @param {number} a
 * @param {number} b
 * @param {number} t - usually [0,1]
 */
export const lerp = (a, b, t) => a + (b - a) * t;

/**
 * Ring buffer for bounded history (onset flux, beat intervals).
 *
 * IMPORTANT:
 * - mean()/std() iterate in logical order (wrap-aware), not raw array order.
 *   Otherwise, thresholds drift after wrap.
 */
export class RingBuffer {
  /**
   * @param {number} capacity - maximum number of elements stored
   */
  constructor(capacity) {
    this.capacity = capacity;
    this.data = new Array(capacity);

    // Current number of valid elements (<= capacity)
    this.size = 0;

    // Next write index (wraps around)
    this.write = 0;
  }

  /**
   * Push a new value into the buffer.
   * Overwrites the oldest element once full.
   * @param {number} v
   */
  push(v) {
    this.data[this.write] = v;
    this.write = (this.write + 1) % this.capacity;
    this.size = Math.min(this.size + 1, this.capacity);
  }

  /**
   * Return an array in chronological order (oldest -> newest).
   * NOTE: Allocates; use sparingly in hot loops.
   */
  toArray() {
    const out = [];
    for (let i = 0; i < this.size; i++) {
      const idx = (this.write - this.size + i + this.capacity) % this.capacity;
      out.push(this.data[idx]);
    }
    return out;
  }

  /**
   * Mean of current elements.
   */
  mean() {
    if (!this.size) return 0;
    let sum = 0;
    for (let i = 0; i < this.size; i++) {
      const idx = (this.write - this.size + i + this.capacity) % this.capacity;
      sum += this.data[idx] ?? 0;
    }
    return sum / this.size;
  }

  /**
   * Sample standard deviation of current elements.
   */
  std() {
    if (this.size < 2) return 0;
    const m = this.mean();
    let v = 0;
    for (let i = 0; i < this.size; i++) {
      const idx = (this.write - this.size + i + this.capacity) % this.capacity;
      const d = (this.data[idx] ?? 0) - m;
      v += d * d;
    }
    return Math.sqrt(v / (this.size - 1));
  }
}
