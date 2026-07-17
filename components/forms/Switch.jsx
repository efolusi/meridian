import React from 'react';
import { injectEfCss } from './Button.jsx';
const CSS = `
.ef-switch{display:inline-flex;align-items:center;gap:10px;cursor:pointer;user-select:none}
.ef-switch--disabled{opacity:.45;cursor:not-allowed}
.ef-switch__input{position:absolute;opacity:0;width:0;height:0}
.ef-switch__track{position:relative;flex:none;width:36px;height:21px;border-radius:var(--radius-full);background:var(--border-strong);transition:background var(--dur-med) var(--ease-out)}
.ef-switch__track::after{content:'';position:absolute;top:2.5px;left:2.5px;width:16px;height:16px;border-radius:var(--radius-full);background:var(--surface-card);box-shadow:var(--shadow-sm);transition:transform var(--dur-med) var(--ease-spring)}
.ef-switch__input:checked+.ef-switch__track{background:var(--accent)}
.ef-switch__input:checked+.ef-switch__track::after{transform:translateX(15px)}
.ef-switch__input:focus-visible+.ef-switch__track{box-shadow:var(--focus-ring)}
.ef-switch--sm .ef-switch__track{width:30px;height:18px}
.ef-switch--sm .ef-switch__track::after{width:13px;height:13px;top:2.5px}
.ef-switch--sm .ef-switch__input:checked+.ef-switch__track::after{transform:translateX(12px)}
.ef-switch__label{font-size:var(--text-md);color:var(--text-primary)}
`;
export function Switch({ label, size = 'md', disabled, style, className, ...rest }) {
  injectEfCss('ef-css-switch', CSS);
  return (
    <label className={`ef-switch ef-switch--${size}${disabled ? ' ef-switch--disabled' : ''}${className ? ' ' + className : ''}`} style={style}>
      <input type="checkbox" role="switch" className="ef-switch__input" disabled={disabled} {...rest} />
      <span className="ef-switch__track"></span>
      {label ? <span className="ef-switch__label">{label}</span> : null}
    </label>
  );
}
