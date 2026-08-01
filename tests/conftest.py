"""Test-Setup ohne Home-Assistant-Installation.

`optimistic.py` ist bewusst frei von HA- und pymodbus-Importen und lässt sich
deshalb direkt laden. Der Coordinator, der es benutzt, hängt an beidem — die
Logik, die hier abgesichert wird, liegt aber vollständig im reinen Modul.
"""
from __future__ import annotations

import importlib.util
import sys
import types
from pathlib import Path

PKG = "proxon_pure"
COMPONENT_DIR = Path(__file__).resolve().parents[1] / "custom_components" / "proxon"


def _load(module_name: str) -> types.ModuleType:
    full_name = f"{PKG}.{module_name}"
    if full_name in sys.modules:
        return sys.modules[full_name]
    spec = importlib.util.spec_from_file_location(
        full_name, COMPONENT_DIR / f"{module_name}.py"
    )
    if spec is None or spec.loader is None:
        raise ImportError(f"Kann {module_name} nicht laden")
    module = importlib.util.module_from_spec(spec)
    sys.modules[full_name] = module
    spec.loader.exec_module(module)
    return module


if PKG not in sys.modules:
    _pkg = types.ModuleType(PKG)
    _pkg.__path__ = [str(COMPONENT_DIR)]
    sys.modules[PKG] = _pkg

optimistic = _load("optimistic")
