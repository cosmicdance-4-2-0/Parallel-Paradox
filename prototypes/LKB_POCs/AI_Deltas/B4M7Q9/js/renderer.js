import { DeltaID } from "./config.js";

const overlayEl = () => document.getElementById("overlay");

export class Renderer {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.config = config;
    this.rotationX = 0.8;
    this.rotationY = 0.7;
    this.lastStamp = performance.now();
    this.fps = 0;
  }

  project(points, values) {
    const { width, height } = this.canvas;
    const cx = width / 2;
    const cy = height / 2;
    const { fov, cameraZ, scale } = this.config;
    const projected = [];

    for (let i = 0; i < points.length; i += 3) {
      let x = points[i];
      let y = points[i + 1];
      let z = points[i + 2];

      // Rotate around Y then X for a simple orbital view.
      const yRot = x * Math.cos(this.rotationY) + z * Math.sin(this.rotationY);
      const zRot = -x * Math.sin(this.rotationY) + z * Math.cos(this.rotationY);
      x = yRot;
      z = zRot;
      const xRot = y * Math.cos(this.rotationX) - z * Math.sin(this.rotationX);
      const zRot2 = y * Math.sin(this.rotationX) + z * Math.cos(this.rotationX);
      y = xRot;
      z = zRot2;

      const depth = 1 / Math.tan(fov / 2);
      const proj = depth / (z / scale + cameraZ);
      const px = x * proj * scale + cx;
      const py = y * proj * scale + cy;

      // Skip points behind the camera.
      if (z < -cameraZ) continue;
      projected.push({ x: px, y: py, z, value: values[i / 3] });
    }

    // Painter's algorithm: back to front.
    projected.sort((a, b) => b.z - a.z);
    return projected;
  }

  draw(points, grid, overlayMetrics) {
    const ctx = this.ctx;
    ctx.fillStyle = this.config.bg;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const projected = this.project(points, grid.liquid);

    for (const p of projected) {
      const hue = (p.value * 360 + 180) % 360;
      const alpha = 0.35 + p.value * 0.6;
      const radius = this.config.pointSize + p.value * 8;
      ctx.beginPath();
      ctx.fillStyle = `hsla(${hue}, 70%, 65%, ${alpha})`;
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    this.updateFPS();
    this.renderOverlay(overlayMetrics);
  }

  renderOverlay(metrics) {
    const el = overlayEl();
    if (!el) return;
    const lines = [
      `Delta: ${DeltaID}`,
      `Coherence: ${metrics.coherence.toFixed(3)}`,
      `Dispersion: ${metrics.dispersion.toFixed(3)}`,
      `Bias energy: ${metrics.bias.toFixed(3)}`,
      `Coupling: ${metrics.coupling.toFixed(3)}`,
      `FPS: ${this.fps.toFixed(1)}`,
    ];
    el.innerText = lines.join("\n");
  }

  updateFPS() {
    const now = performance.now();
    const delta = now - this.lastStamp;
    this.lastStamp = now;
    this.fps = 1000 / delta;
  }
}
