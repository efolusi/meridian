import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-tag{display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 10px;border-radius:var(--radius-sm);background:transparent;border:1px solid var(--border-strong);color:var(--text-secondary);font-size:var(--text-sm);font-weight:var(--weight-medium);white-space:nowrap;transition:background var(--dur-fast) var(--ease-out),border-color var(--dur-fast) var(--ease-out)}
.ef-tag--interactive{cursor:pointer}
.ef-tag--interactive:hover{background:var(--surface-sunken);border-color:var(--sand-400)}
.ef-tag__x{display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;margin-right:-4px;border:none;border-radius:var(--radius-sm);background:transparent;color:var(--text-muted);cursor:pointer;padding:0;transition:background var(--dur-fast) var(--ease-out),color var(--dur-fast) var(--ease-out)}
.ef-tag__x:hover{background:var(--sand-200);color:var(--text-primary)}
.ef-tag__x:focus-visible{outline:none;box-shadow:var(--focus-ring)}
`;
export function Tag({ icon, onRemove, onClick, children, style, className, ...rest }) {
  injectEfCss('ef-css-tag', CSS);
  return (
    <span className={`ef-tag${onClick ? ' ef-tag--interactive' : ''}${className ? ' ' + className : ''}`} onClick={onClick} style={style} {...rest}>
      {icon ? <Icon name={icon} size={13} /> : null}
      {children}
      {onRemove ? <button className="ef-tag__x" aria-label="Remove" onClick={e => { e.stopPropagation(); onRemove(e); }}><Icon name="x" size={12} /></button> : null}
    </span>
  );
}
