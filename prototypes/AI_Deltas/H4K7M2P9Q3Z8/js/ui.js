export class UI {
  constructor(config) {
    this.config = config;
    this.energyA = document.getElementById('energy-a');
    this.energyB = document.getElementById('energy-b');
    this.fps = document.getElementById('fps');
    this.delta = document.getElementById('delta-id');

    this.pathB = document.getElementById('pathb');
    this.forgiveness = document.getElementById('forgiveness');
    this.shadow = document.getElementById('shadow');
    this.memory = document.getElementById('memory');

    this.delta.textContent = config.DeltaID || '';
  }

  bind({ onModeChange, onReset, onPause, onSnapshot, onSliderChange, filePicker }) {
    document.getElementById('btn-reset').addEventListener('click', onReset);
    document.getElementById('btn-snapshot').addEventListener('click', onSnapshot);

    const pauseBtn = document.getElementById('btn-pause');
    pauseBtn.addEventListener('click', () => {
      const next = pauseBtn.getAttribute('aria-pressed') !== 'true';
      pauseBtn.setAttribute('aria-pressed', next.toString());
      pauseBtn.textContent = next ? 'Resume' : 'Pause';
      onPause(next);
    });

    document.querySelectorAll('.mode').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mode').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        onModeChange(btn.dataset.mode);
      });
    });

    this.pathB.value = this.config.swarm.pathBWeight;
    this.forgiveness.value = this.config.swarm.forgiveness;
    this.shadow.value = this.config.coupling.shadowWeight;
    this.memory.value = this.config.coupling.memoryWeight;

    const syncSlider = (input, path) => {
      input.addEventListener('input', () => {
        const value = Number.parseFloat(input.value);
        onSliderChange(path, value);
      });
    };

    syncSlider(this.pathB, ['swarm', 'pathBWeight']);
    syncSlider(this.forgiveness, ['swarm', 'forgiveness']);
    syncSlider(this.shadow, ['coupling', 'shadowWeight']);
    syncSlider(this.memory, ['coupling', 'memoryWeight']);

    filePicker.addEventListener('change', (e) => {
      const [file] = e.target.files;
      if (file) onModeChange('file', file);
    });
  }

  updateHUD({ energyA, energyB, fps }) {
    this.energyA.textContent = energyA.toFixed(3);
    this.energyB.textContent = energyB.toFixed(3);
    this.fps.textContent = fps.toFixed(1);
  }
}
