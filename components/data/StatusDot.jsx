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
.ef-status__sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
@keyframes ef-status-pulse{0%{box-shadow:0 0 0 0 currentColor;opacity:.5}100%{box-shadow:0 0 0 6px currentColor;opacity:0}}
.ef-status--pulse .ef-status__dot::after{content:'';position:absolute;inset:0;border-radius:var(--radius-full);animation:ef-status-pulse 1.6s var(--ease-out) infinite}
.ef-status--ok .ef-status__dot::after{color:var(--success-600)}
.ef-status--warn .ef-status__dot::after{color:var(--warning-600)}
.ef-status--err .ef-status__dot::after{color:var(--danger-600)}
.ef-status--busy .ef-status__dot::after{color:var(--caramel-500)}
`;
const STATE_TEXT = { ok: 'OK', warn: 'Warning', err: 'Error', busy: 'Busy', off: 'Offline' };
export function StatusDot({ state = 'ok', label, stateLabel, pulse, style, className, ...rest }) {
  injectEfCss('ef-css-status', CSS);
  // The dot itself is colour-only, so the state must also exist as text. With a
  // visible label the state rides along visually hidden ("Error: API"); without
  // one the whole span becomes an image whose accessible name is the state.
  const stateText = stateLabel || STATE_TEXT[state] || state;
  return (
    <span {...rest} className={`ef-status ef-status--${state}${pulse ? ' ef-status--pulse' : ''}${className ? ' ' + className : ''}`} style={style}
      role={label ? undefined : 'img'} aria-label={label ? undefined : stateText}>
      <span className="ef-status__dot" aria-hidden="true"></span>
      {label ? <span><span className="ef-status__sr">{stateText}: </span>{label}</span> : null}
    </span>
  );
}
