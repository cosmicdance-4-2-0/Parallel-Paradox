export const clamp01 = (v) => Math.min(1, Math.max(0, v));

export const lerp = (a, b, t) => a + (b - a) * t;

export const modulo = (n, m) => {
  const r = n % m;
  return r < 0 ? r + m : r;
};

export const seeded = (seed = 1) => {
  let x = seed | 0;
  return () => {
    // Xorshift32 — simple, predictable, human-auditable.
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 0xffffffff;
  };
};
