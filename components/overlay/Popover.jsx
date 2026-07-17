import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-popover{position:relative;display:inline-flex}
.ef-popover__panel{position:absolute;top:calc(100% + 8px);width:280px;background:var(--surface-card);border:1px solid var(--border-strong);border-radius:var(--radius-md);box-shadow:var(--shadow-md);padding:14px;z-index:80;animation:ef-pop-in var(--dur-fast) var(--ease-out)}
.ef-popover__panel--left{left:0}
.ef-popover__panel--right{right:0}
@keyframes ef-pop-in{from{opacity:0;transform:translateY(-3px)}}
`;
export function Popover({ trigger, children, align = 'left', width = 280, open: controlled, onOpenChange, style, className }) {
  injectEfCss('ef-css-popover', CSS);
  const [inner, setInner] = React.useState(false);
  const open = controlled != null ? controlled : inner;
  const setOpen = v => { if (controlled == null) setInner(v); if (onOpenChange) onOpenChange(v); };
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const away = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const key = e => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', key); };
  }, [open]);
  return (
    <span ref={ref} className={`ef-popover${className ? ' ' + className : ''}`} style={style}>
      <span style={{ display: 'inline-flex' }} onClick={() => setOpen(!open)}>{trigger}</span>
      {open && <div className={`ef-popover__panel ef-popover__panel--${align}`} style={{ width }}>{children}</div>}
    </span>
  );
}
