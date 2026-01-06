// DeltaID: Os1scz3t2mkt
// UI bindings and live controls.

import { controlsConfig, biasConfig, phaseConfig, traceConfig, memoryConfig, biasSourceWeights } from './config.js';

export class Controls {
    constructor(startCb, pauseCb, saveCb, micCb, biasAdjustCb, harmonicAdjustCb, traceAdjustCb, memoryAdjustCb, micMixAdjustCb) {
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.saveBtn = document.getElementById('save-btn');
        this.micBtn = document.getElementById('mic-btn');
        this.biasSlider = document.getElementById('bias-slider');
        this.harmonicSlider = document.getElementById('harmonic-slider');
        this.traceSlider = document.getElementById('trace-slider');
        this.memorySlider = document.getElementById('memory-slider');
        this.micMixSlider = document.getElementById('mic-mix-slider');
        this.deltaLabel = document.getElementById('delta-id');
        this.statsLabel = {
            fps: document.getElementById('fps'),
            energy: document.getElementById('energy'),
            biasEnergy: document.getElementById('bias-energy'),
            memoryEnergy: document.getElementById('memory-energy')
        };

        this.deltaLabel.textContent = controlsConfig.deltaId;

        this.startBtn.addEventListener('click', startCb);
        this.pauseBtn.addEventListener('click', pauseCb);
        this.saveBtn.addEventListener('click', saveCb);
        this.micBtn.addEventListener('click', micCb);

        this.biasSlider.value = biasConfig.gain;
        this.harmonicSlider.value = phaseConfig.harmonicWeight;
        this.traceSlider.value = traceConfig.traceBlend;
        this.memorySlider.value = memoryConfig.echoStrength;
        this.micMixSlider.value = biasSourceWeights.mic;

        this.biasSlider.addEventListener('input', (e) => {
            const v = Number(e.target.value);
            biasAdjustCb(v);
        });
        this.harmonicSlider.addEventListener('input', (e) => {
            const v = Number(e.target.value);
            harmonicAdjustCb(v);
        });
        this.traceSlider.addEventListener('input', (e) => {
            const v = Number(e.target.value);
            traceAdjustCb(v);
        });
        this.memorySlider.addEventListener('input', (e) => {
            const v = Number(e.target.value);
            memoryAdjustCb(v);
        });
        this.micMixSlider.addEventListener('input', (e) => {
            const v = Number(e.target.value);
            micMixAdjustCb(v);
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === controlsConfig.saveKey) saveCb();
            if (e.key === controlsConfig.pauseKey) pauseCb();
        });
    }

    updateStats({ fps, energy, biasEnergy, memoryEnergy }) {
        if (this.statsLabel.fps) this.statsLabel.fps.textContent = `${fps.toFixed(1)} fps`;
        if (this.statsLabel.energy) this.statsLabel.energy.textContent = `Energy: ${energy.toFixed(3)}`;
        if (this.statsLabel.biasEnergy) this.statsLabel.biasEnergy.textContent = `Bias: ${biasEnergy.toFixed(3)}`;
        if (this.statsLabel.memoryEnergy) this.statsLabel.memoryEnergy.textContent = `Memory: ${memoryEnergy.toFixed(3)}`;
    }
}

// TODO: Add per-parameter reset buttons and a compact stats readout (fps, mean plasma, bias energy).
