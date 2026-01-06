import { clamp01 } from "./utils.js";

export class Renderer {
  constructor(canvas, { size, scale, camera }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.size = size;
    this.scale = scale;
    this.camera = camera;
    this.points = this.buildPoints();
  }

  buildPoints() {
    const n = this.size;
    const pts = new Float32Array(n * n * n * 3);
    let idx = 0;
    const offset = (n - 1) / 2;
    for (let z = 0; z < n; z++) {
      for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
          pts[idx++] = (x - offset) * this.scale;
          pts[idx++] = (y - offset) * this.scale;
          pts[idx++] = (z - offset) * this.scale;
        }
      }
    }
    return pts;
  }

  project(angleX, angleY) {
    const { width, height } = this.canvas;
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);
    const projected = [];
    for (let i = 0; i < this.points.length; i += 3) {
      const x = this.points[i];
      const y = this.points[i + 1];
      const z = this.points[i + 2] + this.camera.distance * 0.25;

      // Rotate around Y, then X.
      const dx = x * cosY - z * sinY;
      const dz = x * sinY + z * cosY;
      const dy = y * cosX - dz * sinX;
      const finalZ = y * sinX + dz * cosX + this.camera.distance;

      const fov = 420;
      const scale = fov / (fov + finalZ);
      const sx = width * 0.5 + dx * scale;
      const sy = height * 0.5 + dy * scale;
      projected.push({ i: i / 3, x: sx, y: sy, z: finalZ, scale });
    }
    // Painter's algorithm.
    projected.sort((a, b) => b.z - a.z);
    return projected;
  }

  render({ core, echo, trace, angleX, angleY }) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const projected = this.project(angleX, angleY);
    const { liquid: cLiq, plasma: cPlasma } = core;
    const { liquid: eLiq } = echo || { liquid: null };
    const traceAvg = trace?.avg;

    for (const p of projected) {
      const idx = p.i;
      const liquid = cLiq[idx];
      const echoValue = eLiq ? eLiq[idx] : 0;
      const traceValue = traceAvg ? traceAvg[idx] : 0;
      const plasma = cPlasma[idx];

      const hue = (liquid * 180 + echoValue * 90 + plasma * 45) % 360;
      const light = clamp01(0.25 + liquid * 0.45 + traceValue * 0.2) * 100;
      const alpha = clamp01(0.35 + liquid * 0.45);
      const radius = 3 + liquid * 5 + echoValue * 3;

      ctx.beginPath();
      ctx.fillStyle = `hsla(${hue}, 70%, ${light}%, ${alpha})`;
      ctx.arc(p.x, p.y, radius * p.scale, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
