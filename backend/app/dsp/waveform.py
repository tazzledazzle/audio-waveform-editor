"""Peak envelope downsampling for waveform visualization."""

from __future__ import annotations

import numpy as np


def compute_peak_waveform(
    samples: np.ndarray,
    num_points: int,
) -> list[float]:
    """
    samples: shape (frames,) mono or (frames, channels) — uses max abs across channels per frame.
    Returns list of peak magnitudes in [0, 1] per bucket.
    """
    if samples.ndim == 2:
        mono = np.max(np.abs(samples), axis=1)
    else:
        mono = np.abs(samples.astype(np.float64, copy=False))

    n = mono.shape[0]
    if n == 0 or num_points <= 0:
        return []

    if num_points >= n:
        peaks = mono.tolist()
        return [float(min(1.0, p)) for p in peaks]

    bucket = n / num_points
    out: list[float] = []
    for i in range(num_points):
        start = int(i * bucket)
        end = int((i + 1) * bucket)
        end = max(end, start + 1)
        chunk = mono[start:end]
        peak = float(np.max(chunk)) if chunk.size else 0.0
        out.append(min(1.0, peak))
    return out
