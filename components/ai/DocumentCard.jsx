import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
import { Icon } from '../icons/Icon.jsx';
const CSS = `
.ef-doccard{border:1px solid var(--border-default);border-radius:var(--radius-md);background:var(--surface-card);font-family:var(--font-sans)}
.ef-doccard__head{display:flex;align-items:center;gap:9px;padding:10px 10px 10px 14px}
.ef-doccard__glyph{display:inline-flex;color:var(--text-muted)}
.ef-doccard__title{flex:1;min-width:0;font-size:13.5px;font-weight:var(--weight-semibold);color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ef-doccard__meta{font-size:12px;color:var(--text-muted)}
.ef-doccard__btn{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border:none;background:none;cursor:pointer;color:var(--text-muted);border-radius:var(--radius-sm);transition:color var(--dur-fast) var(--ease-out),background var(--dur-fast) var(--ease-out)}
.ef-doccard__btn:hover{color:var(--text-primary);background:var(--surface-subtle)}
.ef-doccard__btn:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-doccard__btn--open{transform:rotate(180deg)}
.ef-doccard__win{position:relative;overflow:hidden;transition:height .45s cubic-bezier(.32,.72,0,1)}
.ef-doccard__content{padding:0 16px 14px;font-size:14px;line-height:1.7;color:var(--text-secondary)}
.ef-doccard__content h1,.ef-doccard__content h2,.ef-doccard__content h3{color:var(--text-primary);font-family:var(--font-display,var(--font-sans));margin:.2em 0 .4em}
.ef-doccard__content p{margin:0 0 .8em}
.ef-doccard__fade{position:absolute;left:0;right:0;bottom:0;height:72px;background:linear-gradient(to top,var(--surface-card),transparent);pointer-events:none;transition:opacity var(--dur-med) var(--ease-out)}
.ef-doccard--open .ef-doccard__fade{opacity:0}
`;
export function DocumentCard({ title, meta, icon = 'file-text', collapsedHeight = 200, defaultOpen = false, onCopy, actions, children, style, className, ...rest }) {
  injectEfCss('ef-css-doccard', CSS);
  const [open, setOpen] = React.useState(!!defaultOpen);
  const [full, setFull] = React.useState(null);
  const [copied, setCopied] = React.useState(false);
  const inner = React.useRef(null);
  React.useEffect(() => {
    const el = inner.current;
    if (!el) return;
    const update = () => setFull(el.scrollHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const overflows = full !== null && full > collapsedHeight;
  const height = full === null ? (open ? undefined : collapsedHeight) : (open ? full : Math.min(full, collapsedHeight));
  const copy = () => {
    const text = inner.current ? inner.current.textContent : '';
    if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
    if (onCopy) onCopy(text);
    setCopied(true); setTimeout(() => setCopied(false), 1600);
  };
  return (
    <div {...rest} className={`ef-doccard${open ? ' ef-doccard--open' : ''}${className ? ' ' + className : ''}`} style={style}>
      <div className="ef-doccard__head">
        <span className="ef-doccard__glyph"><Icon name={icon} size={15} /></span>
        <span className="ef-doccard__title">{title}</span>
        {meta ? <span className="ef-doccard__meta">{meta}</span> : null}
        {actions}
        <button type="button" className="ef-doccard__btn" aria-label="Copy document" onClick={copy}><Icon name={copied ? 'check' : 'copy'} size={14} /></button>
        {overflows || !open ? (
          <button type="button" className={`ef-doccard__btn${open ? ' ef-doccard__btn--open' : ''}`} aria-expanded={open} aria-label={open ? 'Collapse' : 'Expand'} onClick={() => setOpen(!open)}><Icon name="chevron-down" size={14} /></button>
        ) : null}
      </div>
      <div className="ef-doccard__win" style={{ height }}>
        <div ref={inner} className="ef-doccard__content">{children}</div>
        {overflows && !open ? <div className="ef-doccard__fade" onClick={() => setOpen(true)}></div> : null}
      </div>
    </div>
  );
}
