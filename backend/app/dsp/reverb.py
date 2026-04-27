"""Convolution reverb with exponential-decay noise impulse response."""

from __future__ import annotations

import numpy as np
from scipy.signal import fftconvolve


def apply_reverb(
    x: np.ndarray,
    sample_rate: int,
    decay_sec: float,
    wet: float,
) -> np.ndarray:
    """Mix wet reverb tail with dry signal. wet in [0, 1]."""
    if x.size == 0:
        return x

    x = np.asarray(x, dtype=np.float64)
    mono = x.ndim == 1
    if mono:
        work = x[:, np.newaxis]
    else:
        work = x

    # IR length capped for CPU; decay controls decay rate of the envelope
    max_ir = min(int(sample_rate * 3), work.shape[0] * 2, 96000)
    max_ir = max(max_ir, 512)
    tau = max(0.05, float(decay_sec)) * sample_rate / 3.0
    rng = np.random.default_rng(42)
    ir = rng.standard_normal(max_ir).astype(np.float64)
    env = np.exp(-np.arange(max_ir, dtype=np.float64) / tau)
    ir *= env
    ir /= np.max(np.abs(ir)) + 1e-12

    out = np.zeros_like(work)
    for ch in range(work.shape[1]):
        sig = work[:, ch]
        wet_sig = fftconvolve(sig, ir, mode="same")
        wet_sig = wet_sig / (np.max(np.abs(wet_sig)) + 1e-12) * (np.max(np.abs(sig)) + 1e-12)
        out[:, ch] = (1 - wet) * sig + wet * wet_sig

    if mono:
        return np.clip(out[:, 0], -1.0, 1.0).astype(np.float32)
    return np.clip(out, -1.0, 1.0).astype(np.float32)
