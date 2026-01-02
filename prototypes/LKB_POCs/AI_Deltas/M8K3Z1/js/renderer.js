export class Renderer {
  constructor(canvas, size, renderConfig) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.size = size;
    this.renderConfig = renderConfig;
  }

  clear() {
    this.ctx.fillStyle = "#04060a";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  draw(liquid, parity) {
    const { cellSize, zParallax } = this.renderConfig;
    const spacing = cellSize + 2;
    this.clear();

    for (let z = 0; z < this.size.z; z += 1) {
      for (let y = 0; y < this.size.y; y += 1) {
        for (let x = 0; x < this.size.x; x += 1) {
          const idx = z * this.size.y * this.size.x + y * this.size.x + x;
          const value = liquid[idx];
          const hue = parity[idx] ? 190 : 320;
          const alpha = Math.min(0.9, 0.25 + value * 0.75);

          const screenX = x * spacing + z * zParallax * 4;
          const screenY = y * spacing + z * zParallax * 4;

          this.ctx.fillStyle = `hsla(${hue}, 80%, ${30 + value * 50}%, ${alpha})`;
          this.ctx.fillRect(screenX, screenY, cellSize, cellSize);
        }
      }
    }
  }
}

// TODO: add camera controls and z-slice toggles once multi-grid layering becomes heavier.
