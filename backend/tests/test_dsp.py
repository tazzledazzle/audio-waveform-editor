import numpy as np
import soundfile as sf

from app.domain.models import EditState, EffectsState
from app.dsp.chain import apply_effect_chain, save_wav
from app.dsp.compressor import apply_compressor
from app.dsp.eq import apply_three_band_eq
from app.dsp.reverb import apply_reverb
from app.dsp.waveform import compute_peak_waveform


def test_waveform_peaks_length():
    x = np.sin(np.linspace(0, 8 * np.pi, 8000)).astype(np.float32)
    peaks = compute_peak_waveform(x, 100)
    assert len(peaks) == 100
    assert all(0 <= p <= 1 for p in peaks)


def test_compressor_runs_mono():
    sr = 8000
    t = np.linspace(0, 0.5, sr // 2, dtype=np.float32)
    x = 0.9 * np.sin(2 * np.pi * 440 * t).astype(np.float32)
    y = apply_compressor(x, sr, threshold_db=-30, ratio=4)
    assert y.shape == x.shape
    assert np.isfinite(y).all()


def test_eq_stft_runs():
    sr = 16000
    x = (0.1 * np.random.randn(sr).astype(np.float32)).clip(-1, 1)
    y = apply_three_band_eq(x, sr, low_db=3, mid_db=-2, high_db=1)
    assert y.shape == x.shape


def test_reverb_runs():
    sr = 8000
    x = (0.05 * np.random.randn(sr).astype(np.float32)).clip(-1, 1)
    y = apply_reverb(x, sr, decay_sec=0.5, wet=0.2)
    assert y.shape == x.shape


def test_effect_chain_roundtrip(tmp_path):
    sr = 8000
    x = (0.2 * np.sin(2 * np.pi * 220 * np.linspace(0, 0.25, int(sr * 0.25)))).astype(np.float32)
    state = EditState(
        volume=0.8,
        effects=EffectsState(
            eq=True,
            compression=True,
            reverb=True,
        ),
    )
    y = apply_effect_chain(x, sr, state, region=None)
    out = tmp_path / "out.wav"
    save_wav(out, y, sr)
    back, srr = sf.read(str(out), dtype="float32")
    assert srr == sr
    assert back.ndim == 1
    assert len(back) == len(y)
