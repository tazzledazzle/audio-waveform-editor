"""Three-band graphic EQ via STFT magnitude shaping."""

from __future__ import annotations

import numpy as np
from scipy import signal


def apply_three_band_eq(
    x: np.ndarray,
    sample_rate: int,
    low_db: float,
    mid_db: float,
    high_db: float,
) -> np.ndarray:
    """Apply smooth low / mid / high gain curve in frequency domain."""
    if x.size == 0:
        return x

    x = np.asarray(x, dtype=np.float64)
    mono = x.ndim == 1
    if mono:
        work = x[:, np.newaxis]
    else:
        work = x

    nperseg = min(4096, max(256, len(work)))
    out_ch = []
    for c in range(work.shape[1]):
        y = work[:, c]
        f, t, Z = signal.stft(y, fs=sample_rate, nperseg=nperseg, boundary="zeros")
        # piecewise-linear dB curve vs frequency
        nyq = sample_rate / 2
        freqs = f
        gain_db = np.interp(
            freqs,
            [0, 200, 1000, 8000, nyq],
            [low_db, low_db, mid_db, high_db, high_db],
        )
        gain_lin = 10 ** (gain_db / 20.0)
        Z2 = Z * gain_lin[:, np.newaxis]
        _, xrec = signal.istft(Z2, fs=sample_rate, nperseg=nperseg)
        xrec = np.real(xrec)[: len(y)]
        if len(xrec) < len(y):
            xrec = np.pad(xrec, (0, len(y) - len(xrec)))
        else:
            xrec = xrec[: len(y)]
        out_ch.append(xrec)

    stacked = np.stack(out_ch, axis=1)
    if mono:
        return stacked[:, 0].astype(np.float32)
    return stacked.astype(np.float32)
