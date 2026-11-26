'use client';
import React from 'react';
import { injectEfCss, styleRef } from '../runtime/runtime.jsx';
import { Icon } from '../icons/Icon.jsx';
const CSS = `
.ef-doccard{border:1px solid var(--border-default);border-radius:var(--radius-md);background:var(--surface-card);font-family:var(--font-sans)}
.ef-doccard__head{display:flex;align-items:center;gap:var(--space-2);padding:var(--space-3) var(--space-3) var(--space-3) var(--space-4)}
.ef-doccard__glyph{display:inline-flex;color:var(--text-muted)}
.ef-doccard__title{flex:1;min-width:0;font-size:var(--text-md);font-weight:var(--weight-semibold);color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ef-doccard__meta{font-size:var(--text-xs);color:var(--text-muted)}
.ef-doccard__btn{display:inline-flex;align-items:center;justify-content:center;width:var(--control-h-sm);height:var(--control-h-sm);border:none;background:none;cursor:pointer;color:var(--text-muted);border-radius:var(--radius-sm);transition:color var(--dur-fast) var(--ease-enter),background var(--dur-fast) var(--ease-enter)}
.ef-doccard__btn:hover{color:var(--text-primary);background:var(--surface-subtle)}
.ef-doccard__btn:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-doccard__btn--open{transform:rotate(180deg)}
.ef-doccard__win{position:relative;overflow:hidden;height:var(--ef-doccard-h,200px);transition:height var(--dur-slow) var(--ease-enter)}
.ef-doccard__content{padding:0 var(--space-4) var(--space-4);font-size:var(--text-md);line-height:1.7;color:var(--text-secondary)}
.ef-doccard__content h1,.ef-doccard__content h2,.ef-doccard__content h3{color:var(--text-primary);font-family:var(--font-display,var(--font-sans));margin:.2em 0 .4em}
.ef-doccard__content p{margin:0 0 .8em}
.ef-doccard__fade{position:absolute;inset-inline:0;bottom:0;height:72px;background:linear-gradient(to top,var(--surface-card),transparent);pointer-events:none;transition:opacity var(--dur-base) var(--ease-enter)}
.ef-doccard--open .ef-doccard__fade{opacity:0}
.ef-doccard--open .ef-doccard__win{height:var(--ef-doccard-h,auto)}
@media (pointer:coarse){.ef-doccard__btn{min-width:var(--tap-min);min-height:var(--tap-min)}}
/* Reduced motion: nothing moves or resizes; the end state is shown at once. */
@media (prefers-reduced-motion:reduce){.ef-doccard__win{transition:none}}
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
        <span className="ef-doccard__glyph"><Icon name={icon} size={16} /></span>
        <span className="ef-doccard__title">{title}</span>
        {meta ? <span className="ef-doccard__meta">{meta}</span> : null}
        {actions}
        <button type="button" className="ef-doccard__btn" aria-label="Copy document" onClick={copy}><Icon name={copied ? 'check' : 'copy'} size={16} /></button>
        {overflows || !open ? (
          <button type="button" className={`ef-doccard__btn${open ? ' ef-doccard__btn--open' : ''}`} aria-expanded={open} aria-label={open ? 'Collapse' : 'Expand'} onClick={() => setOpen(!open)}><Icon name="chevron-down" size={16} /></button>
        ) : null}
      </div>
      <div className="ef-doccard__win" ref={styleRef({ '--ef-doccard-h': height })}>
        <div ref={inner} className="ef-doccard__content">{children}</div>
        {overflows && !open ? <div className="ef-doccard__fade" onClick={() => setOpen(true)}></div> : null}
      </div>
    </div>
  );
}
