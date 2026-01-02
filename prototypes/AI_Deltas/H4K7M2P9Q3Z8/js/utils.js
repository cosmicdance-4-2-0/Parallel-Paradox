export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function logWarn(msg, ...rest) {
  // Centralized for quick swap to on-screen logs if needed.
  console.warn(`[PhaseCube] ${msg}`, ...rest);
}

export function hexToRgb(hex) {
  const normalized = hex.replace('#', '');
  const bigint = parseInt(normalized, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

export function mixRgb(a, b, t) {
  return {
    r: Math.round(lerp(a.r, b.r, t)),
    g: Math.round(lerp(a.g, b.g, t)),
    b: Math.round(lerp(a.b, b.b, t)),
  };
}

export function rgbString({ r, g, b }, alpha = 1) {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function rotate(point, rotX, rotY) {
  const [x, y, z] = point;
  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  const cosX = Math.cos(rotX);
  const sinX = Math.sin(rotX);

  const dx = x * cosY - z * sinY;
  const dz = x * sinY + z * cosY;
  const dy = y * cosX - dz * sinX;
  const dz2 = y * sinX + dz * cosX;
  return [dx, dy, dz2];
}

export function project(point, depth, width, height) {
  const [x, y, z] = point;
  const zOffset = z + depth;
  const scale = depth / (zOffset || 1e-3);
  return {
    x: width / 2 + x * scale,
    y: height / 2 + y * scale,
    z: zOffset,
    scale,
  };
}
