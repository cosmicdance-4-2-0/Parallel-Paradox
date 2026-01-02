// DeltaID: NCECI6
// Projection and drawing pipeline.

import { POINT_SIZE, CAMERA_Z, rendererConfig } from './config.js';

export class Renderer {
    constructor(canvas, positions) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.positions = positions;
        this.cfg = rendererConfig;
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    project(rotX, rotY) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const fov = Math.PI / 4;
        const viewDistance = CAMERA_Z;
        const sinX = Math.sin(rotX), cosX = Math.cos(rotX);
        const sinY = Math.sin(rotY), cosY = Math.cos(rotY);
        const points = [];

        for (let i = 0; i < this.positions.length; i += 3) {
            let x = this.positions[i];
            let y = this.positions[i + 1];
            let z = this.positions[i + 2];

            // Rotate around Y then X.
            const x1 = x * cosY + z * sinY;
            const z1 = -x * sinY + z * cosY;
            const y1 = y * cosX - z1 * sinX;
            const z2 = y * sinX + z1 * cosX + viewDistance;

            const scale = (w / 2) / Math.tan(fov / 2);
            const px = (x1 * scale) / z2 + w / 2;
            const py = (y1 * scale) / z2 + h / 2;

            if (px < 0 || px > w || py < 0 || py > h) continue;
            points.push({ x: px, y: py, z: z2, idx: i / 3 });
        }

        // Painter's algorithm: draw back to front.
        return points.sort((a, b) => b.z - a.z);
    }

    draw(points, plasma, parity, liquid, time) {
        const ctx = this.ctx;
        const { background, trailOpacity, hueSpeed, minAlpha, maxAlpha, depthFade } = this.cfg;

        ctx.fillStyle = background;
        ctx.globalAlpha = trailOpacity;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.globalAlpha = 1;

        for (const p of points) {
            const i = p.idx;
            const energy = plasma[i];
            const activity = liquid[i];
            if (energy < 0.015 && activity < 0.015) continue;

            const hue = (time * hueSpeed + energy * 0.8 + parity[i] * 0.08) % 1;
            const r = Math.floor(Math.sin(hue * Math.PI * 2) * 127 + 128);
            const g = Math.floor(Math.sin(hue * Math.PI * 2 + 2) * 127 + 128);
            const b = Math.floor(Math.sin(hue * Math.PI * 2 + 4) * 127 + 128);

            const depthAlpha = 1 - Math.min(1, (p.z / (CAMERA_Z * 1.6))) * depthFade;
            const alpha = Math.max(minAlpha, Math.min(maxAlpha, activity * 0.8 + energy * 0.35)) * depthAlpha;
            const radius = POINT_SIZE + energy * 5 + activity * 3;

            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// TODO: Add a thin mode that renders fewer particles for mobile/low-power contexts.
