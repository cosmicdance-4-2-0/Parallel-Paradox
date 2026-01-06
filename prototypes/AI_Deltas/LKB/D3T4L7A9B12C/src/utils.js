export function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function toroidalIndex(x, y, z, size) {
  const nx = (x + size) % size;
  const ny = (y + size) % size;
  const nz = (z + size) % size;
  return (nz * size * size) + (ny * size) + nx;
}

export class RNG {
  constructor(seed = 123456789) {
    this.state = seed >>> 0;
  }

  next() {
    // Mulberry32
    this.state |= 0;
    this.state = (this.state + 0x6D2B79F5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

export function average(values) {
  if (!values.length) return 0;
  return values.reduce((acc, v) => acc + v, 0) / values.length;
}
