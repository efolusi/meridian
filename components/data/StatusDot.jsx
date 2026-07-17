import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-status{display:inline-flex;align-items:center;gap:7px;font-size:var(--text-sm);color:var(--text-primary)}
.ef-status__dot{position:relative;width:8px;height:8px;border-radius:var(--radius-full);flex:none}
.ef-status--ok .ef-status__dot{background:var(--success-600)}
.ef-status--warn .ef-status__dot{background:var(--warning-600)}
.ef-status--err .ef-status__dot{background:var(--danger-600)}
.ef-status--busy .ef-status__dot{background:var(--caramel-500)}
.ef-status--off .ef-status__dot{background:var(--sand-400)}
@keyframes ef-status-pulse{0%{box-shadow:0 0 0 0 currentColor;opacity:.5}100%{box-shadow:0 0 0 6px currentColor;opacity:0}}
.ef-status--pulse .ef-status__dot::after{content:'';position:absolute;inset:0;border-radius:var(--radius-full);animation:ef-status-pulse 1.6s var(--ease-out) infinite}
.ef-status--ok .ef-status__dot::after{color:var(--success-600)}
.ef-status--warn .ef-status__dot::after{color:var(--warning-600)}
.ef-status--err .ef-status__dot::after{color:var(--danger-600)}
.ef-status--busy .ef-status__dot::after{color:var(--caramel-500)}
`;
export function StatusDot({ state = 'ok', label, pulse, style, className }) {
  injectEfCss('ef-css-status', CSS);
  return (
    <span className={`ef-status ef-status--${state}${pulse ? ' ef-status--pulse' : ''}${className ? ' ' + className : ''}`} style={style}>
      <span className="ef-status__dot"></span>
      {label ? <span>{label}</span> : null}
    </span>
  );
}
