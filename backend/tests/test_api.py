import io
import os
from pathlib import Path

import numpy as np
import pytest
import soundfile as sf
from starlette.testclient import TestClient

from app.config import get_settings
from app.main import create_app


@pytest.fixture
def client(tmp_data_dir: Path):
    os.environ["AUDIO_EDITOR_DATA_DIR"] = str(tmp_data_dir)
    get_settings.cache_clear()
    app = create_app()
    with TestClient(app) as tc:
        yield tc
    get_settings.cache_clear()
    os.environ.pop("AUDIO_EDITOR_DATA_DIR", None)


def test_create_upload_waveform_export(client: TestClient, tmp_data_dir: Path):
    r = client.post("/api/sessions")
    assert r.status_code == 200
    sid = r.json()["session_id"]

    sr = 8000
    x = (0.1 * np.sin(2 * np.pi * 440 * np.linspace(0, 0.2, int(sr * 0.2)))).astype(np.float32)
    buf = io.BytesIO()
    sf.write(buf, x, sr, format="WAV", subtype="PCM_16")
    raw = buf.getvalue()

    up = client.post(
        f"/api/sessions/{sid}/upload",
        files={"file": ("test.wav", raw, "audio/wav")},
    )
    assert up.status_code == 200, up.text

    wf = client.get(f"/api/sessions/{sid}/waveform?points=100")
    assert wf.status_code == 200
    body = wf.json()
    assert "peaks" in body and len(body["peaks"]) <= 100

    patch = client.patch(
        f"/api/sessions/{sid}/state",
        json={"effects": {"eq": True, "eq_params": {"low": 2, "mid": 0, "high": 0}}},
    )
    assert patch.status_code == 200

    ex = client.post(f"/api/sessions/{sid}/export")
    assert ex.status_code == 200
    url = ex.json()["download_url"]
    dl = client.get(url)
    assert dl.status_code == 200
    assert "audio" in dl.headers.get("content-type", "")
