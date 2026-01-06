import pathlib
import sys

SRC = pathlib.Path(__file__).resolve().parents[1] / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from grid import forgiveness_factor  # noqa: E402


def test_forgiveness_factor_scales():
    assert forgiveness_factor(0.1, threshold=0.35, floor=0.5) == 1.0
    damped = forgiveness_factor(0.7, threshold=0.35, floor=0.5)
    assert 0.5 <= damped < 1.0
    assert forgiveness_factor(1.5, threshold=0.35, floor=0.5) == 0.5
