import pathlib
import sys

SRC = pathlib.Path(__file__).resolve().parents[1] / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from lenses import LensBlend  # noqa: E402


def test_lens_blend_normalization_and_bias():
    blend = LensBlend(human=0.1, predictive=0.4, systemic=0.4, harmonic=0.1)
    normalized = blend.normalized()
    assert round(normalized.predictive + normalized.human + normalized.systemic + normalized.harmonic, 5) == 1.0

    weighted = blend.path_b_weight(base=0.5)
    # Predictive/systemic emphasis should push Path B probability upward.
    assert weighted > 0.5
