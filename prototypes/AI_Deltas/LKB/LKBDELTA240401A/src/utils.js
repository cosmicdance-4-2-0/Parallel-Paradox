export function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function wrapIndex(x, size) {
  const mod = x % size;
  return mod < 0 ? mod + size : mod;
}

export function idx3D(x, y, z, size) {
  return wrapIndex(x, size) + wrapIndex(y, size) * size + wrapIndex(z, size) * size * size;
}

export function neighborhoodVariance(plasma, index, size) {
  const x = index % size;
  const y = Math.floor(index / size) % size;
  const z = Math.floor(index / (size * size));

  let sum = 0;
  let sumSq = 0;
  let count = 0;

  const neighbors = [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1]
  ];

  for (const [dx, dy, dz] of neighbors) {
    const idx = idx3D(x + dx, y + dy, z + dz, size);
    const val = plasma[idx];
    sum += val;
    sumSq += val * val;
    count += 1;
  }

  if (count === 0) return 0;
  const mean = sum / count;
  return clamp(sumSq / count - mean * mean, 0, 1);
}

export function averageNeighbors(plasma, index, size) {
  const x = index % size;
  const y = Math.floor(index / size) % size;
  const z = Math.floor(index / (size * size));

  const neighbors = [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1]
  ];

  let total = 0;
  for (const [dx, dy, dz] of neighbors) {
    total += plasma[idx3D(x + dx, y + dy, z + dz, size)];
  }
  return total / neighbors.length;
}
