import React from 'react';
import { injectEfCss } from './Button.jsx';
const CSS = `
.ef-radio{display:inline-flex;align-items:flex-start;gap:10px;cursor:pointer;user-select:none}
.ef-radio--disabled{opacity:.45;cursor:not-allowed}
.ef-radio__input{position:absolute;opacity:0;width:0;height:0}
.ef-radio__dot{display:inline-flex;align-items:center;justify-content:center;flex:none;width:18px;height:18px;margin-top:1px;border:1.5px solid var(--border-strong);border-radius:var(--radius-full);background:var(--surface-card);transition:border-color var(--dur-fast) var(--ease-out),transform var(--dur-med) var(--ease-spring)}
.ef-radio__dot::after{content:'';width:8px;height:8px;border-radius:var(--radius-full);background:var(--accent);opacity:0;transform:scale(.4);transition:opacity var(--dur-fast) var(--ease-out),transform var(--dur-med) var(--ease-spring)}
.ef-radio__input:checked+.ef-radio__dot{border-color:var(--accent)}
.ef-radio__input:checked+.ef-radio__dot::after{opacity:1;transform:scale(1)}
.ef-radio:active .ef-radio__dot{transform:scale(.95)}
.ef-radio__input:focus-visible+.ef-radio__dot{box-shadow:var(--focus-ring)}
.ef-radio__label{font-size:var(--text-md);color:var(--text-primary);line-height:1.4}
.ef-radio__desc{display:block;font-size:var(--text-sm);color:var(--text-muted)}
`;
export function Radio({ label, description, disabled, style, className, ...rest }) {
  injectEfCss('ef-css-radio', CSS);
  return (
    <label className={`ef-radio${disabled ? ' ef-radio--disabled' : ''}${className ? ' ' + className : ''}`} style={style}>
      <input type="radio" className="ef-radio__input" disabled={disabled} {...rest} />
      <span className="ef-radio__dot"></span>
      {label ? <span className="ef-radio__label">{label}{description ? <span className="ef-radio__desc">{description}</span> : null}</span> : null}
    </label>
  );
}
