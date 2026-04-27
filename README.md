# Audio Waveform Editor

This folder previously contained an **Expo / React Native** prototype (`src/`, `App.tsx`, `package.json`). The active editor is now a **FastAPI** app with a **server-rendered** web UI and Python DSP.

## Run the FastAPI editor

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Then open **http://localhost:8000/** — start a session, upload audio (WAV/FLAC/OGG/AIFF; MP3 if your `soundfile`/libsndfile supports it), use the waveform/timeline, effects panel (HTMX), and export processed WAV.

Details: [backend/README.md](backend/README.md).

## Legacy mobile UI

The `src/` React Native + Expo code is kept for reference only; it is not required to run the Python editor.
