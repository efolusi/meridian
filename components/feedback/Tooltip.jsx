import React from 'react';
import { injectEfCss, useIsoLayoutEffect } from '../forms/Button.jsx';
import { Portal } from '../overlay/Portal.jsx';
const CSS = `
.ef-tooltip{position:relative;display:inline-flex}
.ef-tooltip__bubble{position:fixed;background:var(--surface-inverse);color:var(--text-inverse);font-size:var(--text-xs);font-weight:var(--weight-medium);line-height:1.35;padding:5px 9px;border-radius:6px;white-space:nowrap;pointer-events:none;z-index:var(--z-tooltip);animation:ef-tooltip-in var(--dur-fast) var(--ease-out)}
.ef-tooltip__bubble::after{content:'';position:absolute;top:100%;left:var(--ef-tt-arrow,50%);transform:translateX(-50%);border:4px solid transparent;border-top-color:var(--surface-inverse)}
.ef-tooltip__bubble--bottom::after{top:auto;bottom:100%;border-top-color:transparent;border-bottom-color:var(--surface-inverse)}
.ef-tooltip__bubble--left::after{top:var(--ef-tt-arrow,50%);left:100%;transform:translateY(-50%);border-top-color:transparent;border-left-color:var(--surface-inverse)}
.ef-tooltip__bubble--right::after{top:var(--ef-tt-arrow,50%);left:auto;right:100%;transform:translateY(-50%);border-top-color:transparent;border-right-color:var(--surface-inverse)}
@keyframes ef-tooltip-in{from{opacity:0}to{opacity:1}}
`;
const SIDES = ['top', 'bottom', 'left', 'right'];
export function Tooltip({ label, side: sideProp, position, delay = 200, children, style, className, ...rest }) {
  injectEfCss('ef-css-tooltip', CSS);
  const id = React.useId();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const bubbleRef = React.useRef(null);
  const timer = React.useRef(null);
  // position is the deprecated alias; side (the house placement prop) wins when both are passed.
  const asked = sideProp ?? position;
  const want = SIDES.includes(asked) ? asked : 'top';

  // Portal's useAnchoredStyle only resolves top/bottom, so the tooltip places
  // itself: the same flip-then-clamp behaviour, extended to left/right. Hidden
  // for the first frame so the measurement never flashes at the origin.
  const [placed, setPlaced] = React.useState({ style: { position: 'fixed', top: 0, left: 0, visibility: 'hidden' }, side: want });
  useIsoLayoutEffect(() => {
    if (!open) {
      setPlaced(s => (s.style.visibility === 'hidden' ? s : { ...s, style: { ...s.style, visibility: 'hidden' } }));
      return;
    }
    const move = () => {
      const anchor = ref.current;
      const bubble = bubbleRef.current;
      if (!anchor || !bubble) return;
      const a = anchor.getBoundingClientRect();
      const b = bubble.getBoundingClientRect();
      const vw = document.documentElement.clientWidth;
      const vh = document.documentElement.clientHeight;
      const edge = 8;
      const offset = 8;
      let side = want;
      if (want === 'left' || want === 'right') {
        const roomLeft = a.left - offset;
        const roomRight = vw - a.right - offset;
        side = want === 'left'
          ? (roomLeft >= b.width || roomLeft >= roomRight ? 'left' : 'right')
          : (roomRight >= b.width || roomRight >= roomLeft ? 'right' : 'left');
      } else {
        const roomAbove = a.top - offset;
        const roomBelow = vh - a.bottom - offset;
        side = want === 'top'
          ? (roomAbove >= b.height || roomAbove >= roomBelow ? 'top' : 'bottom')
          : (roomBelow >= b.height || roomBelow >= roomAbove ? 'bottom' : 'top');
      }
      let top = side === 'top' ? a.top - offset - b.height
        : side === 'bottom' ? a.bottom + offset
        : a.top + a.height / 2 - b.height / 2;
      let left = side === 'left' ? a.left - offset - b.width
        : side === 'right' ? a.right + offset
        : a.left + a.width / 2 - b.width / 2;
      left = Math.max(edge, Math.min(left, vw - b.width - edge));
      top = Math.max(edge, Math.min(top, vh - b.height - edge));
      setPlaced({ style: { position: 'fixed', top: Math.round(top), left: Math.round(left), visibility: 'visible' }, side });
    };
    move();
    // capture phase: any scrolling ancestor moves the anchor, not just the window
    window.addEventListener('scroll', move, true);
    window.addEventListener('resize', move);
    return () => { window.removeEventListener('scroll', move, true); window.removeEventListener('resize', move); };
  }, [open, want]);
  const { style: anchored, side } = placed;

  // Keep the arrow over the trigger's centre even when the bubble has been
  // shifted to stay on screen, so it never points at empty space.
  const [arrow, setArrow] = React.useState(null);
  useIsoLayoutEffect(() => {
    if (!open || !ref.current || !bubbleRef.current) { setArrow(null); return; }
    const a = ref.current.getBoundingClientRect();
    const b = bubbleRef.current.getBoundingClientRect();
    if (!b.width) return;
    const across = side === 'left' || side === 'right';
    const v = across ? a.top + a.height / 2 - b.top : a.left + a.width / 2 - b.left;
    setArrow(Math.max(8, Math.min(v, (across ? b.height : b.width) - 8)));
  }, [open, side, anchored.left, anchored.top]);

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
            className={`ef-tooltip__bubble${side !== 'top' ? ' ef-tooltip__bubble--' + side : ''}`}
            style={{ ...anchored, ...(arrow == null ? null : { '--ef-tt-arrow': arrow + 'px' }) }}>{label}</span>
        </Portal>
      ) : null}
    </span>
  );
}
