import { CONFIG } from './config.js';
import { projectPoint } from './utils.js';

function hslToRgb(h, s, l) {
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h * 12) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return [f(0), f(8), f(4)];
}

export class Renderer {
  constructor(canvas, grid) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.grid = grid;
    this.rotation = { x: 0, y: 0 };
    this.isDragging = false;
    this.prev = null;
    this._bindEvents();
  }

  _bindEvents() {
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.prev = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });
    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging || !this.prev) return;
      const dx = e.clientX - this.prev.x;
      const dy = e.clientY - this.prev.y;
      this.prev = { x: e.clientX, y: e.clientY };
      this.rotation.y += dx * 0.005;
      this.rotation.x += dy * 0.005;
    });
  }

  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  draw(time) {
    const ctx = this.ctx;
    ctx.fillStyle = CONFIG.render.background;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const points = [];
    for (let i = 0; i < this.grid.count; i += 1) {
      const px = this.grid.positions[i * 3 + 0];
      const py = this.grid.positions[i * 3 + 1];
      const pz = this.grid.positions[i * 3 + 2];
      const { screenX, screenY, depth, scale } = projectPoint(
        { x: px, y: py, z: pz },
        this.rotation.x,
        this.rotation.y,
        this.canvas.width,
        this.canvas.height,
      );
      points.push({ i, screenX, screenY, depth, scale });
    }

    points.sort((a, b) => b.depth - a.depth);

    for (const point of points) {
      const idx = point.i;
      const plasma = this.grid.plasma[idx];
      const liquid = this.grid.liquid[idx];
      const trace = this.grid.trace[idx];
      const parity = this.grid.parity[idx];

      const hue = (time * 0.00025 + plasma * 0.6 + trace * 0.4 + parity * 0.12) % 1;
      const sat = 0.65 + liquid * 0.2;
      const light = 0.35 + plasma * 0.25 + trace * 0.1;
      const [r, g, b] = hslToRgb(hue, sat, light);
      const alpha = 0.28 + liquid * 0.4 + trace * 0.3;

      const radius = CONFIG.render.pointSize + plasma * CONFIG.render.pointGain * point.scale;
      ctx.fillStyle = `rgba(${Math.floor(r * 255)}, ${Math.floor(g * 255)}, ${Math.floor(b * 255)}, ${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(point.screenX, point.screenY, Math.max(1.5, radius), 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// TODO: Provide a WebGL renderer that reads the same PhaseGrid buffers for larger grids.
// TODO: Surface additional overlays (trace heatmaps, bias vectors) behind debug toggles.
