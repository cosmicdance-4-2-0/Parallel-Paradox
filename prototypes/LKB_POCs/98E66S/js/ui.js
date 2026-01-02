import { makeRangeUpdater } from './utils.js';

export class UI {
  constructor(config, renderer) {
    this.config = config;
    this.renderer = renderer;
    this.dom = {
      modeSelect: document.getElementById('mode-select'),
      modeLabel: document.getElementById('mode-label'),
      inputStrength: document.getElementById('input-strength'),
      inputDecay: document.getElementById('input-decay'),
      inputRadius: document.getElementById('input-radius'),
      flipP: document.getElementById('flip-p'),
      parityP: document.getElementById('parity-p'),
      pathB: document.getElementById('path-b'),
      alpha: document.getElementById('alpha'),
      forgiveness: document.getElementById('forgiveness'),
      pointSize: document.getElementById('point-size'),
      spinRate: document.getElementById('spin-rate'),
      reset: document.getElementById('btn-reset'),
      pause: document.getElementById('btn-pause'),
      snapshot: document.getElementById('btn-snapshot'),
      filePicker: document.getElementById('file-picker'),
      hud: {
        fps: document.getElementById('fps-label'),
        energy: document.getElementById('energy-label'),
      },
    };
  }

  bindControls(onModeChange, onReset, onPauseToggle, onSnapshot, onFileChosen) {
    const { dom, config } = this;

    // Input
    makeRangeUpdater(dom.inputStrength, config.input, 'strength', (v) => v.toFixed(2));
    makeRangeUpdater(dom.inputDecay, config.input, 'decay', (v) => v.toFixed(2));
    makeRangeUpdater(dom.inputRadius, config.input, 'radius', (v) => v.toFixed(1));

    // Swarm
    makeRangeUpdater(dom.flipP, config.swarm, 'flipProbability', (v) => v.toFixed(3));
    makeRangeUpdater(dom.parityP, config.swarm, 'parityProbability', (v) => v.toFixed(3));
    makeRangeUpdater(dom.pathB, config.swarm, 'pathBWeight', (v) => v.toFixed(2));
    makeRangeUpdater(dom.alpha, config.swarm, 'alpha', (v) => v.toFixed(2));
    makeRangeUpdater(dom.forgiveness, config.swarm, 'forgiveness', (v) => v.toFixed(2));

    // Rendering
    makeRangeUpdater(dom.pointSize, config, 'pointSize', (v) => v.toFixed(1));
    makeRangeUpdater(dom.spinRate, config, 'spinRate', (v) => v.toFixed(2));

    dom.modeSelect.addEventListener('change', (e) => {
      const mode = e.target.value;
      dom.modeLabel.textContent = mode;
      onModeChange(mode);
    });

    dom.reset.addEventListener('click', onReset);
    dom.pause.addEventListener('click', () => {
      const pressed = dom.pause.getAttribute('aria-pressed') === 'true';
      dom.pause.setAttribute('aria-pressed', String(!pressed));
      onPauseToggle(!pressed);
    });
    dom.snapshot.addEventListener('click', onSnapshot);
    dom.filePicker.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) onFileChosen(file);
    });
  }

  updateHUD({ fps, energy }) {
    if (fps !== undefined) this.dom.hud.fps.textContent = fps.toFixed(1);
    if (energy !== undefined) this.dom.hud.energy.textContent = energy.toFixed(3);
  }
}
