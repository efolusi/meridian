import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
import { Portal, useAnchoredStyle } from './Portal.jsx';
const CSS = `
.ef-popover{position:relative;display:inline-flex}
.ef-popover__panel{position:absolute;top:calc(100% + 8px);width:280px;background:var(--surface-card);border:1px solid var(--border-strong);border-radius:var(--radius-md);box-shadow:var(--shadow-md);padding:14px;z-index:var(--z-dropdown);animation:ef-pop-in var(--dur-fast) var(--ease-out)}
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
  const panelRef = React.useRef(null);
  const { style: anchored } = useAnchoredStyle(ref, panelRef, { open, placement: 'bottom', align: align === 'right' ? 'end' : 'start', offset: 8 });
  const restoreFocus = () => {
    const t = ref.current && ref.current.querySelector('button,[href],[tabindex]');
    if (t) t.focus();
  };
  React.useEffect(() => {
    if (!open) return;
    const away = e => {
      const inTrigger = ref.current && ref.current.contains(e.target);
      const inPanel = panelRef.current && panelRef.current.contains(e.target);
      if (!inTrigger && !inPanel) setOpen(false);
    };
    const key = e => { if (e.key === 'Escape') { setOpen(false); restoreFocus(); } };
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', key); };
  }, [open]);
  const triggerProps = {
    onClick: e => { if (React.isValidElement(trigger) && trigger.props.onClick) trigger.props.onClick(e); setOpen(!open); },
    onKeyDown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!open); } },
    'aria-haspopup': 'dialog',
    'aria-expanded': open,
  };
  return (
    <span ref={ref} className={`ef-popover${className ? ' ' + className : ''}`} style={style}>
      {React.isValidElement(trigger)
        ? React.cloneElement(trigger, triggerProps)
        : <span role="button" tabIndex={0} style={{ display: 'inline-flex' }} {...triggerProps}>{trigger}</span>}
      {open && (
        <Portal>
          <div ref={panelRef} className={`ef-popover__panel ef-popover__panel--${align}`} style={{ ...anchored, width }}>{children}</div>
        </Portal>
      )}
    </span>
  );
}
