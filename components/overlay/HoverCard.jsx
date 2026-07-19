import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
import { Portal, useAnchoredStyle } from './Portal.jsx';
const CSS = `
.ef-hovercard{position:relative;display:inline-flex}
.ef-hovercard__trigger{display:inline-flex;border-radius:var(--radius-sm)}
.ef-hovercard__trigger:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-hovercard__panel{position:absolute;left:0;background:var(--surface-card);border:1px solid var(--border-strong);border-radius:var(--radius-md);box-shadow:var(--shadow-md);padding:14px;z-index:var(--z-popover);animation:ef-hovercard-in var(--dur-med) var(--ease-out)}
.ef-hovercard__panel--bottom{top:calc(100% + 8px)}
.ef-hovercard__panel--top{bottom:calc(100% + 8px)}
@keyframes ef-hovercard-in{from{opacity:0;transform:translateY(2px)}}
`;
export function HoverCard({ trigger, side = 'bottom', openDelay = 350, closeDelay = 150, width = 300, children, style, className, ...rest }) {
  injectEfCss('ef-css-hovercard', CSS);
  const [open, setOpen] = React.useState(false);
  const t = React.useRef(null);
  const ref = React.useRef(null);
  const panelRef = React.useRef(null);
  const { style: anchored } = useAnchoredStyle(ref, panelRef, { open, placement: side === 'top' ? 'top' : 'bottom', align: 'start', offset: 8 });
  const enter = () => { clearTimeout(t.current); t.current = setTimeout(() => setOpen(true), openDelay); };
  const leave = () => { clearTimeout(t.current); t.current = setTimeout(() => setOpen(false), closeDelay); };
  React.useEffect(() => () => clearTimeout(t.current), []);
  return (
    <span {...rest} ref={ref} className={`ef-hovercard${className ? ' ' + className : ''}`} style={style} onMouseEnter={enter} onMouseLeave={leave}
      onKeyDown={e => { if (e.key === 'Escape') { clearTimeout(t.current); setOpen(false); } }}>
      <span className="ef-hovercard__trigger" tabIndex={0} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}>{trigger}</span>
      {open ? (
        <Portal>
          <div ref={panelRef} onMouseEnter={enter} onMouseLeave={leave}
            className={`ef-hovercard__panel ef-hovercard__panel--${side}`} style={{ ...anchored, width }}>{children}</div>
        </Portal>
      ) : null}
    </span>
  );
}
