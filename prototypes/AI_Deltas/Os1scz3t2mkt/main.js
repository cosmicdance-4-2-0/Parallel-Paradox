// DeltaID: Os1scz3t2mkt
// Orchestration layer tying grid, bias mixer, memory echo, render, and controls.

import {
    GRID,
    TARGET_FPS,
    SCALE,
    biasConfig,
    biasSourceWeights,
    phaseConfig,
    traceConfig,
    memoryConfig,
    statsConfig
} from './config.js';
import { PhaseGrid } from './grid.js';
import { BiasMixer } from './bias-drivers.js';
import { MemoryBuffer } from './memory.js';
import { Renderer } from './renderer.js';
import { Controls } from './controls.js';
import { createPositions, accumulateField, averageValue, lerp } from './utils.js';

const canvas = document.getElementById('view');
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const positions = createPositions(GRID, SCALE);
const grid = new PhaseGrid(GRID, phaseConfig, traceConfig, SCALE);
const biasMixer = new BiasMixer(GRID);
const memoryBuffer = new MemoryBuffer(GRID);
const renderer = new Renderer(canvas, positions);
renderer.resize();

let rotX = 0.4;
let rotY = 0.6;
let paused = true;
let last = performance.now();
let biasField = new Float32Array(grid.len);
let memoryField = new Float32Array(grid.len);
let externalField = new Float32Array(grid.len);
let stats = { fps: 0, energy: 0, bias: 0, memory: 0 };

function start() {
    if (!paused) return;
    paused = false;
    last = performance.now();
    requestAnimationFrame(loop);
}

function pause() {
    paused = !paused;
    if (!paused) {
        last = performance.now();
        requestAnimationFrame(loop);
    }
}

function save() {
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `phasecube_${Date.now()}.png`;
    link.href = url;
    link.click();
}

async function enableMic() {
    const ok = await biasMixer.enableMic();
    document.getElementById('mic-status').textContent = ok ? 'Mic: on' : 'Mic: fallback';
}

const controls = new Controls(
    start,
    pause,
    save,
    enableMic,
    (v) => { biasConfig.gain = v; },
    (v) => { phaseConfig.harmonicWeight = v; },
    (v) => { traceConfig.traceBlend = v; },
    (v) => { memoryConfig.echoStrength = v; },
    (v) => {
        biasSourceWeights.mic = v;
        biasSourceWeights.procedural = 1 - v; // Keep total contribution balanced.
        biasMixer.setWeight('mic', biasSourceWeights.mic);
        biasMixer.setWeight('procedural', biasSourceWeights.procedural);
    }
);

let dragging = false;
let lastX = 0;
let lastY = 0;
canvas.addEventListener('mousedown', (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; });
canvas.addEventListener('mouseup', () => { dragging = false; });
canvas.addEventListener('mouseleave', () => { dragging = false; });
canvas.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    rotY += dx * 0.003;
    rotX += dy * 0.003;
    lastX = e.clientX;
    lastY = e.clientY;
});

function updateStats(dt) {
    const fpsNow = 1000 / dt;
    stats.fps = lerp(stats.fps || fpsNow, fpsNow, statsConfig.smoothing);
    stats.energy = lerp(stats.energy || 0, averageValue(grid.plasma), statsConfig.smoothing);
    stats.bias = lerp(stats.bias || 0, averageValue(biasField), statsConfig.smoothing);
    stats.memory = lerp(stats.memory || 0, averageValue(memoryField), statsConfig.smoothing);
    controls.updateStats({
        fps: stats.fps,
        energy: stats.energy,
        biasEnergy: stats.bias,
        memoryEnergy: stats.memory
    });
}

function loop(now) {
    if (paused) return;
    const dt = now - last;
    if (dt < 1000 / TARGET_FPS) {
        requestAnimationFrame(loop);
        return;
    }
    last = now;

    biasField = biasMixer.step();
    memoryField = memoryBuffer.step(grid.liquid);

    externalField.set(biasField);
    accumulateField(externalField, memoryField, 1); // Memory is already scaled by echoStrength internally.

    grid.injectBias(externalField);
    grid.diffuseBias(biasConfig.fieldDecay, biasConfig.diffusion);
    grid.perturb();
    grid.step(biasConfig.gain);

    const pts = renderer.project(rotX, rotY);
    renderer.draw(pts, grid.plasma, grid.parity, grid.liquid, now * 0.001);
    updateStats(dt);
    requestAnimationFrame(loop);
}

// Start paused; user clicks start. We still render one frame to show the HUD.
const pts = renderer.project(rotX, rotY);
renderer.draw(pts, grid.plasma, grid.parity, grid.liquid, performance.now() * 0.001);

// TODO: Add an adaptive timestep to maintain stability if the browser throttles requestAnimationFrame.
