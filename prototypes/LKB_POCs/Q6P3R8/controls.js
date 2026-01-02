// Controls wiring — DeltaID: Q6P3R8
// Keeps UI minimal while exposing tunables for live iteration.

export function attachControls(config, onChange) {
  const bindings = [
    ["noise", config.flipProbability, 0.001, 0.05, 0.001, (v) => (config.flipProbability = v)],
    ["crosstalk", config.crosstalkWeight, 0, 0.6, 0.01, (v) => (config.crosstalkWeight = v)],
    ["memory", config.memoryWeight, 0, 0.8, 0.01, (v) => (config.memoryWeight = v)],
    ["plasticity", config.plasticityProbability, 0, 0.01, 0.0005, (v) => (config.plasticityProbability = v)],
  ];

  const container = document.getElementById("control-body");
  bindings.forEach(([name, initial, min, max, step, setter]) => {
    const label = document.createElement("label");
    label.textContent = `${name}: ${initial.toFixed(3)}`;
    label.style.display = "block";

    const input = document.createElement("input");
    input.type = "range";
    input.min = min;
    input.max = max;
    input.step = step;
    input.value = initial;
    input.addEventListener("input", (e) => {
      const v = parseFloat(e.target.value);
      setter(v);
      label.textContent = `${name}: ${v.toFixed(3)}`;
      onChange(config);
    });

    label.appendChild(input);
    container.appendChild(label);
  });

  const audioButton = document.getElementById("audio-btn");
  audioButton.addEventListener("click", () => onChange({ ...config, startAudio: true }));
}
