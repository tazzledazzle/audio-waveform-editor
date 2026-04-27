"""Filesystem-backed session storage."""

from __future__ import annotations

import json
import shutil
import uuid
from pathlib import Path

from app.config import Settings, get_settings
from app.domain.models import EditState


class SessionStore:
    """Stores normalized source audio and edit state per session."""

    SOURCE_NAME = "source.wav"
    STATE_NAME = "state.json"
    META_NAME = "meta.json"
    EXPORT_NAME = "export.wav"

    def __init__(self, settings: Settings | None = None) -> None:
        self._settings = settings or get_settings()
        self._root = self._settings.data_dir / "sessions"
        self._root.mkdir(parents=True, exist_ok=True)

    def _session_dir(self, session_id: str) -> Path:
        # prevent path traversal
        safe = uuid.UUID(session_id)  # raises ValueError if invalid
        return self._root / str(safe)

    def create_session(self) -> str:
        sid = str(uuid.uuid4())
        self._session_dir(sid).mkdir(parents=False, exist_ok=False)
        self.save_state(sid, EditState())
        return sid

    def session_exists(self, session_id: str) -> bool:
        try:
            return self._session_dir(session_id).is_dir()
        except ValueError:
            return False

    def source_path(self, session_id: str) -> Path:
        return self._session_dir(session_id) / self.SOURCE_NAME

    def state_path(self, session_id: str) -> Path:
        return self._session_dir(session_id) / self.STATE_NAME

    def meta_path(self, session_id: str) -> Path:
        return self._session_dir(session_id) / self.META_NAME

    def export_path(self, session_id: str) -> Path:
        return self._session_dir(session_id) / self.EXPORT_NAME

    def load_state(self, session_id: str) -> EditState:
        p = self.state_path(session_id)
        if not p.is_file():
            return EditState()
        raw = json.loads(p.read_text(encoding="utf-8"))
        return EditState.model_validate(raw)

    def save_state(self, session_id: str, state: EditState) -> None:
        p = self.state_path(session_id)
        p.write_text(state.model_dump_json(indent=2), encoding="utf-8")

    def delete_session(self, session_id: str) -> None:
        d = self._session_dir(session_id)
        if d.is_dir():
            shutil.rmtree(d, ignore_errors=True)

    def save_meta(self, session_id: str, meta: dict) -> None:
        self.meta_path(session_id).write_text(
            json.dumps(meta, indent=2),
            encoding="utf-8",
        )

    def load_meta(self, session_id: str) -> dict:
        p = self.meta_path(session_id)
        if not p.is_file():
            return {}
        return json.loads(p.read_text(encoding="utf-8"))
