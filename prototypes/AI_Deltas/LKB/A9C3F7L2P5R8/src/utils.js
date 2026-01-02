export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const indexFromCoord = (x, y, z, dims) => {
  const wrap = (v, max) => {
    if (v < 0) return max + v;
    if (v >= max) return v - max;
    return v;
  };
  const nx = wrap(x, dims.x);
  const ny = wrap(y, dims.y);
  const nz = wrap(z, dims.z);
  return nz * dims.x * dims.y + ny * dims.x + nx;
};

export const neighborsOf = (index, dims) => {
  const plane = dims.x * dims.y;
  const z = Math.floor(index / plane);
  const rem = index % plane;
  const y = Math.floor(rem / dims.x);
  const x = rem % dims.x;
  return [
    indexFromCoord(x + 1, y, z, dims),
    indexFromCoord(x - 1, y, z, dims),
    indexFromCoord(x, y + 1, z, dims),
    indexFromCoord(x, y - 1, z, dims),
    indexFromCoord(x, y, z + 1, dims),
    indexFromCoord(x, y, z - 1, dims)
  ];
};

export const cloneField = (field) => new Float32Array(field);
