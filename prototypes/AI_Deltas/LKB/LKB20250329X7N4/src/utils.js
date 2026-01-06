export function clamp(value, min, max) {
  if (Number.isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
}

export function wrapIndex(index, size) {
  const m = index % size;
  return m < 0 ? m + size : m;
}

export function avg(array) {
  if (!array.length) return 0;
  return array.reduce((sum, v) => sum + v, 0) / array.length;
}

export function variance(array, mean = avg(array)) {
  if (!array.length) return 0;
  const sq = array.reduce((sum, v) => sum + (v - mean) ** 2, 0);
  return sq / array.length;
}

export function choose(items) {
  return items[Math.floor(Math.random() * items.length)];
}
