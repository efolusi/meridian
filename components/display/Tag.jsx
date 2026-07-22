import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-tag{display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 10px;border-radius:var(--radius-sm);background:transparent;border:1px solid var(--border-strong);color:var(--text-secondary);font-family:var(--font-sans);font-size:var(--text-sm);font-weight:var(--weight-medium);white-space:nowrap;transition:background var(--dur-fast) var(--ease-out),border-color var(--dur-fast) var(--ease-out)}
.ef-tag--interactive{cursor:pointer}
.ef-tag--interactive:hover{background:var(--surface-sunken);border-color:var(--sand-400)}
.ef-tag--interactive:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-tag__body{display:inline-flex;align-items:center;gap:6px;border:none;background:transparent;padding:0;margin:0;font:inherit;color:inherit;cursor:pointer;border-radius:var(--radius-sm)}
.ef-tag__body:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-tag__x{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;margin:-3px -9px -3px -5px;border:none;border-radius:var(--radius-sm);background:transparent;color:var(--text-muted);cursor:pointer;padding:0;transition:background var(--dur-fast) var(--ease-out),color var(--dur-fast) var(--ease-out)}
.ef-tag__x:hover{background:var(--sand-200);color:var(--text-primary)}
.ef-tag__x:focus-visible{outline:none;box-shadow:var(--focus-ring)}
`;
export function Tag({ icon, onRemove, onClick, children, style, className, ...rest }) {
  injectEfCss('ef-css-tag', CSS);
  const body = (
    <React.Fragment>
      {icon ? <Icon name={icon} size={13} /> : null}
      {children}
    </React.Fragment>
  );
  const removeBtn = onRemove
    ? <button type="button" className="ef-tag__x" aria-label="Remove" onClick={e => { e.stopPropagation(); onRemove(e); }}><Icon name="x" size={12} /></button>
    : null;
  // A clickable tag has to be a real button, or the keyboard never reaches it.
  // With onRemove present the root cannot be one (interactive content must not
  // nest), so the label becomes an inner button beside the remove button.
  if (onClick && !onRemove) {
    return (
      <button type="button" className={`ef-tag ef-tag--interactive${className ? ' ' + className : ''}`} onClick={onClick} style={style} {...rest}>
        {body}
      </button>
    );
  }
  if (onClick) {
    return (
      <span className={`ef-tag ef-tag--interactive${className ? ' ' + className : ''}`} style={style} {...rest}>
        <button type="button" className="ef-tag__body" onClick={onClick}>{body}</button>
        {removeBtn}
      </span>
    );
  }
  return (
    <span className={`ef-tag${className ? ' ' + className : ''}`} style={style} {...rest}>
      {body}
      {removeBtn}
    </span>
  );
}
