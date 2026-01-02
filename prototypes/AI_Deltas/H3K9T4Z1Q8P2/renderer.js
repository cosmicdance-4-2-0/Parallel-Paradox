import { DeltaID } from "./config.js";

export class Renderer {
  constructor(canvas, cfg) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.cfg = cfg;
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = this.canvas.clientWidth * dpr;
    this.canvas.height = this.canvas.clientHeight * dpr;
  }

  projectPositions(positions, rotX, rotY) {
    const { CAMERA_Z, FOV } = this.cfg;
    const points = [];
    const aspect = this.canvas.width / this.canvas.height;
    const f = 1 / Math.tan(FOV / 2);
    const cx = Math.cos(rotX), sx = Math.sin(rotX);
    const cy = Math.cos(rotY), sy = Math.sin(rotY);

    for (let i = 0, p = 0; i < positions.length / 3; i++, p += 3) {
      let x = positions[p], y = positions[p + 1], z = positions[p + 2];
      const rx = cy * x + sy * z;
      const rz = -sy * x + cy * z;
      const ry = cx * y - sx * rz;
      const rz2 = sx * y + cx * rz;
      const cz = CAMERA_Z - rz2;
      if (Math.abs(cz) < 1e-3) continue;
      const ndcX = (f / aspect) * (rx / cz);
      const ndcY = f * (ry / cz);
      points.push({
        i,
        z: cz,
        x: (ndcX * 0.5 + 0.5) * this.canvas.width,
        y: (ndcY * 0.5 + 0.5) * this.canvas.height,
      });
    }
    points.sort((a, b) => b.z - a.z);
    return points;
  }

  draw({ positions, grid, rot, time }) {
    const ctx = this.ctx;
    ctx.fillStyle = "#020302";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const pts = this.projectPositions(positions, rot.rotX, rot.rotY);
    const hueBase = time * 0.08;
    for (const pt of pts) {
      const l = grid.liquid[pt.i];
      if (l < this.cfg.VIS_THRESHOLD) continue;
      const p = grid.plasma[pt.i];
      const par = grid.parity[pt.i];
      const h = (hueBase + par * 0.22 + p) % 1;
      const t = h * Math.PI * 2;
      const r = Math.abs(Math.sin(t)) * 255;
      const g = Math.abs(Math.sin(t + 2)) * 255;
      const b = Math.abs(Math.sin(t + 4)) * 255;
      const alpha = 0.32 + 0.68 * l;
      const size = this.cfg.POINT_SIZE + 8 * l;
      ctx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${alpha})`;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  renderMetrics(el, metrics) {
    const { fps, dispersion, crossTalk, delayStrength, harmonicGain, paused } = metrics;
    el.innerHTML = [
      `<strong>DeltaID ${DeltaID}</strong>`,
      `FPS: ${fps.toFixed(1)}`,
      `Dispersion: ${dispersion.toFixed(3)}`,
      `Cross-talk: ${crossTalk.toFixed(2)}`,
      `Delay: ${delayStrength.toFixed(2)}`,
      `Harmonic gain: ${harmonicGain.toFixed(2)}`,
      `State: ${paused ? "paused" : "dreaming"}`,
    ].join("<br>");
  }
}
