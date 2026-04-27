import os
import tempfile
from pathlib import Path

import pytest


@pytest.fixture
def tmp_data_dir(tmp_path: Path) -> Path:
    d = tmp_path / "data"
    d.mkdir()
    os.environ["AUDIO_EDITOR_DATA_DIR"] = str(d)
    # bust settings cache if tests import get_settings before fixture
    from app.config import get_settings

    get_settings.cache_clear()
    yield d
    get_settings.cache_clear()
    os.environ.pop("AUDIO_EDITOR_DATA_DIR", None)
