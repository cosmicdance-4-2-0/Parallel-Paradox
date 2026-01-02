// DeltaID: Os1scz3t2mkt
// Plasma/liquid/solid lattice with harmonic damping, forgiveness, and short-lived trace memory.

import { clamp01, wrap01, index, neighbors, createPositions } from './utils.js';

export class PhaseGrid {
    constructor(size, phaseCfg, traceCfg, scale) {
        this.size = size;
        this.len = size * size * size;
        this.phaseCfg = phaseCfg;
        this.traceCfg = traceCfg;

        this.plasma = new Float32Array(this.len);
        this.liquid = new Float32Array(this.len);
        this.solid = new Float32Array(this.len);
        this.trace = new Float32Array(this.len);
        this.parity = new Int8Array(this.len);
        this.biasField = new Float32Array(this.len);
        this.biasScratch = new Float32Array(this.len);

        this.positions = createPositions(size, scale);
        this.#seed();
    }

    #seed() {
        const { bufferInit } = this.traceCfg;
        for (let i = 0; i < this.len; i++) {
            const base = Math.random() * 0.45 + 0.05;
            this.plasma[i] = base;
            this.liquid[i] = base * 0.8;
            this.solid[i] = base * 0.6;
            this.trace[i] = bufferInit;
            this.parity[i] = Math.random() > 0.5 ? 1 : -1;
        }
    }

    perturb() {
        const { flipP, parityP } = this.phaseCfg;
        for (let i = 0; i < this.len; i++) {
            if (Math.random() < flipP) {
                this.plasma[i] = wrap01(this.plasma[i] + (Math.random() - 0.5) * 0.35);
            }
            if (Math.random() < parityP) {
                this.parity[i] *= -1;
            }
        }
    }

    injectBias(sourceField) {
        // Shallow copy keeps bias owned by the grid for later diffusion.
        this.biasField.set(sourceField);
    }

    diffuseBias(fieldDecay, diffusion) {
        const n = this.size;
        const src = this.biasField;
        const dst = this.biasScratch;
        let i = 0;
        for (let z = 0; z < n; z++) {
            for (let y = 0; y < n; y++) {
                for (let x = 0; x < n; x++, i++) {
                    const [nxm, nxp, nym, nyp, nzm, nzp] = neighbors(x, y, z, n);
                    const avg = (
                        src[index(nxm, y, z, n)] + src[index(nxp, y, z, n)] +
                        src[index(x, nym, z, n)] + src[index(x, nyp, z, n)] +
                        src[index(x, y, nzm, n)] + src[index(x, y, nzp, n)]
                    ) / 6;
                    dst[i] = src[i] * fieldDecay + avg * diffusion;
                }
            }
        }
        this.biasField.set(dst);
    }

    neighborAvg(x, y, z, arr) {
        const n = this.size;
        const [xm, xp, ym, yp, zm, zp] = neighbors(x, y, z, n);
        return (
            arr[index(xm, y, z, n)] + arr[index(xp, y, z, n)] +
            arr[index(x, ym, z, n)] + arr[index(x, yp, z, n)] +
            arr[index(x, y, zm, n)] + arr[index(x, y, zp, n)]
        ) / 6;
    }

    step(biasGain = 1) {
        const {
            alpha,
            pathBProbability,
            plasmaDecay,
            parityOffset,
            harmonicWeight,
            forgivenessGain,
            noise
        } = this.phaseCfg;
        const { traceBlend, traceDecay, bufferInit } = this.traceCfg;

        const n = this.size;
        let i = 0;

        for (let z = 0; z < n; z++) {
            for (let y = 0; y < n; y++) {
                for (let x = 0; x < n; x++, i++) {
                    const p = this.plasma[i];
                    const l = this.liquid[i];
                    const s = this.solid[i];
                    const nb = this.neighborAvg(x, y, z, this.plasma);
                    const base = (p + l + s + nb) * 0.25;
                    const divergence = Math.abs(p - nb) + this.parity[i] * parityOffset;
                    const branch = Math.random() < pathBProbability ? divergence : base;
                    const harmonic = base * (1 - harmonicWeight) + branch * harmonicWeight;
                    const forgiveness = 1 - forgivenessGain * Math.abs(divergence - base);
                    const bias = this.biasField[i] * biasGain;
                    const traceTerm = this.trace[i] * traceBlend;

                    const mix = clamp01(harmonic * forgiveness + bias);
                    this.liquid[i] = mix;
                    this.solid[i] = wrap01(s * (1 - alpha) + (mix + traceTerm) * alpha);
                    this.plasma[i] = clamp01(
                        p * (1 - plasmaDecay) + mix * plasmaDecay + (Math.random() - 0.5) * noise
                    );
                    this.trace[i] = clamp01(this.trace[i] * traceDecay + mix * traceBlend + bufferInit * 0.5);
                }
            }
        }
    }

    positionsView() {
        return this.positions;
    }
}

// TODO: Add multi-grid coupling hooks (shared bias or shared trace) to explore Lyriel consensus behaviors.
