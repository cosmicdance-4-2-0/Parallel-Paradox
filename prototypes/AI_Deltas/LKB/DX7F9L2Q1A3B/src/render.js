import { DeltaID } from './config.js';

export function makePositions(size, scale) {
  const total = size ** 3;
  const positions = new Float32Array(total * 3);
  const half = (size - 1) / 2;
  let ptr = 0;
  for (let x = 0; x < size; x += 1) {
    for (let y = 0; y < size; y += 1) {
      for (let z = 0; z < size; z += 1) {
        positions[ptr++] = (x - half) * scale;
        positions[ptr++] = (y - half) * scale;
        positions[ptr++] = (z - half) * scale;
      }
    }
  }
  return positions;
}

export function renderFrame(ctx, positions, grid, cfg, time, lensMix, metrics) {
  const { pointSize, visThreshold } = cfg.render;
  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // TODO: swap to WebGL instancing when scaling past browser-friendly grid sizes (per SV6/SV7).
  const cameraZ = 320;
  const fov = Math.PI / 3.2;
  const f = 1 / Math.tan(fov / 2);
  const aspect = ctx.canvas.width / ctx.canvas.height;
  const points = [];

  for (let i = 0, p = 0; i < positions.length / 3; i += 1, p += 3) {
    let x = positions[p];
    let y = positions[p + 1];
    let z = positions[p + 2];

    const rot = time * 0.2;
    const cy = Math.cos(rot);
    const sy = Math.sin(rot);
    const cx = Math.cos(rot * 0.5);
    const sx = Math.sin(rot * 0.5);

    const rx = cy * x + sy * z;
    const rz = -sy * x + cy * z;
    const ry = cx * y - sx * rz;
    const rz2 = sx * y + cx * rz;

    const cz = cameraZ - rz2;
    if (cz <= 0.1) continue;
    const ndcX = (f / aspect) * (rx / cz);
    const ndcY = f * (ry / cz);

    points.push({
      i,
      z: cz,
      x: (ndcX * 0.5 + 0.5) * ctx.canvas.width,
      y: (ndcY * 0.5 + 0.5) * ctx.canvas.height
    });
  }

  points.sort((a, b) => b.z - a.z);
  const hueBase = time * 0.05;
  for (const pt of points) {
    const energy = grid.plasma[pt.i];
    const l = grid.liquid[pt.i];
    if (l < visThreshold) continue;
    const hue = (hueBase + energy + grid.parity[pt.i] * 0.3) % 1;
    const color = hsl(hue, 0.8, 0.55, 0.25 + l * 0.7);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, pointSize + l * 7, 0, Math.PI * 2);
    ctx.fill();
  }

  drawOverlay(ctx, lensMix, metrics);
}

function drawOverlay(ctx, lensMix, metrics) {
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.fillRect(10, 10, 240, 110);
  ctx.fillStyle = '#d6ffd6';
  ctx.font = '12px monospace';
  ctx.fillText(`Delta ${DeltaID}`, 20, 30);
  ctx.fillText(`Predictive: ${lensMix.predictive.toFixed(2)}`, 20, 50);
  ctx.fillText(`Harmonic: ${lensMix.harmonic.toFixed(2)}`, 20, 65);
  ctx.fillText(`Path boost: ${lensMix.pathBoost.toFixed(3)}`, 20, 80);
  ctx.fillText(`Energy: ${metrics.energy.toFixed(3)}`, 20, 95);
  ctx.fillText(`Coherence: ${metrics.coherence.toFixed(3)}`, 20, 110);
}

function hsl(h, s, l, a) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h * 6;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let [r, g, b] = [0, 0, 0];
  if (hp >= 0 && hp < 1) [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = l - c / 2;
  const to255 = (v) => Math.round((v + m) * 255);
  return `rgba(${to255(r)}, ${to255(g)}, ${to255(b)}, ${a})`;
}
