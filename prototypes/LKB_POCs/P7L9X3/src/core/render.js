// Renderer handles projection + drawing only. Keeping it stateless makes it swappable (e.g., WebGL later).
export function createRenderer(canvas, config) {
  const ctx = canvas.getContext('2d');
  const state = { rotX: 0, rotY: Math.PI / 4 };

  const resize = () => {
    // TODO: Swap to devicePixelRatio-aware WebGL path for reason: scale to >4096 agents.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
  };
  resize();
  window.addEventListener('resize', resize);

  // Basic pointer orbit camera.
  let dragging = false;
  canvas.addEventListener('pointerdown', () => { dragging = true; });
  window.addEventListener('pointerup', () => { dragging = false; });
  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const rect = canvas.getBoundingClientRect();
    state.rotX = ((e.clientY - rect.top) / rect.height) * Math.PI - Math.PI / 2;
    state.rotY = ((e.clientX - rect.left) / rect.width) * Math.PI * 2;
  });

  function project(positions) {
    const points = [];
    const { fov, cameraZ } = config.CANVAS;
    const f = 1 / Math.tan(fov / 2);
    const aspect = canvas.width / canvas.height;
    const cx = Math.cos(state.rotX), sx = Math.sin(state.rotX);
    const cy = Math.cos(state.rotY), sy = Math.sin(state.rotY);

    for (let i = 0, p = 0; i < positions.length / 3; i++, p += 3) {
      let x = positions[p];
      let y = positions[p + 1];
      let z = positions[p + 2];

      // Rotate around Y then X.
      const rx = cy * x + sy * z;
      const rz = -sy * x + cy * z;
      const ry = cx * y - sx * rz;
      const rz2 = sx * y + cx * rz;
      const cz = cameraZ - rz2;
      if (Math.abs(cz) < 1e-3) continue;

      const ndcX = (f / aspect) * (rx / cz);
      const ndcY = f * (ry / cz);
      points.push({
        i,
        z: cz,
        x: (ndcX * 0.5 + 0.5) * canvas.width,
        y: (ndcY * 0.5 + 0.5) * canvas.height,
      });
    }

    return points.sort((a, b) => b.z - a.z);
  }

  function draw({ positions, plasma, liquid, parity, time }) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const points = project(positions);
    const hueBase = time * 0.08;
    for (const pt of points) {
      const l = liquid[pt.i];
      if (l < config.VIS_THRESHOLD) continue;
      const p = plasma[pt.i];
      const par = parity[pt.i];
      const h = (hueBase + par * 0.22 + p) % 1;
      const t = h * Math.PI * 2;
      const r = Math.abs(Math.sin(t)) * 255;
      const g = Math.abs(Math.sin(t + 2)) * 255;
      const b = Math.abs(Math.sin(t + 4)) * 255;
      const alpha = 0.28 + 0.7 * l;
      const size = config.POINT_SIZE + 6 * l;
      ctx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${alpha})`;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function savePNG(name = 'phasecube.png') {
    const a = document.createElement('a');
    a.download = name;
    a.href = canvas.toDataURL();
    a.click();
  }

  return { draw, savePNG, state };
}
