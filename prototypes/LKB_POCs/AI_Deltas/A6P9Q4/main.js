// PhaseCube Delta — Lens-guided Tri-Grid (DeltaID: A6P9Q4)
// Modernized POC with modular architecture, interpretability overlays, and tunable lenses.

import { DEFAULT_CONFIG, withOverrides } from './config.js';
import { DelayLine, NeighborGraph, PhaseGrid, PlasticityManager } from './lattice.js';
import { LensSuite } from './lenses.js';
import { Renderer } from './renderer.js';
import { ControlPanel } from './controls.js';

const DELTA_ID = DEFAULT_CONFIG.deltaId;

class MultiGridSwarm {
  constructor(config) {
    this.config = config;
    this.graph = new NeighborGraph(config.gridSize);
    this.plasticity = new PlasticityManager(config.plasticity, this.graph);
    this.core = new PhaseGrid('core', config.gridSize, config, this.graph);
    this.echo = new PhaseGrid('echo', config.gridSize, config, this.graph);
    this.scout = new PhaseGrid('scout', config.gridSize, config, this.graph);
    this.delay = new DelayLine(config.delay.length, config.delay.decay, config.delay.gain);
    this.frame = 0;
  }

  step(lensSuite) {
    this.frame++;
    this.plasticity.tick();

    const metrics = {
      core: this.core.metrics(),
      echo: this.echo.metrics(),
      scout: this.scout.metrics()
    };
    const divergence = Math.abs(metrics.core.energy - metrics.echo.energy) + Math.abs(metrics.scout.energy - metrics.core.energy);
    const historyBias = this.delay.push(metrics.core.energy);

    const lensControl = lensSuite.evaluate({ metrics, historyBias, divergence });
    const noise = this.config.flipProbability * lensControl.noiseScale;

    this.core.perturb(noise, this.config.parityProbability);
    this.echo.perturb(noise * 0.9, this.config.parityProbability);
    this.scout.perturb(noise * 1.1, this.config.parityProbability * 1.1);

    const cross = lensControl.crossBiases;
    const biasField = lensControl.globalBias;

    this.core.step(biasField + cross.core, {
      mixShift: lensControl.mixShift,
      memoryBlend: lensControl.memoryBlend,
      crossBias: cross.core,
      biasOffset: 0.0
    });
    this.echo.step(biasField + cross.echo, {
      mixShift: lensControl.mixShift * 0.8,
      memoryBlend: lensControl.memoryBlend,
      crossBias: cross.echo,
      biasOffset: 0.02
    });
    this.scout.step(biasField + cross.scout, {
      mixShift: lensControl.mixShift * 1.2,
      memoryBlend: lensControl.memoryBlend * 0.9,
      crossBias: cross.scout + this.config.coupling.scoutToCore,
      biasOffset: 0.04
    });

    // TODO: Thing, for reasons — allow per-grid delay lines for heterogeneous tempos.

    return { metrics, divergence, historyBias, lensLabel: lensControl.label };
  }
}

function init() {
  const canvas = document.getElementById('viewport');
  const controlsEl = document.getElementById('controls');

  let config = { ...DEFAULT_CONFIG };
  let swarm = new MultiGridSwarm(config);
  let lensSuite = new LensSuite(config.lenses, config.lensGains);
  const renderer = new Renderer(canvas, config.gridSize, config.scale, config.renderer);

  const panel = new ControlPanel(controlsEl, config, (overrides) => {
    config = withOverrides(config, overrides);
    swarm = new MultiGridSwarm(config);
    lensSuite = new LensSuite(config.lenses, config.lensGains);
  });
  // TODO: Thing, for reasons — surface panel callbacks for keyboard/OSC input.
  void panel;

  let paused = false;
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') paused = !paused;
  });

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    renderer.rotateY = nx * Math.PI * 0.8;
    renderer.rotateX = ny * Math.PI * 0.8;
  });

  function loop() {
    if (!paused) {
      const { metrics, divergence, historyBias, lensLabel } = swarm.step(lensSuite);
      renderer.draw({ core: swarm.core, echo: swarm.echo, scout: swarm.scout }, { ...metrics, divergence, historyBias }, `${DELTA_ID} ${lensLabel}`);
    }
    requestAnimationFrame(loop);
  }

  loop();
}

window.addEventListener('DOMContentLoaded', init);
