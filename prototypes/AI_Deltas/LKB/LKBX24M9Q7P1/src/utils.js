export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function wrapIndex(value, size) {
  if (value < 0) return size - 1;
  if (value >= size) return 0;
  return value;
}

export function idx(x, y, z, size) {
  return x + y * size + z * size * size;
}

export function randomSigned(magnitude = 1) {
  return (Math.random() * 2 - 1) * magnitude;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function variance(values, mean) {
  let acc = 0;
  for (let i = 0; i < values.length; i += 1) {
    const diff = values[i] - mean;
    acc += diff * diff;
  }
  return acc / values.length;
}

export function average(values) {
  let acc = 0;
  for (let i = 0; i < values.length; i += 1) {
    acc += values[i];
  }
  return values.length ? acc / values.length : 0;
}

export function copyField(source) {
  return new Float32Array(source);
}
