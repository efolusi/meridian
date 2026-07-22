import React from 'react';
import { injectEfCss, useIsoLayoutEffect } from '../forms/Button.jsx';
import { Portal, useAnchoredStyle } from '../overlay/Portal.jsx';
const CSS = `
.ef-tooltip{position:relative;display:inline-flex}
.ef-tooltip__bubble{position:fixed;background:var(--surface-inverse);color:var(--text-inverse);font-size:var(--text-xs);font-weight:var(--weight-medium);line-height:1.35;padding:5px 9px;border-radius:6px;white-space:nowrap;pointer-events:none;z-index:var(--z-tooltip);animation:ef-tooltip-in var(--dur-fast) var(--ease-out)}
.ef-tooltip__bubble::after{content:'';position:absolute;top:100%;left:var(--ef-tt-arrow,50%);transform:translateX(-50%);border:4px solid transparent;border-top-color:var(--surface-inverse)}
.ef-tooltip__bubble--bottom::after{top:auto;bottom:100%;border-top-color:transparent;border-bottom-color:var(--surface-inverse)}
@keyframes ef-tooltip-in{from{opacity:0}to{opacity:1}}
`;
export function Tooltip({ label, position = 'top', delay = 200, children, style, className, ...rest }) {
  injectEfCss('ef-css-tooltip', CSS);
  const id = React.useId();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const bubbleRef = React.useRef(null);
  const timer = React.useRef(null);
  const { style: anchored, side } = useAnchoredStyle(ref, bubbleRef, {
    open, placement: position === 'bottom' ? 'bottom' : 'top', align: 'center', offset: 8,
  });

  // Keep the arrow over the trigger's centre even when the bubble has been
  // shifted to stay on screen, so it never points at empty space.
  const [arrowX, setArrowX] = React.useState(null);
  useIsoLayoutEffect(() => {
    if (!open || !ref.current || !bubbleRef.current) { setArrowX(null); return; }
    const a = ref.current.getBoundingClientRect();
    const b = bubbleRef.current.getBoundingClientRect();
    if (!b.width) return;
    const x = a.left + a.width / 2 - b.left;
    setArrowX(Math.max(8, Math.min(x, b.width - 8)));
  }, [open, anchored.left, anchored.top]);

  const show = immediate => {
    clearTimeout(timer.current);
    if (immediate) setOpen(true);
    else timer.current = setTimeout(() => setOpen(true), delay);
  };
  const hide = () => { clearTimeout(timer.current); setOpen(false); };
  React.useEffect(() => () => clearTimeout(timer.current), []);

  const child = React.Children.count(children) === 1 && React.isValidElement(children)
    ? React.cloneElement(children, { 'aria-describedby': open ? id : undefined })
    : children;

  return (
    <span {...rest} ref={ref} className={`ef-tooltip${className ? ' ' + className : ''}`} style={style}
      onMouseEnter={() => show(false)}
      onMouseLeave={hide}
      onFocus={() => show(true)}
      onBlur={hide}
      onKeyDown={e => { if (e.key === 'Escape') hide(); }}>
      {child}
      {open ? (
        <Portal>
          <span ref={bubbleRef} role="tooltip" id={id}
            className={`ef-tooltip__bubble${side === 'bottom' ? ' ef-tooltip__bubble--bottom' : ''}`}
            style={{ ...anchored, ...(arrowX == null ? null : { '--ef-tt-arrow': arrowX + 'px' }) }}>{label}</span>
        </Portal>
      ) : null}
    </span>
  );
}
