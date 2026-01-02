export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const randomFloat = (min, max) => Math.random() * (max - min) + min;

export const computeVariance = (values) => {
  const n = values.length;
  if (n === 0) return 0;
  let sum = 0;
  for (let i = 0; i < n; i += 1) {
    sum += values[i];
  }
  const mean = sum / n;
  let variance = 0;
  for (let i = 0; i < n; i += 1) {
    const diff = values[i] - mean;
    variance += diff * diff;
  }
  return variance / n;
};
