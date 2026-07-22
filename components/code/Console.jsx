import React from 'react';
import { injectEfCss, prefersReducedMotion } from '../forms/Button.jsx';
import { Icon } from '../icons/Icon.jsx';
const CSS = `
.ef-console{position:relative;display:flex;flex-direction:column;border:1px solid var(--border-default);border-radius:var(--radius-md);background:var(--surface-card);overflow:hidden;font-family:var(--font-sans)}
.ef-console__head{display:flex;align-items:center;gap:8px;padding:8px 13px;border-bottom:1px solid var(--border-default);background:var(--surface-subtle);font-size:12px;color:var(--text-secondary)}
.ef-console__scroll{overflow-y:auto;font-family:var(--font-mono);font-size:12px;line-height:1.6}
.ef-console__row{display:flex;align-items:flex-start;gap:9px;padding:6px 13px;border-top:1px solid var(--border-default);color:var(--text-secondary)}
.ef-console__row:first-child{border-top:none}
.ef-console__glyph{display:inline-flex;flex:none;width:14px;margin-top:2px;color:var(--text-muted)}
.ef-console__row--warn .ef-console__glyph,.ef-console__row--warn .ef-console__msg{color:var(--warning-600)}
.ef-console__row--error .ef-console__glyph,.ef-console__row--error .ef-console__msg{color:var(--danger-600)}
.ef-console__row--debug .ef-console__glyph{color:var(--text-link)}
.ef-console__time{flex:none;color:var(--text-muted);font-variant-numeric:tabular-nums}
.ef-console__msg{flex:1;min-width:0;white-space:pre-wrap;word-break:break-word}
.ef-console__src{flex:none;margin-left:auto;color:var(--text-muted);font-size:11px}
.ef-console__stackbtn{display:inline-flex;align-items:center;gap:5px;border:none;background:none;padding:0;cursor:pointer;font:inherit;color:inherit;text-align:left}
.ef-console__stackbtn:hover{color:var(--text-primary)}
.ef-console__stackchev{display:inline-flex;margin-top:2px;color:var(--text-muted);transition:transform var(--dur-fast) var(--ease-out)}
.ef-console__stackchev--open{transform:rotate(90deg)}
.ef-console__stack{margin:4px 0 0;padding-left:19px;white-space:pre-wrap;color:var(--text-muted);font-size:11.5px}
.ef-console__jump{position:absolute;right:10px;bottom:10px;display:inline-flex;align-items:center;gap:6px;padding:6px 11px;border:1px solid var(--border-strong);border-radius:var(--radius-full);background:var(--surface-card);box-shadow:var(--shadow-md);cursor:pointer;font-family:var(--font-sans);font-size:12px;font-weight:var(--weight-semibold);color:var(--text-primary)}
`;
const GLYPH = { info: 'info', warn: 'triangle-alert', error: 'circle-alert', debug: 'bug' };
function Row({ e }) {
  const [open, setOpen] = React.useState(false);
  const lvl = e.level || 'log';
  return (
    <div className={`ef-console__row${lvl !== 'log' ? ' ef-console__row--' + lvl : ''}`}>
      {e.time ? <span className="ef-console__time">{e.time}</span> : null}
      <span className="ef-console__glyph">{GLYPH[lvl] ? <Icon name={GLYPH[lvl]} size={12} /> : null}</span>
      <span className="ef-console__msg">
        {e.stack ? (
          <button type="button" className="ef-console__stackbtn" aria-expanded={open} onClick={() => setOpen(!open)}>
            <span className={`ef-console__stackchev${open ? ' ef-console__stackchev--open' : ''}`}><Icon name="chevron-right" size={11} /></span>
            <span>{e.text}</span>
          </button>
        ) : e.text}
        {e.stack && open ? <div className="ef-console__stack">{e.stack}</div> : null}
      </span>
      {e.source ? <span className="ef-console__src">{e.source}</span> : null}
    </div>
  );
}
export function Console({ title = 'Console', entries = [], height = 240, style, className, ...rest }) {
  injectEfCss('ef-css-console', CSS);
  const viewport = React.useRef(null);
  const wasBottom = React.useRef(true);
  const [atBottom, setAtBottom] = React.useState(true);
  const recompute = () => {
    const v = viewport.current;
    if (!v) return;
    const b = v.scrollHeight - v.scrollTop - v.clientHeight < 24;
    wasBottom.current = b;
    setAtBottom(b);
  };
  React.useEffect(() => {
    const v = viewport.current;
    if (v && wasBottom.current) v.scrollTop = v.scrollHeight;
    recompute();
  }, [entries.length]);
  return (
    <div {...rest} className={`ef-console${className ? ' ' + className : ''}`} style={style}>
      <div className="ef-console__head"><Icon name="terminal" size={13} />{title}<span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>{entries.length} entries</span></div>
      <div ref={viewport} className="ef-console__scroll" role="log" aria-live="polite" style={{ height }} onScroll={recompute}>
        {entries.map((e, i) => <Row key={i} e={e} />)}
      </div>
      {!atBottom ? <button type="button" className="ef-console__jump" onClick={() => { const v = viewport.current; if (v) v.scrollTo({ top: v.scrollHeight, behavior: prefersReducedMotion() ? 'auto' : 'smooth' }); }}><Icon name="chevron-down" size={12} />Latest</button> : null}
    </div>
  );
}
