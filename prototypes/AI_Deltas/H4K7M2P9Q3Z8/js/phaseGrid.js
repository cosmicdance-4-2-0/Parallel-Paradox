import { clamp } from './utils.js';

export class PhaseGrid {
  constructor(size, swarmConfig, memoryConfig) {
    this.size = size;
    this.length = size ** 3;
    this.swarm = swarmConfig;
    this.memoryConfig = memoryConfig;

    this.plasma = new Float32Array(this.length);
    this.liquid = new Float32Array(this.length);
    this.solid = new Float32Array(this.length);
    this.parity = new Uint8Array(this.length);

    this.memoryDepth = Math.max(1, memoryConfig.depth | 0);
    this.memoryBuffers = Array.from({ length: this.memoryDepth }, () => new Float32Array(this.length));
    this.memoryAccumulator = new Float32Array(this.length);
    this.memoryTrace = new Float32Array(this.length);
    this.memoryIndex = 0;
    this.energy = 0;

    this.seed();
  }

  seed() {
    for (let i = 0; i < this.length; i++) {
      this.plasma[i] = Math.random() * 0.2 - 0.1;
      this.liquid[i] = Math.random() * 0.2 - 0.1;
      this.solid[i] = 0;
      this.parity[i] = Math.random() > 0.5 ? 1 : 0;
    }
    // Prime the memory with the starting solid state.
    this.pushMemory(this.solid);
  }

  step({ inputField, shadow, coupling, memoryWeight }) {
    const { flipProbability, parityProbability, pathBWeight, alpha, forgiveness, noise } = this.swarm;
    const shadowWeight = coupling.shadowWeight ?? 0;
    const recallWeight = coupling.memoryWeight ?? 0;
    const traceWeight = this.memoryConfig.traceWeight * (memoryWeight ?? 1);

    const nextPlasma = new Float32Array(this.length);
    const nextLiquid = new Float32Array(this.length);
    const nextSolid = new Float32Array(this.length);

    let totalEnergy = 0;

    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        for (let z = 0; z < this.size; z++) {
          const idx = this.index(x, y, z);
          const plasma = this.plasma[idx];
          const liquid = this.liquid[idx];
          const solid = this.solid[idx];
          const parity = this.parity[idx] ? 1 : -1;

          const neighbor = this.sampleNeighbors(x, y, z);
          const pathA = (neighbor.avg - plasma) * 0.35;
          const pathB = neighbor.delta * pathBWeight;
          const shadowPull = shadow ? (shadow[idx] - plasma) * shadowWeight : 0;
          const recallPull = (this.memoryTrace[idx] - plasma) * traceWeight;

          // Audio bias still acts as influence-only.
          const bias = inputField ? inputField.values[idx] * flipProbability * 1.4 : 0;

          const jitterSign = Math.random() < parityProbability ? -parity : parity;
          const noiseKick = (Math.random() - 0.5) * noise * jitterSign;

          let newPlasma = plasma + pathA + pathB + shadowPull + recallPull + bias + noiseKick;

          const localEnergy = Math.abs(plasma) + Math.abs(liquid) + Math.abs(solid);
          const forgivenessFactor = localEnergy > 1.3 ? 1 - forgiveness * 0.4 : 1;

          newPlasma = clamp(newPlasma * forgivenessFactor, -1.2, 1.2);
          const newLiquid = (liquid + newPlasma) * 0.5 * forgivenessFactor;
          const newSolid = solid * (1 - alpha) + newLiquid * alpha;

          nextPlasma[idx] = newPlasma;
          nextLiquid[idx] = newLiquid;
          nextSolid[idx] = newSolid;
          this.parity[idx] = jitterSign === parity ? (parity === 1 ? 1 : 0) : (parity === 1 ? 0 : 1);
          totalEnergy += Math.abs(newPlasma) + Math.abs(newLiquid);
        }
      }
    }

    this.plasma = nextPlasma;
    this.liquid = nextLiquid;
    this.solid = nextSolid;
    this.pushMemory(nextSolid);
    this.energy = totalEnergy / this.length;
  }

  pushMemory(newSolid) {
    const outgoing = this.memoryBuffers[this.memoryIndex];
    const acc = this.memoryAccumulator;
    for (let i = 0; i < this.length; i++) {
      acc[i] += newSolid[i] - outgoing[i];
      this.memoryTrace[i] = acc[i] / this.memoryDepth;
    }
    outgoing.set(newSolid);
    this.memoryIndex = (this.memoryIndex + 1) % this.memoryDepth;
  }

  sampleNeighbors(x, y, z) {
    const idxXp = this.index(x + 1, y, z);
    const idxXm = this.index(x - 1, y, z);
    const idxYp = this.index(x, y + 1, z);
    const idxYm = this.index(x, y - 1, z);
    const idxZp = this.index(x, y, z + 1);
    const idxZm = this.index(x, y, z - 1);

    const plasma = this.plasma;
    const avg =
      (plasma[idxXp] + plasma[idxXm] + plasma[idxYp] + plasma[idxYm] + plasma[idxZp] + plasma[idxZm]) /
      6;
    const delta =
      (plasma[idxXp] - plasma[idxXm] + plasma[idxYp] - plasma[idxYm] + plasma[idxZp] - plasma[idxZm]) / 6;
    return { avg, delta };
  }

  index(x, y, z) {
    const sx = (x + this.size) % this.size;
    const sy = (y + this.size) % this.size;
    const sz = (z + this.size) % this.size;
    return (sx * this.size + sy) * this.size + sz;
  }
}
