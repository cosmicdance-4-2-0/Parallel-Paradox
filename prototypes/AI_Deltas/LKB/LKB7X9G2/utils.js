export const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export const lerp = (a, b, t) => a + (b - a) * t;

export const mix = (a, b, w) => a * (1 - w) + b * w;

export const idx3D = (x, y, z, size) => {
  const sx = (x + size) % size;
  const sy = (y + size) % size;
  const sz = (z + size) % size;
  return sx + sy * size + sz * size * size;
};

export const neighbors6 = (x, y, z) => [
  [x + 1, y, z],
  [x - 1, y, z],
  [x, y + 1, z],
  [x, y - 1, z],
  [x, y, z + 1],
  [x, y, z - 1],
];

export const seededRandom = (seed) => {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};
