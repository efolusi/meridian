import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
import { Icon } from '../icons/Icon.jsx';
const CSS = `
.ef-suggestions{display:flex;flex-wrap:wrap;gap:8px}
.ef-suggestion{display:inline-flex;align-items:center;gap:7px;padding:7px 13px;border:1px solid var(--border-strong);border-radius:var(--radius-full);background:var(--surface-card);cursor:pointer;font-family:var(--font-sans);font-size:13.5px;color:var(--text-secondary);transition:color var(--dur-fast) var(--ease-out),border-color var(--dur-fast) var(--ease-out),background var(--dur-fast) var(--ease-out)}
.ef-suggestion:hover{color:var(--text-primary);border-color:var(--text-muted);background:var(--surface-subtle)}
.ef-suggestion:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-suggestion__icon{display:inline-flex;color:var(--text-muted)}
`;
export function Suggestions({ items = [], onPick, style, className }) {
  injectEfCss('ef-css-suggestions', CSS);
  return (
    <div className={`ef-suggestions${className ? ' ' + className : ''}`} style={style}>
      {items.map((it, i) => {
        const label = typeof it === 'string' ? it : it.label;
        const icon = typeof it === 'string' ? null : it.icon;
        return (
          <button key={i} type="button" className="ef-suggestion" onClick={() => onPick && onPick(label, i)}>
            {icon ? <span className="ef-suggestion__icon"><Icon name={icon} size={14} /></span> : null}
            {label}
          </button>
        );
      })}
    </div>
  );
}
