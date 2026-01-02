from lkb_delta.config import BiasPulse, SimulationConfig
from lkb_delta.bias import BiasField


def test_bias_pulse_and_decay():
    config = SimulationConfig(grid_size=6, bias_decay=0.5, bias_strength=0.3, pulses=[])
    config.pulses = [BiasPulse(step=0, position=(0, 0, 0), strength=1.0, radius=1.5)]
    field = BiasField(config)

    field.apply_pulses(config.pulses, current_step=0)
    amplitude_after_pulse = field.amplitude()
    assert amplitude_after_pulse > 0

    field.decay()
    assert field.amplitude() < amplitude_after_pulse
