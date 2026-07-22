import React from 'react';
import { injectEfCss, cssPct } from '../forms/Button.jsx';
import { Icon } from '../icons/Icon.jsx';
const CSS = `
.ef-player{display:flex;flex-direction:column;gap:10px;padding:14px;border:1px solid var(--border-default);border-radius:var(--radius-md);background:var(--surface-card);font-family:var(--font-sans)}
.ef-player__top{display:flex;align-items:center;gap:10px}
.ef-player__title{flex:1;min-width:0;font-size:13.5px;font-weight:var(--weight-semibold);color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ef-player__meta{font-size:12px;color:var(--text-muted)}
.ef-player__wave{position:relative;display:flex;align-items:center;justify-content:space-between;height:44px;cursor:pointer;touch-action:none;border-radius:var(--radius-sm)}
.ef-player__wave:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-player__bar{flex:none;width:2.5px;border-radius:var(--radius-full);background:var(--sand-300);transition:background .2s var(--ease-out)}
.ef-player__bar--played{background:var(--accent)}
.ef-player__bar--loading{animation:ef-player-load 1.2s ease-in-out infinite}
@keyframes ef-player-load{0%,100%{transform:scaleY(.3);opacity:.5}50%{transform:scaleY(1);opacity:1}}
.ef-player__row{display:flex;align-items:center;gap:6px}
.ef-player__btn{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border:none;background:none;cursor:pointer;color:var(--text-secondary);border-radius:var(--radius-full);transition:color var(--dur-fast) var(--ease-out),background var(--dur-fast) var(--ease-out)}
.ef-player__btn:hover{color:var(--text-primary);background:var(--surface-subtle)}
.ef-player__btn:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-player__play{width:38px;height:38px;background:var(--accent);color:var(--accent-contrast)}
.ef-player__play:hover{background:var(--accent-hover);color:var(--accent-contrast)}
.ef-player__time{font-size:12px;color:var(--text-muted);font-variant-numeric:tabular-nums}
`;
export function formatTime(s, hint) {
  const t = Math.max(0, Math.floor(s || 0));
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), sec = t % 60;
  if ((hint || t) >= 3600) return h + ':' + String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
  return m + ':' + String(sec).padStart(2, '0');
}
function pseudoPeaks(seedStr, n) {
  const s = seedStr || 'ef';
  let seed = 0;
  for (let i = 0; i < s.length; i++) seed = (seed * 31 + s.charCodeAt(i)) % 9973;
  const out = [];
  for (let i = 0; i < n; i++) {
    const v = Math.abs(Math.sin(seed + i * 0.83) * 0.6 + Math.sin(seed * 2 + i * 0.31) * 0.4);
    out.push(0.18 + 0.82 * Math.min(1, v));
  }
  return out;
}
export const Player = React.forwardRef(function Player({ src, title, meta, peaks, samples = 72, onTimeChange, style, className }, ref) {
  injectEfCss('ef-css-player', CSS);
  const audio = React.useRef(null);
  const wave = React.useRef(null);
  const [playing, setPlaying] = React.useState(false);
  const [t, setT] = React.useState(0);
  const [dur, setDur] = React.useState(0);
  const [muted, setMuted] = React.useState(false);
  const bars = React.useMemo(() => peaks || pseudoPeaks(src, samples), [peaks, src, samples]);
  const write = next => { setT(next); if (onTimeChange) onTimeChange(next); };
  React.useEffect(() => {
    const a = audio.current;
    if (!a) return;
    const onT = () => write(a.currentTime);
    const onD = () => setDur(isFinite(a.duration) ? a.duration : 0);
    const onP = () => setPlaying(true), onPa = () => setPlaying(false);
    a.addEventListener('timeupdate', onT); a.addEventListener('durationchange', onD); a.addEventListener('loadedmetadata', onD);
    a.addEventListener('play', onP); a.addEventListener('pause', onPa); a.addEventListener('ended', onPa);
    return () => { a.removeEventListener('timeupdate', onT); a.removeEventListener('durationchange', onD); a.removeEventListener('loadedmetadata', onD); a.removeEventListener('play', onP); a.removeEventListener('pause', onPa); a.removeEventListener('ended', onPa); };
  }, [src]);
  React.useEffect(() => {
    if (!playing) return;
    let raf;
    const tick = () => { if (audio.current) write(audio.current.currentTime); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);
  const jumpTo = s => { const a = audio.current; const v = Math.max(0, Math.min(s, dur || s)); write(v); if (a) a.currentTime = v; };
  const toggle = () => { const a = audio.current; if (!a) return; if (a.paused) a.play().catch(() => {}); else a.pause(); };
  React.useImperativeHandle(ref, () => ({ jumpTo, play: () => audio.current && audio.current.play(), pause: () => audio.current && audio.current.pause() }), [dur]);
  const seekFromPointer = e => {
    const el = wave.current;
    if (!el || !dur) return;
    const r = el.getBoundingClientRect();
    jumpTo(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * dur);
  };
  const onPointerDown = e => {
    seekFromPointer(e);
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    const move = ev => seekFromPointer(ev);
    const up = () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
  };
  const ratio = dur > 0 ? Math.min(t / dur, 1) : 0;
  return (
    <div className={`ef-player${className ? ' ' + className : ''}`} style={style}>
      {src ? <audio ref={audio} src={src} preload="metadata" muted={muted}></audio> : null}
      {title || meta ? (
        <div className="ef-player__top">
          <span className="ef-player__title">{title}</span>
          {meta ? <span className="ef-player__meta">{meta}</span> : null}
        </div>
      ) : null}
      <div ref={wave} className="ef-player__wave" role="slider" aria-label="Seek" tabIndex={0}
        aria-valuemin={0} aria-valuemax={Math.round(dur)} aria-valuenow={Math.round(t)} aria-valuetext={`${formatTime(t, dur)} of ${formatTime(dur)}`}
        onPointerDown={onPointerDown}
        onKeyDown={e => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); jumpTo(t + 5); }
          else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); jumpTo(t - 5); }
          else if (e.key === 'Home') { e.preventDefault(); jumpTo(0); }
          else if (e.key === 'End') { e.preventDefault(); jumpTo(dur); }
        }}>
        {bars.map((p, i) => (
          <span key={i} className={`ef-player__bar${!dur && playing ? ' ef-player__bar--loading' : (i + 0.5) / bars.length <= ratio ? ' ef-player__bar--played' : ''}`} style={{ height: cssPct(Math.max(8, p * 100)), animationDelay: !dur ? (i * 30) + 'ms' : undefined }}></span>
        ))}
      </div>
      <div className="ef-player__row">
        <button type="button" className="ef-player__btn" aria-label="Back 10 seconds" onClick={() => jumpTo(t - 10)}><Icon name="skip-back" size={14} /></button>
        <button type="button" className="ef-player__btn ef-player__play" aria-label={playing ? 'Pause' : 'Play'} onClick={toggle}><Icon name={playing ? 'pause' : 'play'} size={15} /></button>
        <button type="button" className="ef-player__btn" aria-label="Forward 10 seconds" onClick={() => jumpTo(t + 10)}><Icon name="skip-forward" size={14} /></button>
        <span className="ef-player__time">{formatTime(t, dur)} / {formatTime(dur)}</span>
        <button type="button" className="ef-player__btn" style={{ marginLeft: 'auto' }} aria-label={muted ? 'Unmute' : 'Mute'} aria-pressed={muted} onClick={() => setMuted(!muted)}><Icon name={muted ? 'volume-x' : 'volume-2'} size={14} /></button>
      </div>
    </div>
  );
});
