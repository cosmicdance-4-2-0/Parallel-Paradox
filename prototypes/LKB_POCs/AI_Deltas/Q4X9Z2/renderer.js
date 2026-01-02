// 2D canvas renderer (DeltaID: Q4X9Z2)
// Minimal, human-readable projection with a small HUD for interpretability.

import { DELTA_ID, DEFAULT_CONFIG } from './config.js';

const TWO_PI = Math.PI * 2;

export class Renderer {
  constructor(canvas, size, config = DEFAULT_CONFIG.renderer) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.size = size;
    this.config = config;
    this.pointSize = DEFAULT_CONFIG.pointSize;
    this.rotateX = 0.35;
    this.rotateY = 0.6;
    this.positions = this._buildPositions();
  }

  _buildPositions() {
    const half = (this.size - 1) / 2;
    const positions = new Float32Array(this.size * this.size * this.size * 3);
    let idx = 0;
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        for (let z = 0; z < this.size; z++) {
          positions[idx++] = (x - half);
          positions[idx++] = (y - half);
          positions[idx++] = (z - half);
        }
      }
    }
    return positions;
  }

  project(px, py, pz) {
    const cosY = Math.cos(this.rotateY);
    const sinY = Math.sin(this.rotateY);
    const cosX = Math.cos(this.rotateX);
    const sinX = Math.sin(this.rotateX);

    const x1 = px * cosY - pz * sinY;
    const z1 = px * sinY + pz * cosY;
    const y1 = py * cosX - z1 * sinX;
    const z2 = py * sinX + z1 * cosX + 40; // Camera offset keeps things visible.

    const f = 300 / (300 + z2);
    return {
      x: this.canvas.width / 2 + x1 * f * DEFAULT_CONFIG.scale,
      y: this.canvas.height / 2 + y1 * f * DEFAULT_CONFIG.scale,
      depth: z2
    };
  }

  draw(core, echo, metrics, lensProfileName) {
    const ctx = this.ctx;
    ctx.fillStyle = this.config.bg;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const renderGrid = (grid, hueOffset, alphaScale) => {
      const len = grid.plasma.length;
      for (let i = 0, p = 0; i < len; i++, p += 3) {
        const pos = this.project(this.positions[p], this.positions[p + 1], this.positions[p + 2]);
        const plasma = grid.plasma[i];
        const hue = (plasma + hueOffset) % 1;
        const r = Math.sin(hue * TWO_PI) * 127 + 128;
        const g = Math.sin(hue * TWO_PI + 2) * 127 + 128;
        const b = Math.sin(hue * TWO_PI + 4) * 127 + 128;
        const alpha = 0.2 + plasma * alphaScale;

        ctx.beginPath();
        ctx.fillStyle = `rgba(${r.toFixed(0)}, ${g.toFixed(0)}, ${b.toFixed(0)}, ${alpha.toFixed(3)})`;
        ctx.arc(pos.x, pos.y, this.pointSize + plasma * 3, 0, TWO_PI);
        ctx.fill();
      }
    };

    renderGrid(core, 0.05, 0.7);
    renderGrid(echo, 0.35, 0.5);

    // HUD overlay for interpretability and Delta tracking.
    ctx.fillStyle = `rgba(255, 255, 255, ${this.config.strokeAlpha})`;
    ctx.font = '14px monospace';
    const lines = [
      `Delta ${DELTA_ID} — Lens: ${lensProfileName}`,
      `Core Energy: ${metrics.core.energy.toFixed(3)}`,
      `Echo Energy: ${metrics.echo.energy.toFixed(3)}`,
      `Core Cohere: ${metrics.core.coherence.toFixed(3)}`,
      `Echo Cohere: ${metrics.echo.coherence.toFixed(3)}`,
      `Divergence: ${metrics.divergence.toFixed(3)}`,
      `Bias Avg: ${metrics.biasAverage.toFixed(3)}`
    ];
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], 12, 20 + i * 16);
    }
  }
}
