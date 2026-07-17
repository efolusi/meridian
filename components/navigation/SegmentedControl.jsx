import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-seg{display:inline-flex;gap:2px;padding:2px;background:var(--surface-sunken);border-radius:var(--radius-md)}
.ef-seg__opt{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 12px;border:1px solid transparent;border-radius:6px;background:none;cursor:pointer;font-family:var(--font-sans);font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-secondary);transition:background var(--dur-fast) var(--ease-out),color var(--dur-fast) var(--ease-out)}
.ef-seg__opt:hover:not(.ef-seg__opt--active){color:var(--text-primary)}
.ef-seg__opt--active{background:var(--surface-card);border-color:var(--border-strong);color:var(--text-primary);font-weight:var(--weight-semibold)}
.ef-seg__opt:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-seg__opt:disabled{opacity:.4;cursor:not-allowed}
`;
export function SegmentedControl({ options, value, onChange, style, className }) {
  injectEfCss('ef-css-seg', CSS);
  return (
    <div role="group" className={`ef-seg${className ? ' ' + className : ''}`} style={style}>
      {options.map(o => {
        const opt = typeof o === 'string' ? { id: o, label: o } : o;
        return (
          <button key={opt.id} className={`ef-seg__opt${value === opt.id ? ' ef-seg__opt--active' : ''}`} aria-pressed={value === opt.id} disabled={opt.disabled} onClick={() => onChange && onChange(opt.id)}>
            {opt.icon ? <Icon name={opt.icon} size={14} /> : null}{opt.label}
          </button>
        );
      })}
    </div>
  );
}
