# Audio Waveform Editor — FastAPI backend

Server-rendered web UI (Jinja2 + HTMX) with JSON APIs for sessions, waveform data, editor state, and WAV export with a real DSP chain (EQ → compressor → reverb → volume).

## Requirements

- Python 3.11+
- System libraries for `soundfile` / libsndfile (WAV, FLAC, OGG, etc.). MP3 support depends on your libsndfile build.

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Optional: store session files outside the repo:

```bash
export AUDIO_EDITOR_DATA_DIR=/path/to/writable/dir
```

## Run

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Open <http://localhost:8000/> — create a session, upload audio, edit effects/regions, then **Export** to download processed `edited.wav`.

## Tests

```bash
cd backend
pytest tests -v
```

## Layout

| Path | Role |
|------|------|
| `app/main.py` | FastAPI app + static mount |
| `app/api/routes.py` | HTML pages, JSON API, HTMX partials |
| `app/domain/models.py` | Pydantic session/edit models |
| `app/storage/session_store.py` | Per-session WAV + JSON state on disk |
| `app/dsp/` | Waveform peaks, EQ (STFT), compressor, reverb, chain |
| `app/services/audio_service.py` | Ingest, waveform, merge state, export |
| `templates/` | Jinja templates |
| `static/` | CSS + `editor.js` (waveform canvas, zoom, export) |

## Effect chain order

1. Three-band EQ (STFT magnitude shaping)  
2. Peak compressor  
3. Convolution reverb  
4. Volume  

Export applies the selected time region (if any) before processing.
