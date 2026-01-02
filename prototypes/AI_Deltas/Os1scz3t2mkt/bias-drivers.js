// DeltaID: Os1scz3t2mkt
// Pluggable bias drivers plus a mixer to blend them at runtime.

import { clamp01, index, sampleRing } from './utils.js';
import { biasConfig, biasSourceWeights } from './config.js';

class BaseBiasDriver {
    constructor(size) {
        this.size = size;
        this.len = size * size * size;
        this.active = true;
    }

    step(_field, _weight) {
        // No-op placeholder for subclasses.
    }
}

export class ProceduralBiasDriver extends BaseBiasDriver {
    constructor(size) {
        super(size);
        this.procPhase = 0;
    }

    step(field, weight = 1) {
        if (!this.active || weight <= 0) return;
        const n = this.size;
        const ring = sampleRing(0.05, 0.65);
        let idx = 0;
        for (let z = 0; z < n; z++) {
            const depth = Math.abs(Math.sin((this.procPhase + z * 0.15)));
            for (let y = 0; y < n; y++) {
                for (let x = 0; x < n; x++, idx++) {
                    const offset = Math.sin(this.procPhase + (x + y + z) * 0.06);
                    const strength = clamp01(ring * 0.6 + offset * 0.15 + depth * 0.1);
                    field[idx] += strength * biasConfig.fallbackGain * weight;
                }
            }
        }
        this.procPhase += 0.05;
    }
}

export class MicBiasDriver extends BaseBiasDriver {
    constructor(size) {
        super(size);
        this.audioCtx = null;
        this.analyser = null;
        this.freqData = null;
        this.micEnabled = false;
    }

    async enable() {
        if (!biasConfig.enabled || !biasConfig.micGain) return false;
        if (this.micEnabled) return true;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const source = this.audioCtx.createMediaStreamSource(stream);
            this.analyser = this.audioCtx.createAnalyser();
            this.analyser.fftSize = 256;
            this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
            source.connect(this.analyser);
            this.micEnabled = true;
            this.active = true;
            return true;
        } catch (err) {
            console.warn('Mic request failed; falling back to procedural bias', err);
            this.micEnabled = false;
            this.active = false; // Keep driver loaded but inactive.
            return false;
        }
    }

    step(field, weight = 1) {
        if (!this.active || !this.micEnabled || weight <= 0) return;
        this.analyser.getByteFrequencyData(this.freqData);
        const n = this.size;
        for (let z = 0; z < n; z++) {
            const bass = this.freqData[2] / 255;
            const depthBias = clamp01((bass + z / n) * biasConfig.micGain);
            for (let y = 0; y < n; y++) {
                const lat = Math.abs(y - n / 2) / (n / 2 + 1);
                for (let x = 0; x < n; x++) {
                    const pan = Math.abs(x - n / 2) / (n / 2 + 1);
                    const treble = this.freqData[this.freqData.length - 4] / 255;
                    const strength = depthBias * (0.7 + 0.3 * treble) * (1 - 0.35 * pan) * (1 - 0.2 * lat);
                    field[index(x, y, z, n)] += strength * 0.6 * weight;
                }
            }
        }
    }
}

export class BiasMixer {
    constructor(size) {
        this.size = size;
        this.field = new Float32Array(size * size * size);
        this.micDriver = new MicBiasDriver(size);
        this.proceduralDriver = new ProceduralBiasDriver(size);
        this.weights = { ...biasSourceWeights };
    }

    async enableMic() {
        return this.micDriver.enable();
    }

    setWeight(name, value) {
        this.weights[name] = value;
    }

    step() {
        this.field.fill(0);
        // Order matters only for readability; both drivers accumulate into the same buffer.
        this.proceduralDriver.step(this.field, this.weights.procedural);
        this.micDriver.step(this.field, this.weights.mic);
        return this.field;
    }
}

// TODO: Add a generic driver registry so third-party drivers (text, MIDI, sensors) can self-register.
