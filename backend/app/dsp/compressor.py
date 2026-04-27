"""Simple peak compressor (soft-knee, per channel)."""

from __future__ import annotations

import numpy as np


def apply_compressor(
    x: np.ndarray,
    sample_rate: int,
    threshold_db: float,
    ratio: float,
    attack_ms: float = 5.0,
    release_ms: float = 120.0,
    knee_db: float = 6.0,
) -> np.ndarray:
    """
    x: (frames,) or (frames, channels), float32/float64 in roughly [-1, 1].
    """
    if x.size == 0:
        return x

    x = np.asarray(x, dtype=np.float64)
    mono = x.ndim == 1
    if mono:
        work = x[:, np.newaxis]
    else:
        work = x

    attack = np.exp(-1.0 / (max(1e-6, attack_ms) * 1e-3 * sample_rate))
    release = np.exp(-1.0 / (max(1e-6, release_ms) * 1e-3 * sample_rate))

    out = np.zeros_like(work)
    for ch in range(work.shape[1]):
        sig = work[:, ch]
        env = 0.0
        gain = 1.0
        for i, s in enumerate(sig):
            level = abs(float(s))
            if level > env:
                env = attack * env + (1 - attack) * level
            else:
                env = release * env + (1 - release) * level
            env_db = 20 * np.log10(max(env, 1e-12))
            over = env_db - threshold_db
            if over < -knee_db / 2:
                target_db = 0.0
            elif over > knee_db / 2:
                target_db = (1 - 1 / ratio) * over
            else:
                # soft knee quadratic region
                target_db = (1 - 1 / ratio) * ((over + knee_db / 2) ** 2) / (2 * knee_db)
            desired_gain_db = -target_db
            desired_gain = 10 ** (desired_gain_db / 20.0)
            coeff = attack if desired_gain < gain else release
            gain = coeff * gain + (1 - coeff) * desired_gain
            out[i, ch] = s * gain

    if mono:
        return np.clip(out[:, 0], -1.0, 1.0).astype(np.float32)
    return np.clip(out, -1.0, 1.0).astype(np.float32)
