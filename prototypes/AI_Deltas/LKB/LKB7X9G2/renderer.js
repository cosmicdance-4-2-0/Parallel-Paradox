export class Renderer {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.config = config;
    this.lastSize = 0;
    this.resize();
  }

  resize() {
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.8;
    if (size !== this.lastSize) {
      this.canvas.width = size;
      this.canvas.height = size;
      this.lastSize = size;
    }
  }

  draw(plane) {
    const ctx = this.ctx;
    const s = Math.sqrt(plane.length);
    const scale = this.canvas.width / s;
    ctx.fillStyle = this.config.THEME.background;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        const cell = plane[x + y * s];
        const hue = this.config.THEME.palette[(cell.parity + (cell.plasma > 0.5)) % this.config.THEME.palette.length];
        const alpha = 0.35 + cell.liquid * 0.55;
        ctx.fillStyle = applyAlpha(hue, alpha);
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }

    // overlay: subtle solid memory bands
    ctx.globalCompositeOperation = "screen";
    const gradient = ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
    gradient.addColorStop(0, applyAlpha("#ffffff", 0.08));
    gradient.addColorStop(1, applyAlpha("#ffffff", 0.0));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.globalCompositeOperation = "source-over";
  }
}

function applyAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
