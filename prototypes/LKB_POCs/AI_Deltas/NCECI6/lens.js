// DeltaID: NCECI6
// Four-lens fusion with preset profiles.

import { clamp } from './utils.js';

export class LensFusion {
    constructor(profiles, harmonicWeight) {
        this.profiles = profiles;
        this.activeProfile = 'baseline';
        this.weights = { ...profiles[this.activeProfile] };
        this.harmonicWeight = harmonicWeight;
    }

    setProfile(name) {
        if (this.profiles[name]) {
            this.activeProfile = name;
            this.weights = { ...this.profiles[name] };
        }
    }

    setHarmonicWeight(value) {
        this.harmonicWeight = clamp(value, 0, 1);
    }

    fuse({ consensus, divergence, bias, persistence, forgiveness }) {
        const { cognitive, predictive, systemic, harmonic } = this.weights;
        const weightSum = Math.max(0.0001, cognitive + predictive + systemic);

        // Cognitive lens stabilizes around the consensus baseline.
        const stabilizer = consensus * (1 + forgiveness);
        // Predictive lens embraces divergence (Path B).
        const explorer = divergence * (1 + bias);
        // Systemic lens channels bias as a field-level influence, not a command.
        const systemBias = bias * (1 + systemic * 0.4);

        let base = (stabilizer * cognitive + explorer * predictive + systemBias * systemic) / weightSum;

        // Harmonic lens moderates the blend toward persistence to avoid runaway spikes.
        const harmonicGate = clamp(this.harmonicWeight * harmonic, 0, 1);
        const harmonicTarget = (persistence + consensus) * 0.5;
        base = base * (1 - harmonicGate) + harmonicTarget * harmonicGate;

        return base;
    }
}

// TODO: Allow user-defined lens profiles to be injected at runtime (with validation).
