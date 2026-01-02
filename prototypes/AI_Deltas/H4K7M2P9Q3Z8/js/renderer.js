import { hexToRgb, mixRgb, project, rgbString, rotate } from './utils.js';

export class Renderer {
  constructor(canvas, config, positions) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.config = config;
    this.positions = positions;
    this.rotation = { x: 0.6, y: 0.35 };
    this.spin = config.view.spinRate;
    this.colors = {
      a: hexToRgb(config.colors.gridA),
      b: hexToRgb(config.colors.gridB),
      base: hexToRgb(config.colors.base),
    };
    this.bindMouse();
  }

  bindMouse() {
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    this.canvas.addEventListener('pointerdown', (e) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    });
    window.addEventListener('pointerup', () => (dragging = false));
    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      this.rotation.y += dx * 0.003;
      this.rotation.x += dy * 0.003;
    });
  }

  draw(gridA, gridB, timeMs) {
    const ctx = this.ctx;
    const width = (this.canvas.width = this.canvas.clientWidth || this.canvas.width);
    const height = (this.canvas.height = this.canvas.clientHeight || this.canvas.height);
    ctx.clearRect(0, 0, width, height);

    const depth = this.config.view.depth;
    const pointSize = this.config.view.pointSize;
    const fog = this.config.view.fog;
    const autoSpin = timeMs * 0.001 * this.spin;

    const drawList = [];
    for (let i = 0; i < this.positions.length; i += 3) {
      const idx = i / 3;
      const rotated = rotate(
        [this.positions[i], this.positions[i + 1], this.positions[i + 2]],
        this.rotation.x,
        this.rotation.y + autoSpin,
      );
      const proj = project(rotated, depth, width, height);
      if (proj.z < 6) continue;

      const energyA = Math.abs(gridA.liquid[idx]) * 0.8 + Math.abs(gridA.plasma[idx]) * 0.25;
      const energyB = Math.abs(gridB.liquid[idx]) * 0.8 + Math.abs(gridB.plasma[idx]) * 0.25;
      const total = energyA + energyB;
      if (total < 0.02) continue;

      const mix = total === 0 ? 0.5 : energyB / total;
      const color = mixRgb(this.colors.a, this.colors.b, mix);
      const alpha = Math.min(0.9, 0.1 + total * 0.8);
      const radius = pointSize + total * 5 * proj.scale;
      const foggedAlpha = alpha * Math.exp(-proj.z * 0.0008 * fog);

      drawList.push({ x: proj.x, y: proj.y, z: proj.z, r: radius, color, alpha: foggedAlpha });
    }

    drawList.sort((a, b) => b.z - a.z);
    for (const p of drawList) {
      ctx.beginPath();
      ctx.fillStyle = rgbString(p.color, p.alpha);
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // HUD overlay for soft depth cue.
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(12,15,20,0.0)');
    gradient.addColorStop(1, 'rgba(12,15,20,0.25)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
}
