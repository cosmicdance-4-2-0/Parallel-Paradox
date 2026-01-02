// DeltaID: NCECI6
// Plasma/liquid/solid lattice with lens fusion, bias plumbing, and dual memory tracks.

import { idx, wrap, clamp } from './utils.js';

export class PhaseGrid {
    constructor(size, phaseCfg, memoryCfg) {
        this.size = size;
        this.len = size * size * size;
        this.phaseCfg = phaseCfg;
        this.memoryCfg = memoryCfg;

        this.plasma = new Float32Array(this.len);
        this.liquid = new Float32Array(this.len);
        this.solid = new Float32Array(this.len);
        this.trace = new Float32Array(this.len);
        this.imprint = new Float32Array(this.len);
        this.parity = new Int8Array(this.len);
        this.bias = new Float32Array(this.len);
        this.biasScratch = new Float32Array(this.len);

        this.#seed();
    }

    #seed() {
        const { traceBlend } = this.memoryCfg;
        for (let i = 0; i < this.len; i++) {
            const base = Math.random() * 0.45 + 0.05;
            this.plasma[i] = base;
            this.liquid[i] = base * 0.85;
            this.solid[i] = base * 0.6;
            this.trace[i] = traceBlend * 0.5;
            this.imprint[i] = 0;
            this.parity[i] = Math.random() > 0.5 ? 1 : -1;
        }
    }

    perturb() {
        const { flipP, parityP } = this.phaseCfg;
        for (let i = 0; i < this.len; i++) {
            if (Math.random() < flipP) {
                this.plasma[i] = clamp(this.plasma[i] + (Math.random() - 0.5) * 0.3, 0, 1);
            }
            if (Math.random() < parityP) {
                this.parity[i] *= -1;
            }
        }
    }

    blendBias(sourceField, gain) {
        // Merge external bias into the grid-owned field so diffusion and decay are consistent.
        for (let i = 0; i < this.len; i++) {
            this.bias[i] += sourceField[i] * gain;
        }
    }

    diffuseBias(decay, diffusion) {
        const n = this.size;
        const src = this.bias;
        const dst = this.biasScratch;
        let i = 0;
        for (let z = 0; z < n; z++) {
            for (let y = 0; y < n; y++) {
                for (let x = 0; x < n; x++, i++) {
                    const xm = wrap(x - 1, n), xp = wrap(x + 1, n);
                    const ym = wrap(y - 1, n), yp = wrap(y + 1, n);
                    const zm = wrap(z - 1, n), zp = wrap(z + 1, n);
                    const avg = (
                        src[idx(xm, y, z, n)] + src[idx(xp, y, z, n)] +
                        src[idx(x, ym, z, n)] + src[idx(x, yp, z, n)] +
                        src[idx(x, y, zm, n)] + src[idx(x, y, zp, n)]
                    ) / 6;
                    dst[i] = src[i] * decay + avg * diffusion;
                }
            }
        }
        this.bias.set(dst);
    }

    neighborAvg(x, y, z, arr) {
        const n = this.size;
        const xm = wrap(x - 1, n), xp = wrap(x + 1, n);
        const ym = wrap(y - 1, n), yp = wrap(y + 1, n);
        const zm = wrap(z - 1, n), zp = wrap(z + 1, n);
        return (
            arr[idx(xm, y, z, n)] + arr[idx(xp, y, z, n)] +
            arr[idx(x, ym, z, n)] + arr[idx(x, yp, z, n)] +
            arr[idx(x, y, zm, n)] + arr[idx(x, y, zp, n)]
        ) / 6;
    }

    step(lensFusion) {
        const {
            alpha,
            pathBProbability,
            plasmaDecay,
            parityOffset,
            harmonicWeight,
            forgivenessGain,
            noise
        } = this.phaseCfg;
        const {
            traceBlend,
            traceDecay,
            imprintBlend,
            imprintDecay
        } = this.memoryCfg;

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
                    const forgiveness = clamp(Math.exp(-forgivenessGain * Math.abs(divergence - base)), 0, 1);
                    const bias = this.bias[i];
                    const traceTerm = this.trace[i];
                    const imprintTerm = this.imprint[i];

                    const consensus = (base + traceTerm * 0.5 + imprintTerm * 0.35) / 1.85;
                    const fused = lensFusion.fuse({
                        consensus,
                        divergence: branch,
                        bias,
                        persistence: s,
                        forgiveness
                    });

                    const damped = p + (fused - p) * plasmaDecay * forgiveness;
                    const noiseKick = (Math.random() - 0.5) * noise;

                    this.liquid[i] = clamp(fused, 0, 1);
                    this.solid[i] = clamp(s * (1 - alpha) + (fused + traceTerm * traceBlend) * alpha, 0, 1);
                    this.plasma[i] = clamp(damped + noiseKick, 0, 1);
                    this.trace[i] = clamp(traceTerm * traceDecay + fused * traceBlend, 0, 1);
                    this.imprint[i] = clamp(imprintTerm * imprintDecay + bias * imprintBlend, 0, 1);
                }
            }
        }
    }
}

// TODO: Add optional GPU/WebGL path for large GRID sizes while preserving this CPU baseline.
