export function buildControls(container, config, onChange) {
  container.innerHTML = "";
  const sliders = [
    ["Path B Weight", "pathBWeight", 0, 1, config.pathBWeight, 0.01],
    ["Forgiveness Damping", "forgivenessDamping", 0, 0.9, config.forgivenessDamping, 0.01],
    ["Forgiveness Threshold", "forgivenessThreshold", 0, 1, config.forgivenessThreshold, 0.01],
    ["Bias Decay", "biasDecay", 0.6, 0.99, config.biasDecay, 0.01],
    ["Bias Strength", "biasStrength", 0, 0.8, config.biasStrength, 0.01],
    ["Coupling Weight", "couplingWeight", 0, 0.5, config.couplingWeight, 0.01],
  ];

  for (const [label, key, min, max, value, step] of sliders) {
    const wrapper = document.createElement("div");
    wrapper.className = "control";

    const title = document.createElement("label");
    title.innerHTML = `<span>${label}</span><span id="${key}-val">${value.toFixed(2)}</span>`;

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = min;
    slider.max = max;
    slider.step = step;
    slider.value = value;
    slider.addEventListener("input", () => {
      const val = parseFloat(slider.value);
      document.getElementById(`${key}-val`).innerText = val.toFixed(2);
      onChange(key, val);
    });

    wrapper.appendChild(title);
    wrapper.appendChild(slider);
    container.appendChild(wrapper);
  }

  const buttons = document.createElement("div");
  buttons.className = "control";

  const pauseBtn = document.createElement("button");
  pauseBtn.id = "pause";
  pauseBtn.textContent = "Pause (Space)";

  const snapshotBtn = document.createElement("button");
  snapshotBtn.id = "snapshot";
  snapshotBtn.textContent = "Save Snapshot (S)";

  buttons.appendChild(pauseBtn);
  buttons.appendChild(snapshotBtn);
  container.appendChild(buttons);

  // TODO: Add toggles for structural plasticity and external audio/OSC routing when ready.
}
