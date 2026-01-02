/**
 * PhaseCube Delta (DeltaID: L7Q9XK)
 * Multi-layer dreaming swarm with delayed feedback, structural plasticity, and interpretive overlays.
 * Design goals: Minimal, modular, tunable, and human-readable. Comments highlight extension points.
 */

const SIM_CONFIG = {
  gridSize: 14, // Tunable grid size (agents = gridSize^3); keep small for browsers.
  pointSize: 4,
  plasmaFlip: 0.01, // Noise floor; updated live via UI.
  parityFlip: 0.005,
  pathBProbability: 0.6,
  alpha: 0.16, // Solid phase damping.
  crossTalk: 0.08, // Coupling strength between grids; updated live via UI.
  plasticity: 0.02, // Probability of neighbor rewiring; updated live via UI.
  delayLength: 96, // Frames of feedback history; updated live via UI.
  delayDecay: 0.94,
  camera: { fov: Math.PI / 4, z: 320, rotateSpeed: 0.0025 },
};

// Utility for deterministic-ish randomness per frame (simple LCG).
function seedRandom(seed) {
  let x = seed;
  return () => {
    x = (1664525 * x + 1013904223) % 4294967296;
    return x / 4294967296;
  };
}

class DelayLine {
  constructor(length, decay) {
    this.length = length;
    this.decay = decay;
    this.buffer = new Float32Array(length).fill(0);
    this.index = 0;
  }

  push(value) {
    this.buffer[this.index] = value;
    this.index = (this.index + 1) % this.length;
  }

  tap(offset = 0) {
    const idx = (this.index - 1 - offset + this.length) % this.length;
    return this.buffer[idx] * this.decay;
  }
}

class PhaseGrid {
  constructor(size, alpha, pathBProbability, plasmaFlip, parityFlip, plasticity) {
    this.size = size;
    this.alpha = alpha;
    this.pathBProbability = pathBProbability;
    this.plasmaFlip = plasmaFlip;
    this.parityFlip = parityFlip;
    this.plasticity = plasticity;
    this.count = size * size * size;

    this.plasma = new Float32Array(this.count).map(() => Math.random() * 0.5);
    this.liquid = new Float32Array(this.count).map(() => Math.random() * 0.5);
    this.solid = new Float32Array(this.count).map(() => Math.random() * 0.5);
    this.parity = new Int8Array(this.count);

    this.offsets = this.buildNeighbors(); // Structural plasticity anchor.
  }

  index(x, y, z) {
    const sx = (x + this.size) % this.size;
    const sy = (y + this.size) % this.size;
    const sz = (z + this.size) % this.size;
    return sx + sy * this.size + sz * this.size * this.size;
  }

  buildNeighbors() {
    const offsets = [];
    for (let z = 0; z < this.size; z++) {
      for (let y = 0; y < this.size; y++) {
        for (let x = 0; x < this.size; x++) {
          // 6-neighborhood with toroidal wrap.
          offsets.push([
            this.index(x + 1, y, z),
            this.index(x - 1, y, z),
            this.index(x, y + 1, z),
            this.index(x, y - 1, z),
            this.index(x, y, z + 1),
            this.index(x, y, z - 1),
          ]);
        }
      }
    }
    return offsets;
  }

  maybeRewire(random) {
    if (random() > this.plasticity) return;
    // Randomly swap one neighbor in a random node to maintain locality while permitting drift.
    const node = Math.floor(random() * this.count);
    const neighborSlot = Math.floor(random() * 6);
    const x = node % this.size;
    const y = Math.floor(node / this.size) % this.size;
    const z = Math.floor(node / (this.size * this.size));
    const offsets = [...this.offsets[node]];
    offsets[neighborSlot] = this.index(x + (random() > 0.5 ? 2 : -2), y, z); // TODO: explore axis-specific rewiring.
    this.offsets[node] = offsets;
  }

  neighborAvg(i) {
    const neighbors = this.offsets[i];
    let sum = 0;
    for (let k = 0; k < neighbors.length; k++) sum += this.plasma[neighbors[k]];
    return sum / neighbors.length;
  }

  perturb(random) {
    for (let i = 0; i < this.count; i++) {
      if (random() < this.plasmaFlip) this.plasma[i] = (this.plasma[i] + 0.5 * random()) % 1;
      if (random() < this.parityFlip) this.parity[i] = this.parity[i] ? 0 : 1;
    }
  }

  step(random, bias = 0) {
    const p = this.plasma;
    const l = this.liquid;
    const s = this.solid;
    const nextLiquid = new Float32Array(this.count);
    const nextSolid = new Float32Array(this.count);

    for (let i = 0; i < this.count; i++) {
      const avg = (p[i] + l[i] + s[i]) / 3 + bias;
      const nb = Math.abs(p[i] - this.neighborAvg(i)) + this.parity[i] * 0.12;
      const mix = random() < this.pathBProbability ? nb : avg;
      nextLiquid[i] = mix % 1;
      nextSolid[i] = (s[i] * (1 - this.alpha) + mix * this.alpha) % 1;
    }

    this.liquid = nextLiquid;
    this.solid = nextSolid;
    // TODO: Consider adding an adaptive harmonic weight to prevent runaway excitation on large grids.
  }
}

class MultiGridSwarm {
  constructor(config) {
    this.config = config;
    this.core = new PhaseGrid(
      config.gridSize,
      config.alpha,
      config.pathBProbability,
      config.plasmaFlip,
      config.parityFlip,
      config.plasticity,
    );
    this.echo = new PhaseGrid(
      config.gridSize,
      config.alpha,
      config.pathBProbability * 0.9,
      config.plasmaFlip * 0.8,
      config.parityFlip,
      config.plasticity,
    );
    this.delay = new DelayLine(config.delayLength, config.delayDecay);
    this.frame = 0;
  }

  tick(time) {
    const random = seedRandom(time + this.frame * 9973);
    this.core.perturb(random);
    this.echo.perturb(random);

    this.core.maybeRewire(random);
    this.echo.maybeRewire(random);

    const energy = this.sampleEnergy();
    this.delay.push(energy);
    const delayedBias = this.delay.tap(8) * 0.05; // Softly reintroduce past energy.

    // Cross-talk: soft exchange of plasma means to keep grids in dialogue without overriding.
    const coreMean = this.mean(this.core.plasma);
    const echoMean = this.mean(this.echo.plasma);
    const coreBias = (echoMean - coreMean) * this.config.crossTalk + delayedBias;
    const echoBias = (coreMean - echoMean) * this.config.crossTalk * 0.8 + delayedBias * 0.5;

    this.core.step(random, coreBias);
    this.echo.step(random, echoBias);

    this.frame += 1;
    return { coherence: this.coherence(), entropy: this.entropy(), delayTap: this.delay.index };
  }

  mean(arr) {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) sum += arr[i];
    return sum / arr.length;
  }

  sampleEnergy() {
    return 0.5 * this.mean(this.core.liquid) + 0.5 * this.mean(this.echo.liquid);
  }

  coherence() {
    // Simple coherence metric: variance inverse.
    const arr = this.core.liquid;
    const mean = this.mean(arr);
    let variance = 0;
    for (let i = 0; i < arr.length; i++) {
      const d = arr[i] - mean;
      variance += d * d;
    }
    return 1 / (1 + variance / arr.length);
  }

  entropy() {
    // Crude entropy proxy using bucketed histogram for readability.
    const buckets = new Array(10).fill(0);
    const arr = this.echo.liquid;
    for (let i = 0; i < arr.length; i++) {
      const b = Math.min(9, Math.floor(arr[i] * 10));
      buckets[b] += 1;
    }
    const total = arr.length;
    let h = 0;
    for (const count of buckets) {
      if (count === 0) continue;
      const p = count / total;
      h -= p * Math.log2(p);
    }
    return h / Math.log2(10);
  }
}

class Renderer {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.config = config;
    this.angle = { x: -0.4, y: 0.6 };
    this.positions = this.buildPositions(config.gridSize);
    this.registerInput();
  }

  buildPositions(size) {
    const positions = [];
    const half = (size - 1) / 2;
    const scale = 22;
    for (let z = 0; z < size; z++) {
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          positions.push([(x - half) * scale, (y - half) * scale, (z - half) * scale]);
        }
      }
    }
    return positions;
  }

  registerInput() {
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    this.canvas.addEventListener("pointerdown", (e) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    });
    window.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      this.angle.y += dx * this.config.camera.rotateSpeed;
      this.angle.x += dy * this.config.camera.rotateSpeed;
      lastX = e.clientX;
      lastY = e.clientY;
    });
    window.addEventListener("pointerup", () => { dragging = false; });
  }

  project(point) {
    const [x0, y0, z0] = point;
    const sinY = Math.sin(this.angle.y), cosY = Math.cos(this.angle.y);
    const sinX = Math.sin(this.angle.x), cosX = Math.cos(this.angle.x);

    const x1 = x0 * cosY + z0 * sinY;
    const z1 = -x0 * sinY + z0 * cosY;
    const y1 = y0 * cosX - z1 * sinX;
    const z2 = y0 * sinX + z1 * cosX + this.config.camera.z;

    const f = 1 / Math.tan(this.config.camera.fov / 2);
    const px = (x1 * f / z2) * (this.canvas.width / 2) + this.canvas.width / 2;
    const py = (y1 * f / z2) * (this.canvas.height / 2) + this.canvas.height / 2;
    return { x: px, y: py, depth: z2 };
  }

  draw(gridA, gridB) {
    const ctx = this.ctx;
    ctx.fillStyle = "rgba(0, 2, 8, 0.9)";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const points = [];
    for (let i = 0; i < this.positions.length; i++) {
      const pos = this.positions[i];
      const proj = this.project(pos);
      if (proj.depth <= 0) continue;
      const plasma = (gridA.plasma[i] + gridB.plasma[i]) * 0.5;
      const liquid = (gridA.liquid[i] + gridB.liquid[i]) * 0.5;
      points.push({ ...proj, plasma, liquid });
    }
    points.sort((a, b) => b.depth - a.depth);

    for (const p of points) {
      const hue = (p.plasma * 360 + p.liquid * 120 + 200) % 360;
      const alpha = 0.35 + 0.6 * p.liquid;
      ctx.fillStyle = `hsla(${hue}, 85%, 65%, ${alpha})`;
      const r = this.config.pointSize + 5 * p.plasma;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

class ControlPanel {
  constructor(config, swarm, renderer) {
    this.config = config;
    this.swarm = swarm;
    this.renderer = renderer;
    this.paused = false;

    this.noise = document.getElementById("noise");
    this.couple = document.getElementById("couple");
    this.plasticity = document.getElementById("plasticity");
    this.delay = document.getElementById("delay");
    this.pauseBtn = document.getElementById("pause");
    this.labels = {
      noise: document.getElementById("noiseValue"),
      couple: document.getElementById("coupleValue"),
      plasticity: document.getElementById("plasticityValue"),
      delay: document.getElementById("delayValue"),
    };

    this.overlay = {
      coherence: document.getElementById("coherence"),
      entropy: document.getElementById("entropy"),
      delayTap: document.getElementById("delayTap"),
    };

    this.bind();
    this.syncLabels();
  }

  bind() {
    const updateNumber = (el, key, multiplier = 1) => {
      this.config[key] = parseFloat(el.value) * multiplier;
      this.syncLabels();
    };

    this.noise.addEventListener("input", () => updateNumber(this.noise, "plasmaFlip"));
    this.couple.addEventListener("input", () => updateNumber(this.couple, "crossTalk"));
    this.plasticity.addEventListener("input", () => {
      updateNumber(this.plasticity, "plasticity");
      this.swarm.core.plasticity = this.config.plasticity;
      this.swarm.echo.plasticity = this.config.plasticity;
    });
    this.delay.addEventListener("input", () => {
      this.config.delayLength = parseInt(this.delay.value, 10);
      this.swarm.delay = new DelayLine(this.config.delayLength, this.config.delayDecay);
      this.syncLabels();
    });

    this.pauseBtn.addEventListener("click", () => this.togglePause());
    window.addEventListener("keydown", (e) => {
      if (e.code === "Space") { this.togglePause(); e.preventDefault(); }
    });
  }

  togglePause() {
    this.paused = !this.paused;
    this.pauseBtn.textContent = this.paused ? "Resume (Space)" : "Pause (Space)";
  }

  syncLabels() {
    this.labels.noise.textContent = this.config.plasmaFlip.toFixed(4);
    this.labels.couple.textContent = this.config.crossTalk.toFixed(3);
    this.labels.plasticity.textContent = this.config.plasticity.toFixed(3);
    this.labels.delay.textContent = `${this.config.delayLength}`;
  }

  updateOverlay(metrics) {
    this.overlay.coherence.textContent = metrics.coherence.toFixed(2);
    this.overlay.entropy.textContent = metrics.entropy.toFixed(2);
    this.overlay.delayTap.textContent = metrics.delayTap;
  }
}

function main() {
  const canvas = document.getElementById("view");
  const swarm = new MultiGridSwarm({ ...SIM_CONFIG });
  const renderer = new Renderer(canvas, SIM_CONFIG);
  const ui = new ControlPanel(SIM_CONFIG, swarm, renderer);

  let lastTime = performance.now();
  function loop() {
    const now = performance.now();
    const dt = now - lastTime;
    lastTime = now;
    if (!ui.paused) {
      const metrics = swarm.tick(now);
      ui.updateOverlay(metrics);
      renderer.draw(swarm.core, swarm.echo);
    }
    // TODO: throttle dt for low-end devices; allow step-by-step debugging mode.
    requestAnimationFrame(loop);
  }
  loop();
}

window.addEventListener("DOMContentLoaded", main);
