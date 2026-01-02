import { palette } from "./config.js";
import { clamp } from "./utils.js";

export class Renderer {
  constructor(canvas, cfg) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.cfg = cfg;
    this.rotX = 0.6;
    this.rotY = 0.6;
    this._initEvents();
  }

  _initEvents() {
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    this.canvas.addEventListener("mousedown", (e) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    });

    window.addEventListener("mouseup", () => {
      dragging = false;
    });

    window.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      this.rotY += dx * this.cfg.rotateSpeed;
      this.rotX += dy * this.cfg.rotateSpeed;
    });
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.clientWidth * dpr;
    this.canvas.height = this.canvas.clientHeight * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  project(points) {
    const { width, height } = this.canvas;
    const halfW = width / 2;
    const halfH = height / 2;
    const fov = this.cfg.fov;
    const dist = this.cfg.distance;

    const sinX = Math.sin(this.rotX);
    const cosX = Math.cos(this.rotX);
    const sinY = Math.sin(this.rotY);
    const cosY = Math.cos(this.rotY);

    const projected = [];
    for (let i = 0; i < points.length; i += 3) {
      const x = points[i];
      const y = points[i + 1];
      const z = points[i + 2];

      const dx = x * cosY - z * sinY;
      const dz = x * sinY + z * cosY;
      const dy = y * cosX - dz * sinX;
      const dz2 = y * sinX + dz * cosX + dist;

      const scale = fov / Math.max(0.0001, dz2);
      const sx = dx * scale * halfW + halfW;
      const sy = dy * scale * halfH + halfH;
      projected.push({ x: sx, y: sy, z: dz2, i: i / 3, scale });
    }

    return projected.sort((a, b) => b.z - a.z);
  }

  draw(points, plasma, liquid, solid, parity, metrics, deltaID) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const projected = this.project(points);
    for (const p of projected) {
      const energy = plasma[p.i];
      const flow = liquid[p.i];
      const mem = solid[p.i];
      const hue = (energy * 0.5 + flow * 0.35 + mem * 0.15) % 1;
      const r = Math.sin(hue * Math.PI * 2) * 127 + 128;
      const g = Math.sin(hue * Math.PI * 2 + 2) * 127 + 128;
      const b = Math.sin(hue * Math.PI * 2 + 4) * 127 + 128;
      const radius = 2 + flow * 4;

      ctx.fillStyle = `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${clamp(0.15 + energy * 0.8, 0.1, 0.9)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();

      if (parity[p.i]) {
        ctx.strokeStyle = palette.parity;
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }
    }

    this._drawHud(metrics, deltaID);
  }

  _drawHud(metrics, deltaID) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = palette.hud;
    ctx.font = "12px monospace";
    ctx.textBaseline = "top";
    ctx.fillText(`Delta ${deltaID}`, 12, 10);
    ctx.fillText(`Energy: ${metrics.meanEnergy.toFixed(3)}`, 12, 26);
    ctx.fillText(`Variance: ${metrics.variance.toFixed(3)}`, 12, 42);
    ctx.fillText(`Parity: ${metrics.parityBias.toFixed(3)}`, 12, 58);
    ctx.restore();
  }
}
