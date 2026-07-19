import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
import { formatTime } from './Player.jsx';
const CSS = `
.ef-transcript{display:flex;flex-direction:column;border:1px solid var(--border-default);border-radius:var(--radius-md);background:var(--surface-card);overflow:hidden;font-family:var(--font-sans)}
.ef-transcript__head{display:flex;align-items:center;gap:9px;padding:10px 14px;border-bottom:1px solid var(--border-default)}
.ef-transcript__title{flex:1;min-width:0;font-size:13.5px;font-weight:var(--weight-semibold);color:var(--text-primary)}
.ef-transcript__auto{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--border-default);background:none;cursor:pointer;padding:3px 10px;border-radius:var(--radius-full);font-family:var(--font-sans);font-size:11.5px;color:var(--text-muted);transition:color var(--dur-fast) var(--ease-out),border-color var(--dur-fast) var(--ease-out)}
.ef-transcript__auto--on{color:var(--text-primary);border-color:var(--border-strong)}
.ef-transcript__auto:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-transcript__scroll{overflow-y:auto;padding:5px}
.ef-transcript__item{display:flex;gap:12px;padding:8px 10px;border-radius:var(--radius-sm);transition:background var(--dur-fast) var(--ease-out)}
.ef-transcript__item--active{background:var(--surface-sunken)}
.ef-transcript__time{flex:none;border:none;background:none;padding:0;cursor:pointer;font-family:var(--font-mono);font-size:11px;color:var(--text-muted);font-variant-numeric:tabular-nums;line-height:1.9;transition:color var(--dur-fast) var(--ease-out)}
.ef-transcript__time:hover{color:var(--text-primary)}
.ef-transcript__time:focus-visible{outline:none;box-shadow:var(--focus-ring);border-radius:3px}
.ef-transcript__item--active .ef-transcript__time{color:var(--text-link)}
.ef-transcript__speaker{flex:none;width:64px;font-size:12px;font-weight:var(--weight-semibold);color:var(--text-primary);line-height:1.8}
.ef-transcript__text{flex:1;min-width:0;font-size:13.5px;line-height:1.65;color:var(--text-muted)}
.ef-transcript__item--active .ef-transcript__text{color:var(--text-secondary)}
.ef-transcript__word{transition:color .1s linear}
.ef-transcript__word--played{color:var(--text-primary)}
.ef-transcript__text--interim{font-style:italic;color:var(--text-muted)}
`;
export function Transcript({ title = 'Transcript', items = [], currentTime = 0, onJump, height = 280, defaultAutoScroll = true, style, className, ...rest }) {
  injectEfCss('ef-css-transcript', CSS);
  const [auto, setAuto] = React.useState(!!defaultAutoScroll);
  const viewport = React.useRef(null);
  const rowRefs = React.useRef([]);
  let active = -1;
  for (let i = 0; i < items.length; i++) {
    const end = items[i].end != null ? items[i].end : (items[i + 1] ? items[i + 1].start : Infinity);
    if (currentTime >= items[i].start && currentTime < end) { active = i; break; }
  }
  React.useEffect(() => {
    if (!auto || active < 0) return;
    const v = viewport.current, row = rowRefs.current[active];
    if (!v || !row) return;
    const target = row.offsetTop - v.clientHeight / 2 + row.offsetHeight / 2;
    v.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
  }, [active, auto]);
  return (
    <div {...rest} className={`ef-transcript${className ? ' ' + className : ''}`} style={style}>
      <div className="ef-transcript__head">
        <span className="ef-transcript__title">{title}</span>
        <button type="button" className={`ef-transcript__auto${auto ? ' ef-transcript__auto--on' : ''}`} aria-pressed={auto} onClick={() => setAuto(!auto)}>Auto-scroll</button>
      </div>
      <div ref={viewport} className="ef-transcript__scroll" style={{ height }}>
        {items.map((it, i) => (
          <div key={i} ref={el => { rowRefs.current[i] = el; }} className={`ef-transcript__item${i === active ? ' ef-transcript__item--active' : ''}`}>
            <button type="button" className="ef-transcript__time" onClick={() => onJump && onJump(it.start)}>{formatTime(it.start)}</button>
            {it.speaker ? <span className="ef-transcript__speaker">{it.speaker}</span> : null}
            <span className={`ef-transcript__text${it.interim ? ' ef-transcript__text--interim' : ''}`}>
              {it.words
                ? it.words.map((w, k) => <span key={k} className={`ef-transcript__word${currentTime >= w.t ? ' ef-transcript__word--played' : ''}`}>{w.w}{' '}</span>)
                : it.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
