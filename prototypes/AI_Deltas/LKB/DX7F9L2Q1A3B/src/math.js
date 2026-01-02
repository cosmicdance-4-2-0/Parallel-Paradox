export function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}

export function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

export function mean(values) {
  if (!values.length) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function variance(values, avg = mean(values)) {
  if (!values.length) return 0;
  return mean(values.map((v) => (v - avg) ** 2));
}
