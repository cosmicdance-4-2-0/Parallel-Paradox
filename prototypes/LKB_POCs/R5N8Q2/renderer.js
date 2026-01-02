// DeltaID: R5N8Q2
// Projection and drawing pipeline.

import { rendererConfig, SCALE, POINT_SIZE, CAMERA_Z } from './config.js';
import { wrap01 } from './utils.js';

export class Renderer {
    constructor(canvas, positions) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.positions = positions;
        this.width = canvas.width;
        this.height = canvas.height;
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.ctx.scale(dpr, dpr);
    }

    project(rotX, rotY) {
        const pts = [];
        const cx = this.width / 2;
        const cy = this.height / 2;
        const fov = Math.PI / 4;
        const view = Math.tan(fov / 2) * CAMERA_Z;
        const len = this.positions.length;
        for (let i = 0; i < len; i += 3) {
            let x = this.positions[i];
            let y = this.positions[i + 1];
            let z = this.positions[i + 2];

            // Rotate around Y then X.
            const cosY = Math.cos(rotY);
            const sinY = Math.sin(rotY);
            const xz = x * cosY - z * sinY;
            const zz = x * sinY + z * cosY;
            x = xz;
            z = zz;

            const cosX = Math.cos(rotX);
            const sinX = Math.sin(rotX);
            const yz = y * cosX - z * sinX;
            const zz2 = y * sinX + z * cosX;
            y = yz;
            z = zz2;

            const depth = CAMERA_Z - z;
            if (depth <= 1) continue; // clip behind camera.
            const scale = view / depth;
            pts.push({
                x: cx + x * scale,
                y: cy + y * scale,
                z: depth,
                depthNorm: z
            });
        }
        return pts.sort((a, b) => b.z - a.z);
    }

    draw(points, plasma, parity, liquid, time) {
        const ctx = this.ctx;
        ctx.fillStyle = rendererConfig.background;
        ctx.fillRect(0, 0, this.width, this.height);

        const hueBase = time * rendererConfig.hueSpeed;
        const len = points.length;
        for (let i = 0; i < len; i++) {
            const { x, y, z, depthNorm } = points[i];
            const idx = i;
            const p = plasma[idx];
            if (p < 0.01) continue;
            const hue = wrap01(hueBase + parity[idx] * 0.12 + p * 0.4);
            const alpha = rendererConfig.minAlpha + (rendererConfig.maxAlpha - rendererConfig.minAlpha) * p;
            const depthFade = 1 - Math.min(1, Math.abs(depthNorm) / (SCALE * 5)) * rendererConfig.depthFade;
            const finalAlpha = Math.max(0, Math.min(1, alpha * depthFade));
            const color = `hsla(${hue * 360}, 75%, 60%, ${finalAlpha})`;
            const radius = POINT_SIZE + 6 * (liquid[idx] || p);
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// TODO: Add motion blur trails using an offscreen canvas to keep main draw fast.
