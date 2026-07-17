import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from './Button.jsx';
const CSS = `
.ef-check{display:inline-flex;align-items:flex-start;gap:10px;cursor:pointer;user-select:none}
.ef-check--disabled{opacity:.45;cursor:not-allowed}
.ef-check__input{position:absolute;opacity:0;width:0;height:0}
.ef-check__box{display:inline-flex;align-items:center;justify-content:center;flex:none;width:18px;height:18px;margin-top:1px;border:1.5px solid var(--border-strong);border-radius:var(--radius-sm);background:var(--surface-card);color:var(--accent-contrast);transition:background var(--dur-fast) var(--ease-out),border-color var(--dur-fast) var(--ease-out),transform var(--dur-med) var(--ease-spring)}
.ef-check__box svg{opacity:0;transform:scale(.5);transition:opacity var(--dur-fast) var(--ease-out),transform var(--dur-med) var(--ease-spring)}
.ef-check__input:checked+.ef-check__box{background:var(--accent);border-color:var(--accent)}
.ef-check__input:checked+.ef-check__box svg{opacity:1;transform:scale(1)}
.ef-check:active .ef-check__box{transform:scale(.95)}
.ef-check__input:focus-visible+.ef-check__box{box-shadow:var(--focus-ring)}
.ef-check__label{font-size:var(--text-md);color:var(--text-primary);line-height:1.4}
.ef-check__desc{display:block;font-size:var(--text-sm);color:var(--text-muted)}
`;
export function Checkbox({ label, description, disabled, style, className, ...rest }) {
  injectEfCss('ef-css-check', CSS);
  return (
    <label className={`ef-check${disabled ? ' ef-check--disabled' : ''}${className ? ' ' + className : ''}`} style={style}>
      <input type="checkbox" className="ef-check__input" disabled={disabled} {...rest} />
      <span className="ef-check__box"><Icon name="check" size={13} strokeWidth={3} /></span>
      {label ? <span className="ef-check__label">{label}{description ? <span className="ef-check__desc">{description}</span> : null}</span> : null}
    </label>
  );
}
