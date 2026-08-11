import React from 'react';
import { injectEfCss, mergeRefs, useIsoLayoutEffect } from '../forms/Button.jsx';
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
const TooltipProviderCtx = React.createContext({ delayDuration: 200 });
const TooltipCtx = React.createContext(null);

function compose(theirs, ours) {
  return event => { theirs?.(event); if (!event.defaultPrevented) ours?.(event); };
}

export function Tooltip({ label, side, delay, open: controlled, defaultOpen = false, onOpenChange, children }) {
  injectEfCss('ef-css-tooltip', CSS);
  const provider = React.useContext(TooltipProviderCtx);
  const [inner, setInner] = React.useState(defaultOpen);
  const open = controlled !== undefined ? controlled : inner;
  const triggerRef = React.useRef(null);
  const timerRef = React.useRef(null);
  const contentId = React.useId();
  const setOpen = React.useCallback(next => {
    if (controlled === undefined) setInner(next);
    onOpenChange?.(next);
  }, [controlled, onOpenChange]);
  const show = React.useCallback(immediate => {
    clearTimeout(timerRef.current);
    const wait = delay ?? provider.delayDuration;
    if (immediate || wait <= 0) setOpen(true);
    else timerRef.current = setTimeout(() => setOpen(true), wait);
  }, [delay, provider.delayDuration, setOpen]);
  const hide = React.useCallback(() => { clearTimeout(timerRef.current); setOpen(false); }, [setOpen]);
  React.useEffect(() => () => clearTimeout(timerRef.current), []);
  const value = React.useMemo(() => ({ open, show, hide, triggerRef, contentId }), [open, show, hide, contentId]);

  if (label !== undefined) {
    return (
      <TooltipCtx.Provider value={value}>
        <span className="ef-tooltip">
          <TooltipTrigger asChild>{children}</TooltipTrigger>
          <TooltipContent side={SIDES.includes(side) ? side : 'top'}>{label}</TooltipContent>
        </span>
      </TooltipCtx.Provider>
    );
  }
  return <TooltipCtx.Provider value={value}>{children}</TooltipCtx.Provider>;
}

export function TooltipProvider({ delayDuration = 200, children }) {
  return <TooltipProviderCtx.Provider value={{ delayDuration }}>{children}</TooltipProviderCtx.Provider>;
}

export const TooltipTrigger = React.forwardRef(function TooltipTrigger({ asChild = false, children, ...rest }, forwardedRef) {
  const ctx = React.useContext(TooltipCtx);
  if (!ctx) return <button type="button" {...rest} ref={forwardedRef}>{children}</button>;
  const props = {
    ...rest,
    ref: mergeRefs(forwardedRef, ctx.triggerRef),
    'data-slot': 'tooltip-trigger',
    'aria-describedby': ctx.open ? ctx.contentId : undefined,
    onMouseEnter: compose(rest.onMouseEnter, () => ctx.show(false)),
    onMouseLeave: compose(rest.onMouseLeave, ctx.hide),
    onFocus: compose(rest.onFocus, () => ctx.show(true)),
    onBlur: compose(rest.onBlur, ctx.hide),
    onKeyDown: compose(rest.onKeyDown, event => { if (event.key === 'Escape') ctx.hide(); }),
  };
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ...children.props,
      ref: mergeRefs(children.ref, props.ref),
      onMouseEnter: compose(children.props.onMouseEnter, props.onMouseEnter),
      onMouseLeave: compose(children.props.onMouseLeave, props.onMouseLeave),
      onFocus: compose(children.props.onFocus, props.onFocus),
      onBlur: compose(children.props.onBlur, props.onBlur),
      onKeyDown: compose(children.props.onKeyDown, props.onKeyDown),
      'aria-describedby': props['aria-describedby'],
      'data-slot': 'tooltip-trigger',
    });
  }
  return <button type="button" {...props}>{children}</button>;
});

export const TooltipContent = React.forwardRef(function TooltipContent({ side = 'top', sideOffset = 8, className, style, children, ...rest }, forwardedRef) {
  const ctx = React.useContext(TooltipCtx);
  const bubbleRef = React.useRef(null);
  const want = SIDES.includes(side) ? side : 'top';
  const [placed, setPlaced] = React.useState({ style: { position: 'fixed', top: 0, left: 0, visibility: 'hidden' }, side: want, arrow: null });
  useIsoLayoutEffect(() => {
    if (!ctx) return;
    if (!ctx.open) return;
    const move = () => {
      const anchor = ctx.triggerRef.current;
      const bubble = bubbleRef.current;
      if (!anchor || !bubble) return;
      const a = anchor.getBoundingClientRect();
      const b = bubble.getBoundingClientRect();
      const vw = document.documentElement.clientWidth;
      const vh = document.documentElement.clientHeight;
      const edge = 8;
      let actual = want;
      if (want === 'left' || want === 'right') {
        const left = a.left - sideOffset;
        const right = vw - a.right - sideOffset;
        actual = want === 'left' ? (left >= b.width || left >= right ? 'left' : 'right') : (right >= b.width || right >= left ? 'right' : 'left');
      } else {
        const above = a.top - sideOffset;
        const below = vh - a.bottom - sideOffset;
        actual = want === 'top' ? (above >= b.height || above >= below ? 'top' : 'bottom') : (below >= b.height || below >= above ? 'bottom' : 'top');
      }
      let top = actual === 'top' ? a.top - sideOffset - b.height : actual === 'bottom' ? a.bottom + sideOffset : a.top + a.height / 2 - b.height / 2;
      let left = actual === 'left' ? a.left - sideOffset - b.width : actual === 'right' ? a.right + sideOffset : a.left + a.width / 2 - b.width / 2;
      left = Math.max(edge, Math.min(left, vw - b.width - edge));
      top = Math.max(edge, Math.min(top, vh - b.height - edge));
      const across = actual === 'left' || actual === 'right';
      const arrow = across ? a.top + a.height / 2 - top : a.left + a.width / 2 - left;
      setPlaced({ style: { position: 'fixed', top: Math.round(top), left: Math.round(left), visibility: 'visible' }, side: actual, arrow: Math.max(8, Math.min(arrow, (across ? b.height : b.width) - 8)) });
    };
    move();
    window.addEventListener('scroll', move, true);
    window.addEventListener('resize', move);
    return () => { window.removeEventListener('scroll', move, true); window.removeEventListener('resize', move); };
  }, [ctx?.open, ctx?.triggerRef, want, sideOffset]);
  if (!ctx?.open) return null;
  return (
    <Portal>
      <span {...rest} ref={mergeRefs(forwardedRef, bubbleRef)} role="tooltip" id={ctx.contentId} data-slot="tooltip-content" data-state="open" data-side={placed.side}
        className={`ef-tooltip__bubble${placed.side !== 'top' ? ' ef-tooltip__bubble--' + placed.side : ''}${className ? ' ' + className : ''}`}
        style={{ ...placed.style, '--ef-tt-arrow': placed.arrow == null ? undefined : placed.arrow + 'px', ...style }}>{children}</span>
    </Portal>
  );
});
