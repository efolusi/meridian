import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { Tooltip } from '../feedback/Tooltip.jsx';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-toolbar{display:inline-flex;align-items:center;gap:2px;padding:3px;background:var(--surface-card);border:1px solid var(--border-strong);border-radius:var(--radius-md)}
.ef-toolbar__btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:28px;min-width:28px;padding:0 7px;border:none;border-radius:6px;background:none;cursor:pointer;color:var(--text-secondary);font-family:var(--font-sans);font-size:var(--text-sm);font-weight:var(--weight-medium);transition:background var(--dur-fast) var(--ease-out),color var(--dur-fast) var(--ease-out)}
.ef-toolbar__btn:hover:not(:disabled){background:var(--surface-sunken);color:var(--text-primary)}
.ef-toolbar__btn--active{background:var(--accent);color:var(--accent-contrast)}
.ef-toolbar__btn--active:hover:not(:disabled){background:var(--accent-hover);color:var(--accent-contrast)}
.ef-toolbar__btn:disabled{opacity:.4;cursor:not-allowed}
.ef-toolbar__btn:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-toolbar__sep{width:1px;height:18px;background:var(--border-default);margin:0 4px}
`;
export function Toolbar({ items, value, onChange, label, style, className }) {
  injectEfCss('ef-css-toolbar', CSS);
  const active = Array.isArray(value) ? value : value != null ? [value] : [];
  return (
    <div role="toolbar" aria-label={label} className={`ef-toolbar${className ? ' ' + className : ''}`} style={style}>
      {items.map((it, i) => {
        if (it === 'separator') return <span key={'s' + i} className="ef-toolbar__sep"></span>;
        const btn = (
          <button key={it.id} disabled={it.disabled} aria-pressed={active.includes(it.id) || undefined}
            className={`ef-toolbar__btn${active.includes(it.id) ? ' ef-toolbar__btn--active' : ''}`}
            onClick={() => { if (onChange) onChange(it.id); if (it.onClick) it.onClick(); }}>
            {it.icon ? <Icon name={it.icon} size={15} /> : null}
            {it.label || null}
          </button>
        );
        return it.tip ? <Tooltip key={it.id} label={it.tip}>{btn}</Tooltip> : btn;
      })}
    </div>
  );
}
