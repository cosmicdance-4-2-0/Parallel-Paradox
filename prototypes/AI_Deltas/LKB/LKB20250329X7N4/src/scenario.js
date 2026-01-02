import { choose } from "./utils.js";

export function buildScenario(totalSteps) {
  const anchors = [
    { step: 5, strength: 0.4, radius: 2, position: [0.2, 0.2, 0.4] },
    { step: 30, strength: 0.5, radius: 3, position: [0.8, 0.3, 0.6] },
    { step: 60, strength: 0.45, radius: 2, position: [0.5, 0.8, 0.5] },
    { step: 90, strength: 0.6, radius: 3, position: [0.3, 0.5, 0.8] },
    { step: 130, strength: 0.55, radius: 2, position: [0.7, 0.7, 0.2] }
  ];

  const jittered = [];
  anchors.forEach((anchor) => {
    jittered.push(anchor);
    const echoStep = anchor.step + 10;
    if (echoStep < totalSteps) {
      jittered.push({
        step: echoStep,
        strength: anchor.strength * 0.6,
        radius: anchor.radius,
        position: anchor.position.map((p) => clamp01(p + (Math.random() - 0.5) * 0.1))
      });
    }
  });

  for (let i = 0; i < Math.max(2, Math.floor(totalSteps / 60)); i++) {
    const step = choose([15, 45, 75, 105, 150].filter((v) => v < totalSteps));
    jittered.push({
      step,
      strength: 0.35,
      radius: 2,
      position: [Math.random(), Math.random(), Math.random()]
    });
  }

  return jittered;
}

export function pulsesForStep(step, scenario) {
  return scenario
    .filter((pulse) => pulse.step === step)
    .map((pulse) => ({
      x: pulse.position[0],
      y: pulse.position[1],
      z: pulse.position[2],
      strength: pulse.strength,
      radius: pulse.radius
    }));
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}
