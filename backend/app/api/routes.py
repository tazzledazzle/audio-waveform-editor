"""HTML and JSON API routes."""

from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, Body, File, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse, RedirectResponse
from fastapi.templating import Jinja2Templates

from app.config import get_settings
from app.domain.models import EditState, TimeRegion
from app.services.audio_service import AudioService
from app.storage.session_store import SessionStore

BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent
templates = Jinja2Templates(directory=str(BACKEND_ROOT / "templates"))

router = APIRouter()
_store = SessionStore()
_service = AudioService(_store)


def _require_session(session_id: str) -> None:
    if not _store.session_exists(session_id):
        raise HTTPException(status_code=404, detail="session not found")


def _has_source(session_id: str) -> bool:
    return _store.source_path(session_id).is_file()


@router.get("/", response_class=HTMLResponse)
async def index(request: Request) -> HTMLResponse:
    return templates.TemplateResponse(
        "index.html",
        {"request": request, "settings": get_settings()},
    )


@router.post("/api/sessions", response_class=JSONResponse)
async def create_session() -> dict:
    sid = _store.create_session()
    return {"session_id": sid}


@router.get("/editor/{session_id}", response_class=HTMLResponse)
async def editor_page(request: Request, session_id: str) -> HTMLResponse:
    _require_session(session_id)
    state = _service.load_state(session_id)
    meta = None
    waveform_json = "null"
    if _has_source(session_id):
        meta = _service.get_meta(session_id)
        wf = _service.waveform(session_id)
        waveform_json = wf.model_dump_json()
    return templates.TemplateResponse(
        "editor.html",
        {
            "request": request,
            "session_id": session_id,
            "state": state,
            "meta": meta,
            "waveform_json": waveform_json,
            "settings": get_settings(),
        },
    )


@router.post("/editor/{session_id}/upload")
async def upload_editor(
    session_id: str,
    file: UploadFile = File(...),
) -> RedirectResponse:
    _require_session(session_id)
    raw = await file.read()
    try:
        _service.ingest_upload(session_id, file.filename or "audio.wav", raw)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    return RedirectResponse(url=f"/editor/{session_id}", status_code=303)


@router.post("/api/sessions/{session_id}/upload", response_class=JSONResponse)
async def upload_api(
    session_id: str,
    file: UploadFile = File(...),
) -> dict:
    _require_session(session_id)
    raw = await file.read()
    try:
        meta = _service.ingest_upload(session_id, file.filename or "audio.wav", raw)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    return meta.model_dump()


@router.get("/api/sessions/{session_id}/waveform", response_class=JSONResponse)
async def api_waveform(session_id: str, points: int | None = None) -> dict:
    _require_session(session_id)
    if not _has_source(session_id):
        raise HTTPException(status_code=400, detail="no audio uploaded")
    wf = _service.waveform(session_id, points)
    return wf.model_dump()


@router.get("/api/sessions/{session_id}/state", response_class=JSONResponse)
async def api_get_state(session_id: str) -> dict:
    _require_session(session_id)
    return _service.load_state(session_id).model_dump()


@router.patch("/api/sessions/{session_id}/state", response_class=JSONResponse)
async def api_patch_state(session_id: str, body: dict = Body(...)) -> dict:
    _require_session(session_id)
    state = _service.merge_state(session_id, body)
    return state.model_dump()


@router.put("/api/sessions/{session_id}/state", response_class=JSONResponse)
async def api_put_state(session_id: str, body: EditState) -> dict:
    _require_session(session_id)
    _service.save_state(session_id, body)
    return body.model_dump()


@router.get("/api/sessions/{session_id}/source")
async def api_source_audio(session_id: str) -> FileResponse:
    _require_session(session_id)
    path = _store.source_path(session_id)
    if not path.is_file():
        raise HTTPException(status_code=400, detail="no audio")
    return FileResponse(
        path,
        media_type="audio/wav",
        filename="source.wav",
    )


@router.post("/api/sessions/{session_id}/export")
async def api_export(session_id: str) -> dict:
    _require_session(session_id)
    if not _has_source(session_id):
        raise HTTPException(status_code=400, detail="no audio")
    path = _service.export_processed(session_id)
    return {"download_url": f"/api/sessions/{session_id}/download/export.wav"}


@router.get("/api/sessions/{session_id}/download/export.wav")
async def download_export(session_id: str) -> FileResponse:
    _require_session(session_id)
    path = _store.export_path(session_id)
    if not path.is_file():
        raise HTTPException(status_code=404, detail="export not found; run POST .../export first")
    return FileResponse(path, media_type="audio/wav", filename="edited.wav")


# --- HTMX partials ---


@router.post("/editor/{session_id}/htmx/effects", response_class=HTMLResponse)
async def htmx_effects(request: Request, session_id: str) -> HTMLResponse:
    """Update effect toggles/params from form and return refreshed effects panel."""
    _require_session(session_id)
    form = await request.form()
    partial: dict = {"effects": {}}

    def on(name: str) -> bool:
        return form.get(name) in ("1", "on", "true", "yes")

    partial["effects"]["reverb"] = on("reverb")
    partial["effects"]["compression"] = on("compression")
    partial["effects"]["eq"] = on("eq")

    def num(name: str, default: float) -> float:
        v = form.get(name)
        if v is None or v == "":
            return default
        return float(v)

    partial["effects"]["compression_params"] = {
        "threshold_db": num("threshold_db", -20),
        "ratio": num("ratio", 4),
    }
    partial["effects"]["reverb_params"] = {
        "decay": num("decay", 2),
        "wet": num("wet", 0.3),
    }
    partial["effects"]["eq_params"] = {
        "low": num("low", 0),
        "mid": num("mid", 0),
        "high": num("high", 0),
    }

    state = _service.merge_state(session_id, partial)
    return templates.TemplateResponse(
        "partials/effects_panel.html",
        {"request": request, "state": state, "session_id": session_id},
    )


@router.post("/editor/{session_id}/htmx/region", response_class=HTMLResponse)
async def htmx_region(request: Request, session_id: str) -> HTMLResponse:
    _require_session(session_id)
    form = await request.form()
    action = str(form.get("action", ""))
    state = _service.load_state(session_id)
    if action == "create":
        if not _has_source(session_id):
            raise HTTPException(status_code=400, detail="no audio")
        meta = _service.get_meta(session_id)
        start = float(form.get("start_sec", state.current_time_sec))
        end_raw = form.get("end_sec")
        if end_raw not in (None, ""):
            end = float(end_raw)
        else:
            end = min(start + 5.0, meta.duration_sec)
        try:
            region = TimeRegion(start_sec=start, end_sec=end)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e)) from e
        _service.merge_state(session_id, {"selected_region": region.model_dump()})
    elif action == "clear":
        _service.merge_state(session_id, {"selected_region": None})
    state = _service.load_state(session_id)
    meta = _service.get_meta(session_id) if _has_source(session_id) else None
    return templates.TemplateResponse(
        "partials/timeline_panel.html",
        {
            "request": request,
            "state": state,
            "meta": meta,
            "session_id": session_id,
        },
    )


@router.post("/editor/{session_id}/htmx/controls", response_class=HTMLResponse)
async def htmx_controls(request: Request, session_id: str) -> HTMLResponse:
    _require_session(session_id)
    form = await request.form()
    partial: dict = {}
    if "volume" in form:
        partial["volume"] = float(form["volume"])
    if "zoom" in form:
        partial["zoom"] = float(form["zoom"])
    if "current_time_sec" in form:
        partial["current_time_sec"] = float(form["current_time_sec"])
    state = _service.merge_state(session_id, partial)
    meta = _service.get_meta(session_id) if _has_source(session_id) else None
    return templates.TemplateResponse(
        "partials/header_controls.html",
        {
            "request": request,
            "state": state,
            "meta": meta,
            "session_id": session_id,
        },
    )
