// DeltaID: R5N8Q2
// Bias field ingestion: microphone when available, procedural fallback when not.

import { clamp01, sampleRing, index } from './utils.js';
import { biasConfig } from './config.js';

export class InputLayer {
    constructor(size) {
        this.size = size;
        this.len = size * size * size;
        this.field = new Float32Array(this.len);
        this.procPhase = 0;
        this.audioCtx = null;
        this.analyser = null;
        this.micEnabled = false;
        this.freqData = null;
    }

    async enableMic() {
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
            return true;
        } catch (err) {
            console.warn('Mic request failed; falling back to procedural bias', err);
            this.micEnabled = false;
            return false;
        }
    }

    #clearField() {
        this.field.fill(0);
    }

    #applyBias(x, y, z, strength) {
        const idx = index(x, y, z, this.size);
        this.field[idx] += strength;
    }

    #micBias() {
        if (!this.analyser || !this.freqData) return;
        this.analyser.getByteFrequencyData(this.freqData);
        const n = this.size;
        const bass = this.freqData[2] / 255; // Low frequencies, map to depth.
        const treble = this.freqData[this.freqData.length - 4] / 255;
        for (let z = 0; z < n; z++) {
            const depthBias = clamp01((bass + z / n) * biasConfig.micGain);
            for (let y = 0; y < n; y++) {
                const lat = Math.abs(y - n / 2) / (n / 2 + 1);
                for (let x = 0; x < n; x++) {
                    const pan = Math.abs(x - n / 2) / (n / 2 + 1);
                    const strength = depthBias * (0.7 + 0.3 * treble) * (1 - 0.35 * pan) * (1 - 0.2 * lat);
                    this.#applyBias(x, y, z, strength * 0.6);
                }
            }
        }
    }

    #proceduralBias() {
        const n = this.size;
        const ring = sampleRing(0.05, 0.65);
        for (let z = 0; z < n; z++) {
            const depth = Math.abs(Math.sin((this.procPhase + z * 0.15)));
            for (let y = 0; y < n; y++) {
                for (let x = 0; x < n; x++) {
                    const offset = Math.sin(this.procPhase + (x + y + z) * 0.06);
                    const strength = clamp01(ring * 0.6 + offset * 0.15 + depth * 0.1);
                    this.#applyBias(x, y, z, strength * biasConfig.fallbackGain);
                }
            }
        }
        this.procPhase += 0.05;
    }

    step() {
        this.#clearField();
        if (this.micEnabled) {
            this.#micBias();
        } else {
            this.#proceduralBias();
        }
        return this.field;
    }
}

// TODO: Add adaptive EQ to emphasize different spatial slices dynamically based on live frequencies.
