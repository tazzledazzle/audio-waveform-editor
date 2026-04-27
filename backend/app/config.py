"""Application configuration."""

from dataclasses import dataclass
from functools import lru_cache
import os
from pathlib import Path


def _env_int(name: str, default: int) -> int:
    raw = os.environ.get(name)
    if raw is None:
        return default
    try:
        return int(raw)
    except ValueError:
        return default


def _resolve_data_dir() -> Path:
    raw = os.environ.get("AUDIO_EDITOR_DATA_DIR")
    if raw:
        return Path(raw).expanduser().resolve()
    return (Path(__file__).resolve().parent.parent / "data").resolve()


@dataclass(frozen=True)
class Settings:
    app_name: str
    data_dir: Path
    max_upload_bytes: int
    allowed_extensions: tuple[str, ...]
    waveform_points_default: int


@lru_cache
def get_settings() -> Settings:
    return Settings(
        app_name=os.environ.get("AUDIO_EDITOR_APP_NAME", "Audio Editor"),
        data_dir=_resolve_data_dir(),
        max_upload_bytes=_env_int("AUDIO_EDITOR_MAX_UPLOAD_BYTES", 50 * 1024 * 1024),
        allowed_extensions=(
            ".wav",
            ".flac",
            ".ogg",
            ".aiff",
            ".aif",
            ".mp3",
        ),
        waveform_points_default=_env_int("AUDIO_EDITOR_WAVEFORM_POINTS", 800),
    )
