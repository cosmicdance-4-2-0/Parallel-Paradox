// DeltaID: Os1scz3t2mkt
// Small math helpers to keep hot paths legible.

export const clamp01 = (v) => Math.min(1, Math.max(0, v));
export const wrap01 = (v) => ((v % 1) + 1) % 1;
export const lerp = (a, b, t) => a + (b - a) * t;

export function index(x, y, z, n) {
    return x + y * n + z * n * n;
}

export function neighbors(x, y, z, n) {
    // Toroidal wrap to keep edges equal to the center.
    const xm = (x === 0 ? n - 1 : x - 1);
    const xp = (x === n - 1 ? 0 : x + 1);
    const ym = (y === 0 ? n - 1 : y - 1);
    const yp = (y === n - 1 ? 0 : y + 1);
    const zm = (z === 0 ? n - 1 : z - 1);
    const zp = (z === n - 1 ? 0 : z + 1);
    return [xm, xp, ym, yp, zm, zp];
}

export function createPositions(n, scale) {
    const len = n * n * n;
    const positions = new Float32Array(len * 3);
    const offset = (n - 1) / 2;
    let i = 0;
    for (let z = 0; z < n; z++) {
        for (let y = 0; y < n; y++) {
            for (let x = 0; x < n; x++) {
                const xi = (x - offset) * scale;
                const yi = (y - offset) * scale;
                const zi = (z - offset) * scale;
                positions[i++] = xi;
                positions[i++] = yi;
                positions[i++] = zi;
            }
        }
    }
    return positions;
}

export function sampleRing(min, max) {
    // Simple helper for procedural bias oscillation.
    const t = performance.now() * 0.001;
    return lerp(min, max, (Math.sin(t) + 1) / 2);
}

export function accumulateField(target, source, weight = 1) {
    // Adds a weighted source field into the target in-place to avoid allocations.
    const len = target.length;
    for (let i = 0; i < len; i++) {
        target[i] += source[i] * weight;
    }
}

export function decayField(field, decay) {
    const len = field.length;
    for (let i = 0; i < len; i++) {
        field[i] *= decay;
    }
}

export function averageValue(field) {
    let sum = 0;
    const len = field.length;
    for (let i = 0; i < len; i++) sum += field[i];
    return sum / len;
}

// TODO: Extract these helpers into a shared utility package if future POCs share code.
