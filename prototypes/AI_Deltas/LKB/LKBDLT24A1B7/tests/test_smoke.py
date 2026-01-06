import json
import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src"))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from phasecube_delta import __version__  # noqa: E402
from phasecube_delta.cli import run  # noqa: E402


def test_cli_run_returns_summary():
    summary = run(["--steps", "5", "--grid", "4", "--seed", "11"])
    assert summary["grid"] == 4
    assert summary["cells"] == 64
    assert "dispersion" in summary
    assert isinstance(summary["dispersion"], float)


def test_version_string_present():
    assert isinstance(__version__, str)
    assert __version__.count(".") >= 1
