import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
import { Icon } from '../icons/Icon.jsx';
const CSS = `
.ef-selq{position:relative}
.ef-selq__bar{position:absolute;z-index:30;display:inline-flex;align-items:center;gap:2px;padding:4px;border:1px solid var(--border-default);border-radius:var(--radius-md);background:var(--surface-card);box-shadow:var(--shadow-lg,0 8px 24px rgba(0,0,0,.12));user-select:none}
.ef-selq__btn{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border:none;background:none;cursor:pointer;border-radius:var(--radius-sm);font-family:var(--font-sans);font-size:12.5px;font-weight:var(--weight-semibold);color:var(--text-secondary);transition:color var(--dur-fast) var(--ease-out),background var(--dur-fast) var(--ease-out)}
.ef-selq__btn:hover{color:var(--text-primary);background:var(--surface-subtle)}
.ef-selq__btn:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-selq__sep{width:1px;height:16px;background:var(--border-default);margin:0 3px}
`;
export function SelectionQuote({ children, actions = [{ id: 'quote', label: 'Quote', icon: 'corner-up-left' }], onAction, style, className, ...rest }) {
  injectEfCss('ef-css-selq', CSS);
  const contRef = React.useRef(null);
  const barRef = React.useRef(null);
  const [sel, setSel] = React.useState(null);
  const [pos, setPos] = React.useState(null);
  const read = () => {
    const s = window.getSelection();
    const cont = contRef.current;
    if (!s || s.isCollapsed || !s.rangeCount || !cont) return null;
    const r = s.getRangeAt(0);
    if (!cont.contains(r.startContainer) || !cont.contains(r.endContainer)) return null;
    const rects = r.getClientRects();
    if (!rects.length) return null;
    const text = s.toString();
    if (!text.trim()) return null;
    return { text, rect: rects[0] };
  };
  React.useEffect(() => {
    const up = e => {
      if (barRef.current && barRef.current.contains(e.target)) return;
      requestAnimationFrame(() => { const r = read(); if (r) setSel(r); });
    };
    const change = () => { const s = window.getSelection(); if (!s || s.isCollapsed) { setSel(null); setPos(null); } };
    const key = e => { if (e.key === 'Escape') { setSel(null); setPos(null); } };
    document.addEventListener('pointerup', up);
    document.addEventListener('selectionchange', change);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('pointerup', up);
      document.removeEventListener('selectionchange', change);
      document.removeEventListener('keydown', key);
    };
  }, []);
  React.useLayoutEffect(() => {
    if (!sel || !barRef.current || !contRef.current) return;
    const bar = barRef.current.getBoundingClientRect();
    const cont = contRef.current.getBoundingClientRect();
    let top = sel.rect.top - cont.top - bar.height - 8;
    if (top < 4) top = sel.rect.bottom - cont.top + 8;
    let left = sel.rect.left - cont.left;
    left = Math.max(4, Math.min(left, cont.width - bar.width - 4));
    setPos({ top, left });
  }, [sel]);
  return (
    <div {...rest} ref={contRef} className={`ef-selq${className ? ' ' + className : ''}`} style={style}>
      {children}
      {sel ? (
        <div ref={barRef} className="ef-selq__bar" role="toolbar" style={pos ? { top: pos.top, left: pos.left } : { top: 0, left: 0, visibility: 'hidden' }} onMouseDown={e => e.preventDefault()}>
          {actions.map((a, i) => (
            <React.Fragment key={a.id || i}>
              {i > 0 ? <span className="ef-selq__sep" aria-hidden="true"></span> : null}
              <button type="button" className="ef-selq__btn" onClick={() => { if (onAction) onAction(a.id, sel.text); window.getSelection().removeAllRanges(); setSel(null); setPos(null); }}>
                {a.icon ? <Icon name={a.icon} size={13} /> : null}{a.label}
              </button>
            </React.Fragment>
          ))}
        </div>
      ) : null}
    </div>
  );
}
