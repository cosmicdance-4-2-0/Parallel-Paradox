export function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function hashNoise(x, y, z) {
  const seed = x * 374761393 + y * 668265263 + z * 2147483647;
  const r = (seed ^ (seed << 13)) >>> 0;
  return (r / 0xffffffff) * 2 - 1;
}

export function average(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i += 1) sum += arr[i];
  return sum / arr.length;
}

export function variance(arr, mean) {
  let acc = 0;
  for (let i = 0; i < arr.length; i += 1) {
    const d = arr[i] - mean;
    acc += d * d;
  }
  return acc / arr.length;
}

export function wrapIndex(i, size) {
  if (i >= 0 && i < size) return i;
  return (i + size) % size;
}

export function safeRequestAnimationFrame(cb) {
  return window.requestAnimationFrame(cb);
}
