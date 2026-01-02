// Renderer and overlays — DeltaID: Q6P3R8
// Keeps visualization honest: projection is just a view into the lattice state.

export class Renderer {
  constructor(canvas, config, deltaIdLabel) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.config = config;
    this.deltaIdLabel = deltaIdLabel;
    this.rotation = { x: 0.4, y: 0.6 };
    this._setupCanvas();
    this._bindPointer();
  }

  _setupCanvas() {
    this.canvas.width = 1024;
    this.canvas.height = 768;
    this.ctx.font = "14px monospace";
    this.ctx.imageSmoothingEnabled = true;
  }

  _bindPointer() {
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    this.canvas.addEventListener("pointerdown", (e) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    });
    window.addEventListener("pointerup", () => (dragging = false));
    window.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      this.rotation.y += dx * 0.005;
      this.rotation.x += dy * 0.005;
      lastX = e.clientX;
      lastY = e.clientY;
    });
  }

  #project(points) {
    const { scale } = this.config;
    const cosX = Math.cos(this.rotation.x);
    const sinX = Math.sin(this.rotation.x);
    const cosY = Math.cos(this.rotation.y);
    const sinY = Math.sin(this.rotation.y);
    const projected = [];
    for (let i = 0; i < points.length; i += 3) {
      let x = points[i] * scale;
      let y = points[i + 1] * scale;
      let z = points[i + 2] * scale;

      const dx = x * cosY - z * sinY;
      const dz = x * sinY + z * cosY;
      x = dx;
      z = dz;
      const dy = y * cosX - z * sinX;
      z = y * sinX + z * cosX;
      y = dy;

      const perspective = 400 / (400 + z);
      const px = this.canvas.width / 2 + x * perspective;
      const py = this.canvas.height / 2 + y * perspective;
      projected.push({ x: px, y: py, depth: perspective });
    }
    return projected;
  }

  draw(points, plasma, parity, metrics) {
    const projection = this.#project(points);
    const ctx = this.ctx;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < projection.length; i += 1) {
      const { x, y, depth } = projection[i];
      const p = plasma[i];
      const hue = (p * 240 + (parity[i] ? 60 : 0)) % 360;
      const radius = Math.max(
        1,
        this.config.pointSize + depth * 6 * (0.2 + p),
      );
      ctx.fillStyle = `hsla(${hue}, 75%, ${35 + p * 30}%, ${0.3 + p * 0.6})`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    this.#drawOverlay(metrics);
  }

  #drawOverlay(metrics) {
    const ctx = this.ctx;
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(10, 10, 330, 120);
    ctx.fillStyle = "#e0ffe0";
    ctx.fillText(`DeltaID: ${this.deltaIdLabel}`, 20, 30);
    ctx.fillText(`Energy (avg): ${metrics.energy.toFixed(3)}`, 20, 50);
    ctx.fillText(`Dispersion: ${metrics.dispersion.toFixed(3)}`, 20, 70);
    ctx.fillText(
      `Audio bias: ${metrics.audioLevel ? metrics.audioLevel.toFixed(3) : "0.000"}`,
      20,
      90,
    );
    ctx.fillText(`FPS target: ${this.config.fpsCap}`, 20, 110);
    // TODO: Add rolling charts (mini spark lines) for metrics when canvas space allows.
  }
}
