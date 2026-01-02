// DeltaID: Os1scz3t2mkt
// Lightweight delayed echo buffer to inject gentle recall into the bias field.

import { decayField, accumulateField } from './utils.js';
import { memoryConfig } from './config.js';

export class MemoryBuffer {
    constructor(size) {
        this.size = size;
        this.len = size * size * size;
        this.echo = new Float32Array(this.len);
        this.queue = [];
        this.frame = 0;
    }

    step(liquidField) {
        if (!memoryConfig.enabled) {
            this.echo.fill(0);
            return this.echo;
        }

        this.frame++;
        decayField(this.echo, memoryConfig.decay);

        // Release delayed snapshots into the echo field.
        while (this.queue.length && this.queue[0].releaseAt <= this.frame) {
            const { snapshot } = this.queue.shift();
            accumulateField(this.echo, snapshot, memoryConfig.echoStrength);
        }

        // Capture the current liquid field at intervals with a delay.
        if (this.frame % memoryConfig.captureInterval === 0) {
            const snapshot = new Float32Array(liquidField); // Copy to decouple from live array.
            const releaseAt = this.frame + memoryConfig.delaySteps;
            if (this.queue.length >= memoryConfig.maxSnapshots) {
                this.queue.shift(); // Drop oldest to prevent unbounded growth.
            }
            this.queue.push({ snapshot, releaseAt });
        }

        return this.echo;
    }
}

// TODO: Add a secondary memory mode that samples only high-energy cells for a sparse recall vector.
