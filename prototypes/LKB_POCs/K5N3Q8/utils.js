// Utility helpers kept small and explicit for readability.

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function hashNoise(seed) {
  // Simple hash-based pseudo-random to keep deterministic diffusion steps when desired.
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function rollingAverage(prev, next, strength) {
  // strength in [0,1]; higher favors the new value.
  return prev * (1 - strength) + next * strength;
}

export function index3D(x, y, z, size) {
  return (z * size + y) * size + x;
}

export function projectPoint(point, rotX, rotY, width, height) {
  // Rotate around Y then X for intuitive drag control.
  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  const cosX = Math.cos(rotX);
  const sinX = Math.sin(rotX);

  const x1 = point.x * cosY - point.z * sinY;
  const z1 = point.x * sinY + point.z * cosY;
  const y1 = point.y * cosX - z1 * sinX;
  const z2 = point.y * sinX + z1 * cosX + 220; // push camera back

  const fov = 320;
  const scale = fov / (fov + z2);
  return {
    screenX: width * 0.5 + x1 * scale,
    screenY: height * 0.5 + y1 * scale,
    depth: z2,
    scale,
  };
}

// TODO: Move math helpers into a shared package if/when multiple POCs coexist in one page.
