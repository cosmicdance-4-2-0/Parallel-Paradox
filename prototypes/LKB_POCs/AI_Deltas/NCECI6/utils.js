// DeltaID: NCECI6
// Small utilities to keep the core loops readable.

export function wrap(v, n) {
    // Wrap indices for toroidal addressing.
    return (v % n + n) % n;
}

export function idx(x, y, z, n) {
    return x + y * n + z * n * n;
}

export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function createPositions(grid, scale) {
    const positions = new Float32Array(grid * grid * grid * 3);
    const half = (grid - 1) / 2;
    let i = 0;
    for (let z = 0; z < grid; z++) {
        for (let y = 0; y < grid; y++) {
            for (let x = 0; x < grid; x++) {
                positions[i++] = (x - half) * scale;
                positions[i++] = (y - half) * scale;
                positions[i++] = (z - half) * scale;
            }
        }
    }
    return positions;
}

// TODO: Add a lightweight PRNG seed option so procedural bias can be reproduced when desired.
