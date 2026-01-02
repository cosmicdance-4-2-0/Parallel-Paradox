export class Renderer {
  constructor(canvas, config, positions) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.config = config;
    this.positions = positions;
    this.rotation = { x: -0.6, y: 0.6 };
    this.spinRate = config.spinRate;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.enableDrag();
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = this.canvas.clientWidth * dpr;
    this.canvas.height = this.canvas.clientHeight * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  enableDrag() {
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    this.canvas.addEventListener('pointerdown', (e) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      this.canvas.setPointerCapture(e.pointerId);
    });
    this.canvas.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      this.rotation.y += dx * 0.005;
      this.rotation.x += dy * 0.005;
      lastX = e.clientX;
      lastY = e.clientY;
    });
    this.canvas.addEventListener('pointerup', (e) => {
      dragging = false;
      this.canvas.releasePointerCapture(e.pointerId);
    });
  }

  draw(grid, time) {
    const { width, height } = this.canvas;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2, height / 2);

    // Auto-spin unless the user stops it.
    this.rotation.y += this.spinRate * 0.005;

    const { plasma, liquid, solid, parity } = grid;
    const { pointSize, colors } = this.config;
    const rot = this.rotation;
    const cosX = Math.cos(rot.x);
    const sinX = Math.sin(rot.x);
    const cosY = Math.cos(rot.y);
    const sinY = Math.sin(rot.y);

    for (let i = 0; i < this.positions.length; i += 3) {
      const px = this.positions[i];
      const py = this.positions[i + 1];
      const pz = this.positions[i + 2];

      // Rotate around Y then X.
      const rx = px * cosY + pz * sinY;
      const rz = -px * sinY + pz * cosY;
      const ry = py * cosX - rz * sinX;
      const depth = ry + rz * 0.3;

      const idx = i / 3;
      const energy = Math.abs(plasma[idx]) + Math.abs(liquid[idx]);
      if (energy < 0.01) continue; // keep visible but minimal.

      const phaseBlend = Math.max(0, Math.min(1, Math.abs(liquid[idx])));
      const size = pointSize + phaseBlend * pointSize * 1.5;

      const isParity = parity[idx] === 1;
      const color = isParity
        ? colors.parity
        : energy > 0.6
          ? colors.plasma
          : energy > 0.3
            ? colors.liquid
            : colors.solid;

      const alpha = Math.min(0.95, 0.4 + energy * 0.8);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.fillRect(rx * 24, depth * 24, size, size);
    }

    ctx.restore();
  }

  snapshot() {
    // TODO: include config metadata in the saved file?
    const link = document.createElement('a');
    link.download = `phasecube-${Date.now()}.png`;
    link.href = this.canvas.toDataURL('image/png');
    link.click();
  }
}
