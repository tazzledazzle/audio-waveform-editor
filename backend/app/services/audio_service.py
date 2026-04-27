"""Orchestrates ingest, waveform, state, and export."""

from __future__ import annotations

import copy
import io
import json
from pathlib import Path

import numpy as np
import soundfile as sf

from app.config import get_settings
from app.domain.models import EditState, SessionMeta, TimeRegion, WaveformResponse
from app.dsp.chain import apply_effect_chain, load_audio, save_wav
from app.dsp.waveform import compute_peak_waveform
from app.storage.session_store import SessionStore


class AudioService:
    def __init__(self, store: SessionStore | None = None) -> None:
        self._store = store or SessionStore()
        self._settings = get_settings()

    def ingest_upload(self, session_id: str, filename: str, raw: bytes) -> SessionMeta:
        if len(raw) > self._settings.max_upload_bytes:
            raise ValueError("file too large")
        ext = Path(filename).suffix.lower()
        if ext not in self._settings.allowed_extensions:
            raise ValueError("unsupported file type")

        buf = io.BytesIO(raw)
        try:
            data, sr = sf.read(buf, always_2d=True, dtype="float32")
        except Exception as e:  # noqa: BLE001
            raise ValueError(f"could not decode audio: {e}") from e

        if data.size == 0:
            raise ValueError("empty audio")

        # normalize to float32 on disk as WAV
        path = self._store.source_path(session_id)
        path.parent.mkdir(parents=True, exist_ok=True)
        if data.shape[1] == 1:
            sf.write(str(path), data[:, 0], int(sr), subtype="PCM_16")
        else:
            sf.write(str(path), data, int(sr), subtype="PCM_16")

        duration = data.shape[0] / float(sr)
        meta = SessionMeta(
            session_id=session_id,
            original_filename=filename,
            duration_sec=duration,
            sample_rate=int(sr),
            channels=int(data.shape[1]),
        )
        self._store.save_meta(
            session_id,
            json.loads(meta.model_dump_json()),
        )
        return meta

    def get_meta(self, session_id: str) -> SessionMeta:
        samples, sr = load_audio(self._store.source_path(session_id))
        ch = 1 if samples.ndim == 1 else samples.shape[1]
        n = samples.shape[0]
        raw = self._store.load_meta(session_id)
        name = raw.get("original_filename", "")
        return SessionMeta(
            session_id=session_id,
            original_filename=name,
            duration_sec=n / float(sr),
            sample_rate=sr,
            channels=ch,
        )

    def waveform(self, session_id: str, points: int | None = None) -> WaveformResponse:
        pts = points or self._settings.waveform_points_default
        samples, sr = load_audio(self._store.source_path(session_id))
        ch = 1 if samples.ndim == 1 else samples.shape[1]
        peaks = compute_peak_waveform(samples, pts)
        n = samples.shape[0]
        return WaveformResponse(
            peaks=peaks,
            duration_sec=n / float(sr),
            sample_rate=sr,
            channels=ch,
            points=len(peaks),
        )

    def load_state(self, session_id: str) -> EditState:
        return self._store.load_state(session_id)

    def save_state(self, session_id: str, state: EditState) -> None:
        self._store.save_state(session_id, state)

    def merge_state(self, session_id: str, partial: dict) -> EditState:
        def deep_merge(base: dict, updates: dict) -> dict:
            out = copy.deepcopy(base)
            for k, v in updates.items():
                if isinstance(v, dict) and isinstance(out.get(k), dict):
                    out[k] = deep_merge(out[k], v)
                else:
                    out[k] = v
            return out

        current = self._store.load_state(session_id)
        merged = deep_merge(current.model_dump(), partial)
        state = EditState.model_validate(merged)
        self._store.save_state(session_id, state)
        return state

    def export_processed(self, session_id: str) -> Path:
        state = self._store.load_state(session_id)
        samples, sr = load_audio(self._store.source_path(session_id))
        region = state.selected_region
        processed = apply_effect_chain(samples, sr, state, region=region)
        out = self._store.export_path(session_id)
        save_wav(out, processed, sr)
        return out
