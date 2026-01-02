// DeltaID: NCECI6
// UI wiring, live sliders, and keyboard shortcuts.

import { DELTA_ID, controlsConfig, phaseConfig, biasConfig, memoryConfig, lensProfiles } from './config.js';

export class Controls {
    constructor(onStart, onPause, onSave, onMic, onProfile, onHarmonic, onBias, onTrace) {
        this.onStart = onStart;
        this.onPause = onPause;
        this.onSave = onSave;
        this.onMic = onMic;
        this.onProfile = onProfile;
        this.onHarmonic = onHarmonic;
        this.onBias = onBias;
        this.onTrace = onTrace;

        this.profileSelect = document.getElementById('profile');
        this.harmonic = document.getElementById('harmonic');
        this.bias = document.getElementById('bias');
        this.trace = document.getElementById('trace');
        this.status = document.getElementById('status');

        this.#bindButtons();
        this.#initProfiles();
        this.#initSliders();
    }

    #bindButtons() {
        document.getElementById('start').addEventListener('click', this.onStart);
        document.getElementById('pause').addEventListener('click', this.onPause);
        document.getElementById('save').addEventListener('click', this.onSave);
        document.getElementById('mic').addEventListener('click', this.onMic);

        window.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === controlsConfig.saveKey) this.onSave();
            if (e.key === controlsConfig.pauseKey) this.onPause();
        });
    }

    #initProfiles() {
        Object.keys(lensProfiles).forEach((name) => {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            this.profileSelect.appendChild(opt);
        });
        this.profileSelect.value = 'baseline';
        this.profileSelect.addEventListener('change', (e) => this.onProfile(e.target.value));
    }

    #initSliders() {
        this.harmonic.value = phaseConfig.harmonicWeight;
        this.bias.value = biasConfig.gain;
        this.trace.value = memoryConfig.traceBlend;

        this.harmonic.addEventListener('input', (e) => this.onHarmonic(parseFloat(e.target.value)));
        this.bias.addEventListener('input', (e) => this.onBias(parseFloat(e.target.value)));
        this.trace.addEventListener('input', (e) => this.onTrace(parseFloat(e.target.value)));
    }

    setStatus(text) {
        this.status.textContent = `DeltaID: ${DELTA_ID} · ${text}`;
    }
}

// TODO: Add per-control tooltips describing the safety implications of each slider.
