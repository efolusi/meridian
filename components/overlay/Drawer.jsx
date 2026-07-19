import React from 'react';
import { IconButton } from '../forms/IconButton.jsx';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-drawer__overlay{position:fixed;inset:0;background:var(--overlay-scrim);z-index:var(--z-overlay);animation:ef-fade-in var(--dur-med) var(--ease-out)}
@keyframes ef-fade-in{from{opacity:0}}
.ef-drawer{position:fixed;top:0;bottom:0;background:var(--surface-card);z-index:var(--z-modal);display:flex;flex-direction:column;box-shadow:var(--shadow-pop)}
.ef-drawer:focus{outline:none}
.ef-drawer--right{right:0;border-left:1px solid var(--border-default);animation:ef-drawer-r var(--dur-slow) var(--ease-out)}
.ef-drawer--left{left:0;border-right:1px solid var(--border-default);animation:ef-drawer-l var(--dur-slow) var(--ease-out)}
@keyframes ef-drawer-r{from{transform:translateX(24px);opacity:0}}
@keyframes ef-drawer-l{from{transform:translateX(-24px);opacity:0}}
.ef-drawer__head{display:flex;align-items:center;gap:12px;padding:16px 20px;border-bottom:1px solid var(--border-default)}
.ef-drawer__title{font-family:var(--font-display);font-size:var(--text-lg);font-weight:var(--weight-bold);letter-spacing:var(--tracking-tight);flex:1}
.ef-drawer__body{flex:1;overflow-y:auto;padding:20px}
.ef-drawer__foot{display:flex;justify-content:flex-end;gap:8px;padding:14px 20px;border-top:1px solid var(--border-default);background:var(--surface-subtle)}
`;
const FOCUSABLE = 'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])';
export function Drawer({ open, onClose, title, footer, width = 400, side = 'right', children, ...rest }) {
  injectEfCss('ef-css-drawer', CSS);
  const panelRef = React.useRef(null);
  const prevFocus = React.useRef(null);
  const titleId = React.useId();
  React.useEffect(() => {
    if (!open) return;
    prevFocus.current = document.activeElement;
    const panel = panelRef.current;
    const first = panel && panel.querySelector(FOCUSABLE);
    (first || panel).focus();
    return () => { if (prevFocus.current && prevFocus.current.focus) prevFocus.current.focus(); };
  }, [open]);
  React.useEffect(() => {
    if (!open) return;
    const key = e => {
      if (e.key === 'Escape') { if (onClose) onClose(); return; }
      if (e.key !== 'Tab') return;
      const panel = panelRef.current;
      const f = panel ? Array.from(panel.querySelectorAll(FOCUSABLE)).filter(el => !el.disabled) : [];
      if (!f.length) { e.preventDefault(); return; }
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && (i === -1 || i === f.length - 1)) { e.preventDefault(); f[0].focus(); }
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <React.Fragment>
      <div className="ef-drawer__overlay" onMouseDown={onClose}></div>
      <div {...rest} className={`ef-drawer ef-drawer--${side}`} role="dialog" aria-modal="true" ref={panelRef} tabIndex={-1} aria-labelledby={title ? titleId : undefined} style={{ width }}>
        <div className="ef-drawer__head">
          <div className="ef-drawer__title" id={titleId}>{title}</div>
          {onClose ? <IconButton icon="x" label="Close" size="sm" onClick={onClose} /> : null}
        </div>
        <div className="ef-drawer__body">{children}</div>
        {footer ? <div className="ef-drawer__foot">{footer}</div> : null}
      </div>
    </React.Fragment>
  );
}
