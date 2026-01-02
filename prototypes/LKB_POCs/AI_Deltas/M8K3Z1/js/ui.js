import { clamp01 } from "./utils.js";

export function initUI(defaults, callbacks) {
  const sliders = {
    human: document.getElementById("human"),
    predictive: document.getElementById("predictive"),
    systemic: document.getElementById("systemic"),
    harmonic: document.getElementById("harmonic"),
    biasStrength: document.getElementById("biasStrength"),
    biasRadius: document.getElementById("biasRadius"),
    biasDecay: document.getElementById("biasDecay"),
  };

  const valueLabels = {
    human: document.getElementById("human-val"),
    predictive: document.getElementById("predictive-val"),
    systemic: document.getElementById("systemic-val"),
    harmonic: document.getElementById("harmonic-val"),
    biasStrength: document.getElementById("biasStrength-val"),
    biasRadius: document.getElementById("biasRadius-val"),
    biasDecay: document.getElementById("biasDecay-val"),
  };

  const echoToggle = document.getElementById("echoToggle");
  const pulseButton = document.getElementById("pulse");
  const resetButton = document.getElementById("reset");

  const statusEls = {
    fps: document.getElementById("fps"),
    activity: document.getElementById("activity"),
    echo: document.getElementById("echo-status"),
  };

  const syncValue = (key) => {
    const slider = sliders[key];
    const value = key.includes("biasRadius") ? slider.value : Number(slider.value).toFixed(2);
    valueLabels[key].textContent = value;
  };

  Object.entries(defaults.lensWeights).forEach(([key, value]) => {
    sliders[key].value = value;
    syncValue(key);
  });

  sliders.biasStrength.value = defaults.bias.strength;
  sliders.biasRadius.value = defaults.bias.radius;
  sliders.biasDecay.value = defaults.bias.decay;
  syncValue("biasStrength");
  syncValue("biasRadius");
  syncValue("biasDecay");

  const lensHandler = () => {
    Object.keys(defaults.lensWeights).forEach(syncValue);
    callbacks.onLensChange(getLensWeights());
  };

  const biasHandler = () => {
    ["biasStrength", "biasRadius", "biasDecay"].forEach(syncValue);
    callbacks.onBiasChange(getBiasSettings());
  };

  Object.keys(defaults.lensWeights).forEach((key) => sliders[key].addEventListener("input", lensHandler));
  ["biasStrength", "biasRadius", "biasDecay"].forEach((key) => sliders[key].addEventListener("input", biasHandler));

  echoToggle.addEventListener("change", (e) => callbacks.onEchoToggle(e.target.checked));
  pulseButton.addEventListener("click", callbacks.onPulse);
  resetButton.addEventListener("click", callbacks.onReset);

  function getLensWeights() {
    return {
      human: parseFloat(sliders.human.value),
      predictive: parseFloat(sliders.predictive.value),
      systemic: parseFloat(sliders.systemic.value),
      harmonic: parseFloat(sliders.harmonic.value),
    };
  }

  function getBiasSettings() {
    return {
      strength: clamp01(parseFloat(sliders.biasStrength.value)),
      radius: Math.max(1, parseInt(sliders.biasRadius.value, 10)),
      decay: clamp01(parseFloat(sliders.biasDecay.value)),
    };
  }

  function updateStatus({ fps, activity, echoEnabled }) {
    statusEls.fps.textContent = fps.toFixed(0);
    statusEls.activity.textContent = activity.toFixed(2);
    statusEls.echo.textContent = echoEnabled ? "on" : "off";
  }

  return {
    getLensWeights,
    getBiasSettings,
    updateStatus,
    setEcho: (enabled) => {
      echoToggle.checked = enabled;
      updateStatus({ fps: Number(statusEls.fps.textContent), activity: Number(statusEls.activity.textContent), echoEnabled: enabled });
    },
  };
}

// TODO: add preset buttons for rapid A/B testing of lens blends and bias modes.
