import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-tooltip{position:relative;display:inline-flex}
.ef-tooltip__bubble{position:absolute;left:50%;bottom:calc(100% + 8px);transform:translateX(-50%) scale(.92);transform-origin:bottom center;background:var(--surface-inverse);color:var(--text-inverse);font-size:var(--text-xs);font-weight:var(--weight-medium);line-height:1.35;padding:5px 9px;border-radius:6px;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity var(--dur-fast) var(--ease-out),transform var(--dur-med) var(--ease-spring);z-index:var(--z-tooltip)}
.ef-tooltip__bubble::after{content:'';position:absolute;top:100%;left:50%;transform:translateX(-50%);border:4px solid transparent;border-top-color:var(--surface-inverse)}
.ef-tooltip--bottom .ef-tooltip__bubble{bottom:auto;top:calc(100% + 8px);transform-origin:top center}
.ef-tooltip--bottom .ef-tooltip__bubble::after{top:auto;bottom:100%;border-top-color:transparent;border-bottom-color:var(--surface-inverse)}
.ef-tooltip:hover .ef-tooltip__bubble,.ef-tooltip:focus-within .ef-tooltip__bubble{opacity:1;transform:translateX(-50%) scale(1);transition-delay:200ms}
`;
export function Tooltip({ label, position = 'top', children, style, className }) {
  injectEfCss('ef-css-tooltip', CSS);
  const id = React.useId();
  const [dismissed, setDismissed] = React.useState(false);
  const child = React.Children.count(children) === 1 && React.isValidElement(children)
    ? React.cloneElement(children, { 'aria-describedby': id })
    : children;
  return (
    <span className={`ef-tooltip${position === 'bottom' ? ' ef-tooltip--bottom' : ''}${className ? ' ' + className : ''}`} style={style}
      onKeyDown={e => { if (e.key === 'Escape') setDismissed(true); }}
      onMouseLeave={() => setDismissed(false)}
      onBlur={() => setDismissed(false)}>
      {child}
      <span className="ef-tooltip__bubble" role="tooltip" id={id} style={dismissed ? { opacity: 0, transitionDelay: '0ms' } : undefined}>{label}</span>
    </span>
  );
}
