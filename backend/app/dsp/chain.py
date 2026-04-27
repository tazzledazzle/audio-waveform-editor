"""Load/save audio and apply ordered effect chain."""

from __future__ import annotations

from pathlib import Path

import numpy as np
import soundfile as sf

from app.domain.models import EditState, TimeRegion
from app.dsp.compressor import apply_compressor
from app.dsp.eq import apply_three_band_eq
from app.dsp.reverb import apply_reverb


def load_audio(path: Path) -> tuple[np.ndarray, int]:
    """Load audio as float32 in [-1, 1], shape (frames,) mono or (frames, ch)."""
    data, sr = sf.read(str(path), always_2d=True, dtype="float32")
    if data.shape[1] == 1:
        return data[:, 0], int(sr)
    return data, int(sr)


def save_wav(path: Path, samples: np.ndarray, sample_rate: int) -> None:
    """Write WAV (PCM_16 for smaller files)."""
    path.parent.mkdir(parents=True, exist_ok=True)
    data = np.asarray(samples, dtype=np.float32)
    if data.ndim == 1:
        sf.write(str(path), data, sample_rate, subtype="PCM_16")
    else:
        sf.write(str(path), data, sample_rate, subtype="PCM_16")


def _slice_region(
    samples: np.ndarray,
    sample_rate: int,
    region: TimeRegion | None,
) -> tuple[np.ndarray, int, int]:
    """Return sliced samples and start/end sample indices (full file if region None)."""
    if region is None:
        return samples, 0, samples.shape[0]
    start = int(max(0, region.start_sec * sample_rate))
    end = int(min(samples.shape[0], region.end_sec * sample_rate))
    end = max(end, start + 1)
    return samples[start:end], start, end


def apply_effect_chain(
    samples: np.ndarray,
    sample_rate: int,
    state: EditState,
    *,
    region: TimeRegion | None = None,
) -> np.ndarray:
    """
    Ordered chain: EQ -> Compressor -> Reverb -> volume.
    If region is set, only that segment is processed (for export).
    """
    seg, _, _ = _slice_region(samples, sample_rate, region)
    x = np.asarray(seg, dtype=np.float32, copy=True)
    fx = state.effects

    if fx.eq:
        p = fx.eq_params
        x = apply_three_band_eq(x, sample_rate, p.low_db, p.mid_db, p.high_db)

    if fx.compression:
        p = fx.compression_params
        x = apply_compressor(x, sample_rate, p.threshold_db, p.ratio)

    if fx.reverb:
        p = fx.reverb_params
        x = apply_reverb(x, sample_rate, p.decay_sec, p.wet)

    x = np.clip(x * float(state.volume), -1.0, 1.0).astype(np.float32)
    return x
