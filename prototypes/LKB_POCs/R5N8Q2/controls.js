// DeltaID: R5N8Q2
// UI bindings and live controls.

import { controlsConfig, biasConfig, phaseConfig, traceConfig } from './config.js';

export class Controls {
    constructor(startCb, pauseCb, saveCb, micCb, biasAdjustCb, harmonicAdjustCb, traceAdjustCb) {
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.saveBtn = document.getElementById('save-btn');
        this.micBtn = document.getElementById('mic-btn');
        this.biasSlider = document.getElementById('bias-slider');
        this.harmonicSlider = document.getElementById('harmonic-slider');
        this.traceSlider = document.getElementById('trace-slider');
        this.deltaLabel = document.getElementById('delta-id');

        this.deltaLabel.textContent = controlsConfig.deltaId;

        this.startBtn.addEventListener('click', startCb);
        this.pauseBtn.addEventListener('click', pauseCb);
        this.saveBtn.addEventListener('click', saveCb);
        this.micBtn.addEventListener('click', micCb);

        this.biasSlider.value = biasConfig.gain;
        this.harmonicSlider.value = phaseConfig.harmonicWeight;
        this.traceSlider.value = traceConfig.traceBlend;

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

        window.addEventListener('keydown', (e) => {
            if (e.key === controlsConfig.saveKey) saveCb();
            if (e.key === controlsConfig.pauseKey) pauseCb();
        });
    }
}

// TODO: Add per-parameter reset buttons and a compact stats readout (fps, mean plasma, bias energy).
