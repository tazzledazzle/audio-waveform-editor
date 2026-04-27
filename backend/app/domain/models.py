"""Pydantic models for sessions and editor state."""

from __future__ import annotations

from pydantic import BaseModel, Field, model_validator


class TimeRegion(BaseModel):
    start_sec: float = Field(ge=0)
    end_sec: float = Field(ge=0)

    @model_validator(mode="after")
    def end_after_start(self) -> TimeRegion:
        if self.end_sec < self.start_sec:
            raise ValueError("end_sec must be >= start_sec")
        return self


class CompressionParams(BaseModel):
    threshold_db: float = Field(default=-20, ge=-60, le=0)
    ratio: float = Field(default=4, ge=1, le=20)


class ReverbParams(BaseModel):
    decay_sec: float = Field(default=2, ge=0.1, le=10, alias="decay")
    wet: float = Field(default=0.3, ge=0, le=1)

    model_config = {"populate_by_name": True}


class EQParams(BaseModel):
    low_db: float = Field(default=0, ge=-20, le=20, alias="low")
    mid_db: float = Field(default=0, ge=-20, le=20, alias="mid")
    high_db: float = Field(default=0, ge=-20, le=20, alias="high")

    model_config = {"populate_by_name": True}


class EffectsState(BaseModel):
    reverb: bool = False
    compression: bool = False
    eq: bool = False
    compression_params: CompressionParams = Field(default_factory=CompressionParams)
    reverb_params: ReverbParams = Field(default_factory=ReverbParams)
    eq_params: EQParams = Field(default_factory=EQParams)


class EditState(BaseModel):
    volume: float = Field(default=0.7, ge=0, le=1)
    zoom: float = Field(default=1, ge=0.25, le=4)
    current_time_sec: float = Field(default=0, ge=0)
    selected_region: TimeRegion | None = None
    effects: EffectsState = Field(default_factory=EffectsState)

    model_config = {"extra": "ignore"}


class SessionMeta(BaseModel):
    session_id: str
    original_filename: str
    duration_sec: float
    sample_rate: int
    channels: int


class WaveformResponse(BaseModel):
    peaks: list[float]
    duration_sec: float
    sample_rate: int
    channels: int
    points: int
