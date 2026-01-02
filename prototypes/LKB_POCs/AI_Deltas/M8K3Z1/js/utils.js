export const clamp01 = (v) => Math.min(1, Math.max(0, v));

export const wrapIndex = (v, max) => {
  if (v < 0) return max - 1;
  if (v >= max) return 0;
  return v;
};

export const idx3d = (x, y, z, size) => (z * size.y * size.x + y * size.x + x);

export const average = (values) => {
  if (!values.length) return 0;
  return values.reduce((acc, v) => acc + v, 0) / values.length;
};

export const lerp = (a, b, t) => a + (b - a) * t;
