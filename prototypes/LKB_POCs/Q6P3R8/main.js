// PhaseCube Memory-Biased Swarm Upgrade — DeltaID: Q6P3R8
// Orchestrates tri-grid dialogue, memory bias, and UI wiring.

import { createConfig, DeltaID } from "./config.js";
import { PhaseGrid } from "./phaseGrid.js";
import { DelayLine, blendBiasFields, clampField } from "./feedback.js";
import { Renderer } from "./renderer.js";
import { attachControls } from "./controls.js";

class SyntheticPulse {
  constructor(count) {
    this.count = count;
    this.positions = new Float32Array(count);
  }

  sample(time) {
    const field = new Float32Array(this.count);
    const phase = Math.sin(time * 0.001);
    for (let i = 0; i < this.count; i += 1) {
      // Offset per index keeps the bias spatially textured.
      field[i] = phase * Math.sin(i * 0.017 + phase * 2);
    }
    const level = Math.abs(phase);
    return { field, level };
  }
}

class AudioBias {
  constructor(count) {
    this.count = count;
    this.active = false;
    this.audioLevel = 0;
  }

  async start() {
    if (this.active) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      const data = new Uint8Array(analyser.frequencyBinCount);
      source.connect(analyser);
      this.active = true;
      this.sample = () => {
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i += 1) sum += data[i];
        const level = sum / (data.length * 255);
        this.audioLevel = level;
        const field = new Float32Array(this.count);
        for (let j = 0; j < this.count; j += 1) {
          field[j] = Math.sin(j * 0.013 + level * 10) * level;
        }
        return { field, level };
      };
    } catch (err) {
      console.warn("Mic capture failed; staying synthetic.", err);
      // TODO: surface this state in the overlay for clearer UX.
    }
  }

  sample() {
    return { field: null, level: 0 };
  }
}

class MultiGridSwarm {
  constructor(config) {
    this.config = config;
    this.core = new PhaseGrid(config, "core");
    this.echo = new PhaseGrid(config, "echo");
    this.memory = new PhaseGrid(config, "memory");
    this.delayLine = new DelayLine(config.delayLength, config.delayDecay);
    this.positions = this.#buildPositions(config.gridSize);
    // TODO: Allow independent configs per grid (e.g., slower memory grid).
  }

  #buildPositions(size) {
    const positions = new Float32Array(size * size * size * 3);
    const half = (size - 1) / 2;
    let idx = 0;
    for (let x = 0; x < size; x += 1) {
      for (let y = 0; y < size; y += 1) {
        for (let z = 0; z < size; z += 1) {
          positions[idx++] = x - half;
          positions[idx++] = y - half;
          positions[idx++] = z - half;
        }
      }
    }
    return positions;
  }

  step(biasField, audioLevel = 0) {
    const noiseScale = 1 + audioLevel * 0.5;
    this.core.perturb(noiseScale);
    this.echo.perturb(1);
    this.memory.perturb(0.6);

    this.core.rewire();
    this.echo.rewire();
    this.memory.rewire();

    const memoryBias = this.delayLine.pull();
    const blendedBias = blendBiasFields({
      base: biasField,
      memory: memoryBias,
      crosstalk: this.echo.liquid,
      memoryWeight: this.config.memoryWeight,
      crosstalkWeight: this.config.crosstalkWeight,
    });
    const clampedBias = clampField(blendedBias, this.config.maxBiasMagnitude);

    const coreMetrics = this.core.step(clampedBias);
    this.echo.step(clampedBias);
    this.memory.step(clampedBias);

    this.delayLine.push(Float32Array.from(this.core.liquid));

    return {
      energy: coreMetrics.energy,
      dispersion: coreMetrics.dispersion,
      biasUsed: !!clampedBias,
    };
  }
}

const config = createConfig();
const canvas = document.getElementById("phasecube");
const renderer = new Renderer(canvas, config, DeltaID);
const swarm = new MultiGridSwarm(config);
const synthetic = new SyntheticPulse(swarm.core.count);
const audioBias = new AudioBias(swarm.core.count);
let paused = false;
let lastFrame = performance.now();

attachControls(config, (next) => {
  if (next.startAudio) audioBias.start();
});

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") paused = !paused;
  if (e.code === "KeyS") saveSnapshot();
});

function saveSnapshot() {
  const link = document.createElement("a");
  link.download = `phasecube-${DeltaID}-${Date.now()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function loop(now) {
  const deltaMs = now - lastFrame;
  const minFrame = 1000 / config.fpsCap;
  if (deltaMs >= minFrame) {
    lastFrame = now;
    const { field, level } = audioBias.active
      ? audioBias.sample(now)
      : synthetic.sample(now);
    if (!paused) {
      const metrics = swarm.step(field, level);
      renderer.draw(swarm.positions, swarm.core.plasma, swarm.core.parity, {
        ...metrics,
        audioLevel: level,
      });
    }
  }
  requestAnimationFrame(loop);
}

// Kick off the dream loop.
requestAnimationFrame(loop);
