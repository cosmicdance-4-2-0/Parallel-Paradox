// DeltaID: NCECI6
// Audio + procedural bias driver. Fails gracefully when mic access is denied.

import { clamp } from './utils.js';

export class InputLayer {
    constructor(gridSize) {
        this.n = gridSize;
        this.len = gridSize * gridSize * gridSize;
        this.field = new Float32Array(this.len);
        this.phase = 0;

        this.ctx = null;
        this.analyser = null;
        this.freqData = null;
        this.micEnabled = false;
    }

    async enableMic() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.ctx = new AudioContext();
            const src = this.ctx.createMediaStreamSource(stream);
            this.analyser = this.ctx.createAnalyser();
            this.analyser.fftSize = 256;
            src.connect(this.analyser);
            this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
            this.micEnabled = true;
            return true;
        } catch (err) {
            console.warn('Mic unavailable, falling back to procedural bias', err);
            this.micEnabled = false;
            return false;
        }
    }

    step() {
        this.phase += 0.015;
        let energy = 0.3;
        let pan = 0;
        let depth = 0.3;

        if (this.micEnabled && this.analyser) {
            this.analyser.getByteFrequencyData(this.freqData);
            let sum = 0;
            let low = 0;
            for (let i = 0; i < this.freqData.length; i++) {
                const v = this.freqData[i] / 255;
                sum += v;
                if (i < this.freqData.length * 0.2) low += v;
            }
            const avg = sum / this.freqData.length;
            const lowAvg = low / Math.max(1, this.freqData.length * 0.2);
            energy = clamp(avg * 1.4, 0, 1);
            depth = clamp(lowAvg * 1.3, 0, 1);
            pan = clamp((avg - lowAvg) * 0.8, -1, 1);
        } else {
            // Procedural fallback keeps the system lively without external input.
            energy = 0.35 + Math.sin(this.phase * 0.8) * 0.2;
            depth = 0.3 + Math.cos(this.phase * 0.6) * 0.25;
            pan = Math.sin(this.phase * 0.4);
        }

        const mid = (this.n - 1) / 2;
        let k = 0;
        for (let z = 0; z < this.n; z++) {
            const depthFalloff = 1 - Math.abs((z - mid) / mid);
            for (let y = 0; y < this.n; y++) {
                for (let x = 0; x < this.n; x++, k++) {
                    const lateral = pan * ((x - mid) / mid) * 0.35;
                    const radial = depth * depthFalloff;
                    const wave = Math.sin((x + y + z) * 0.23 + this.phase * 4) * 0.08;
                    const bias = energy * (0.5 + radial * 0.5) + lateral + wave;
                    this.field[k] = clamp(bias, 0, 1);
                }
            }
        }

        return this.field;
    }
}

// TODO: Support additional drivers (text embeddings, sensor feeds) through a plug-in interface.
