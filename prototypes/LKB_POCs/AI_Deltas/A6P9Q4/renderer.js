// Renderer for PhaseCube Delta (DeltaID: A6P9Q4)
// Minimal canvas renderer with rotational controls and metrics overlay.

const TWO_PI = Math.PI * 2;

export class Renderer {
  constructor(canvas, size, scale, rendererConfig) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.size = size;
    this.scale = scale;
    this.rendererConfig = rendererConfig;
    this.time = 0;
    this.rotateX = 0.35;
    this.rotateY = 0.75;
    this.positions = this._buildPositions();
    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  _resize() {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
  }

  _buildPositions() {
    const half = (this.size - 1) / 2;
    const positions = new Float32Array(this.size * this.size * this.size * 3);
    let idx = 0;
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        for (let z = 0; z < this.size; z++) {
          positions[idx++] = (x - half) * this.scale;
          positions[idx++] = (y - half) * this.scale;
          positions[idx++] = (z - half) * this.scale;
        }
      }
    }
    return positions;
  }

  project(posX, posY, posZ) {
    const cosY = Math.cos(this.rotateY);
    const sinY = Math.sin(this.rotateY);
    const cosX = Math.cos(this.rotateX);
    const sinX = Math.sin(this.rotateX);

    const x1 = posX * cosY - posZ * sinY;
    const z1 = posX * sinY + posZ * cosY;
    const y1 = posY * cosX - z1 * sinX;
    const z2 = posY * sinX + z1 * cosX + 320;

    const f = 420 / (420 + z2);
    return {
      x: this.canvas.width / 2 + x1 * f,
      y: this.canvas.height / 2 + y1 * f,
      depth: z2
    };
  }

  draw(grids, metrics, lensLabel) {
    this.time += 1;
    const { pointSize, strokeAlpha, bg } = this.rendererConfig;
    const ctx = this.ctx;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const palette = [
      { hue: 0.05, alphaScale: 0.6 },
      { hue: 0.38, alphaScale: 0.45 },
      { hue: 0.62, alphaScale: 0.35 }
    ];
    const entries = [grids.core, grids.echo, grids.scout];

    entries.forEach((grid, idx) => {
      const color = palette[idx];
      for (let i = 0, p = 0; i < grid.plasma.length; i++, p += 3) {
        const pos = this.project(this.positions[p], this.positions[p + 1], this.positions[p + 2]);
        const plasma = grid.plasma[i];
        const hue = (this.time * 0.0008 + color.hue + plasma) % 1;
        const r = Math.sin(hue * TWO_PI) * 127 + 128;
        const g = Math.sin(hue * TWO_PI + 2) * 127 + 128;
        const b = Math.sin(hue * TWO_PI + 4) * 127 + 128;
        const alpha = 0.25 + plasma * color.alphaScale;

        ctx.beginPath();
        ctx.fillStyle = `rgba(${r.toFixed(0)}, ${g.toFixed(0)}, ${b.toFixed(0)}, ${alpha.toFixed(3)})`;
        ctx.arc(pos.x, pos.y, pointSize + plasma * 4, 0, TWO_PI);
        ctx.fill();
      }
    });

    ctx.fillStyle = `rgba(255,255,255,${strokeAlpha})`;
    ctx.font = '14px monospace';
    const lines = [
      lensLabel,
      `Core E:${metrics.core.energy.toFixed(3)} C:${metrics.core.coherence.toFixed(3)}`,
      `Echo E:${metrics.echo.energy.toFixed(3)} C:${metrics.echo.coherence.toFixed(3)}`,
      `Scout E:${metrics.scout.energy.toFixed(3)} C:${metrics.scout.coherence.toFixed(3)}`,
      `Divergence:${metrics.divergence.toFixed(3)} History:${metrics.historyBias.toFixed(3)}`
    ];
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], 12, 18 + i * 16);
    }
  }
}
