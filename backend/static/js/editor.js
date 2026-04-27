/* global htmx */

(function () {
  const wfEl = document.getElementById('waveform-data');
  const cfgEl = document.getElementById('editor-config');
  const canvas = document.getElementById('waveform');
  const audio = document.getElementById('player');
  if (!wfEl || !cfgEl || !canvas || !audio) return;

  const cfg = JSON.parse(cfgEl.textContent || '{}');
  const sid = cfg.session_id;
  let wf = JSON.parse(wfEl.textContent || '{}');

  function drawWaveform() {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.clientWidth || canvas.width;
    const h = canvas.height;
    canvas.width = w * (window.devicePixelRatio || 1);
    canvas.height = h * (window.devicePixelRatio || 1);
    ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const peaks = wf.peaks || [];
    if (!peaks.length) return;
    const cy = h / 2;
    ctx.fillStyle = '#93c5fd';
    ctx.beginPath();
    peaks.forEach((amp, i) => {
      const x = (i / (peaks.length - 1 || 1)) * w;
      const y = cy - amp * cy * 0.8;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    for (let i = peaks.length - 1; i >= 0; i--) {
      const amp = peaks[i];
      const x = (i / (peaks.length - 1 || 1)) * w;
      const y = cy + amp * cy * 0.8;
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    const dur = wf.duration_sec || 1;
    const t = audio.currentTime || 0;
    const x = (t / dur) * w;
    ctx.strokeStyle = '#7b68ee';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }

  async function refreshWaveform() {
    const zoom = parseFloat(document.getElementById('zoom-slider')?.value || '1');
    const base = 800;
    const points = Math.max(32, Math.floor(base * zoom));
    const r = await fetch(`/api/sessions/${sid}/waveform?points=${points}`);
    if (!r.ok) return;
    wf = await r.json();
    drawWaveform();
  }

  function syncTimeline() {
    const dur = parseFloat(document.getElementById('timeline-bar')?.dataset.duration || '0') || wf.duration_sec || 1;
    const t = audio.currentTime || 0;
    const pct = dur > 0 ? (100 * t) / dur : 0;
    const prog = document.getElementById('timeline-progress');
    const head = document.getElementById('timeline-playhead');
    if (prog) prog.style.width = `${pct}%`;
    if (head) head.style.left = `${pct}%`;
    const tr = document.getElementById('time-readout');
    if (tr) tr.textContent = `${t.toFixed(1)} / ${dur.toFixed(1)}`;
    const cur = document.getElementById('current_time_sec');
    if (cur) cur.value = t.toFixed(4);
    const rs = document.getElementById('region_start_sec');
    if (rs) rs.value = t.toFixed(4);
  }

  audio.addEventListener('timeupdate', () => {
    drawWaveform();
    syncTimeline();
  });
  audio.addEventListener('loadedmetadata', () => {
    drawWaveform();
    syncTimeline();
  });
  window.addEventListener('resize', () => {
    drawWaveform();
  });

  const zoomSlider = document.getElementById('zoom-slider');
  let zoomTimer = null;
  if (zoomSlider) {
    zoomSlider.addEventListener('input', () => {
      clearTimeout(zoomTimer);
      zoomTimer = setTimeout(async () => {
        const z = parseFloat(zoomSlider.value);
        await fetch(`/api/sessions/${sid}/state`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ zoom: z }),
        });
        await refreshWaveform();
      }, 200);
    });
  }

  const vol = document.getElementById('volume_slider');
  if (vol) {
    vol.addEventListener('input', () => {
      audio.volume = parseFloat(vol.value);
    });
    audio.volume = parseFloat(vol.value);
  }

  document.body.addEventListener('click', async (e) => {
    const btn = e.target.closest('#export-btn');
    if (!btn) return;
    const id = btn.getAttribute('data-session') || sid;
    const r = await fetch(`/api/sessions/${id}/export`, { method: 'POST' });
    if (!r.ok) {
      alert('Export failed');
      return;
    }
    const j = await r.json();
    window.location.href = j.download_url;
  });

  drawWaveform();
  syncTimeline();

  document.body.addEventListener('htmx:afterSwap', (evt) => {
    if (evt.detail.target && evt.detail.target.id === 'header-controls-mount') {
      const v = document.getElementById('volume_slider');
      if (v && audio) {
        audio.volume = parseFloat(v.value);
        v.addEventListener('input', () => { audio.volume = parseFloat(v.value); });
      }
    }
  });
})();
