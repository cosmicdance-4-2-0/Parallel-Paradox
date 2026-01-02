export class UI {
  constructor({ lens, inputBridge, config, onReset }) {
    this.lens = lens;
    this.input = inputBridge;
    this.config = config;
    this.onReset = onReset;
    this.wires();
  }

  wires() {
    const modeSelect = document.querySelector("#mode");
    const strengthSlider = document.querySelector("#strength");
    const lensSliders = document.querySelectorAll("[data-lens]");
    const resetBtn = document.querySelector("#reset");

    modeSelect.addEventListener("change", () => {
      this.input.setMode(modeSelect.value);
    });

    strengthSlider.addEventListener("input", () => {
      const v = Number(strengthSlider.value);
      this.input.setStrength(v);
      document.querySelector("#strengthValue").textContent = v.toFixed(2);
    });

    lensSliders.forEach((slider) => {
      slider.addEventListener("input", () => {
        const lensName = slider.dataset.lens;
        const v = Number(slider.value);
        this.lens.setWeight(lensName, v);
        slider.nextElementSibling.textContent = v.toFixed(2);
      });
    });

    resetBtn.addEventListener("click", () => this.onReset());
  }
}
