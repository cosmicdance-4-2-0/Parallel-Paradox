import { Simulation, DEFAULT_CONFIG } from './simulation.js';

// PhaseCube Delta D7X2LQ8 UI wiring.
const canvas = document.getElementById('phasecube');
const sim = new Simulation(canvas, DEFAULT_CONFIG);

const metricsEl = document.getElementById('metrics');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const pulseBtn = document.getElementById('pulse-btn');
const autopulseToggle = document.getElementById('autopulse');
const showMeshToggle = document.getElementById('show-mesh');
const pulsePeriod = document.getElementById('pulse-period');
const noiseInput = document.getElementById('noise');
const forgivenessInput = document.getElementById('forgiveness');

const lensInputs = {
  human: document.getElementById('lens-human'),
  predictive: document.getElementById('lens-predictive'),
  systemic: document.getElementById('lens-systemic'),
  harmonic: document.getElementById('lens-harmonic'),
};

function updateLensWeights() {
  const weights = {
    human: parseFloat(lensInputs.human.value),
    predictive: parseFloat(lensInputs.predictive.value),
    systemic: parseFloat(lensInputs.systemic.value),
    harmonic: parseFloat(lensInputs.harmonic.value),
  };
  sim.setLensWeights(weights);
}

function updateMetrics() {
  const m = sim.metrics;
  const lens = m.lens || sim.lensWeights;
  metricsEl.innerHTML = `
    fps: ${m.fps.toFixed(1)}<br>
    variance: ${m.variance.toFixed(4)}<br>
    entropy: ${m.entropy.toFixed(3)}<br>
    bias: ${m.bias.toFixed(4)}<br>
    lens: ${(lens.human * 100).toFixed(0)} / ${(lens.predictive * 100).toFixed(0)} / ${(lens.systemic * 100).toFixed(0)} / ${(lens.harmonic * 100).toFixed(0)}
  `;
}

pauseBtn.onclick = () => {
  sim.paused = !sim.paused;
  pauseBtn.textContent = sim.paused ? 'Resume' : 'Pause';
};

resetBtn.onclick = () => sim.reset();
pulseBtn.onclick = () => sim.pulse();
autopulseToggle.onchange = () => sim.toggleAutopulse(autopulseToggle.checked);
showMeshToggle.onchange = () => sim.toggleMesh(showMeshToggle.checked);
pulsePeriod.oninput = () => sim.setAutopulsePeriod(parseFloat(pulsePeriod.value));
noiseInput.oninput = () => sim.setNoise(parseFloat(noiseInput.value));
forgivenessInput.oninput = () => sim.setForgiveness(parseFloat(forgivenessInput.value));

for (const key of Object.keys(lensInputs)) lensInputs[key].oninput = updateLensWeights;

// Keep the simulation running; metrics refresh separately for readability.
updateLensWeights();
updateMetrics();
sim.update();
setInterval(updateMetrics, 150);

// TODO: Add pointer-driven rotation and audio bias ingestion (for intuitive influence control).
