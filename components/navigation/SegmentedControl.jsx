'use client';
import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from '../runtime/runtime.jsx';
const CSS = `
.ef-seg{display:inline-flex;gap:var(--space-0-5);padding:var(--space-0-5);border-radius:var(--radius-full)}
.ef-seg__opt{display:inline-flex;align-items:center;gap:var(--space-2);height:var(--control-h-sm);padding:0 var(--space-3);border:1px solid transparent;border-radius:var(--radius-full);background:none;cursor:pointer;font-family:var(--font-sans);font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-secondary);transition:background var(--dur-fast) var(--ease-enter),color var(--dur-fast) var(--ease-enter)}
.ef-seg__opt:hover:not(.ef-seg__opt--active){color:var(--text-primary)}
.ef-seg__opt--active{background:color-mix(in srgb,var(--material-tint) calc(var(--material-thick) * 100%),transparent);border-color:var(--border-strong);box-shadow:inset 0 1px 0 color-mix(in srgb,var(--text-on-media) calc(var(--material-spec) * 100%),transparent),var(--shadow-sm);color:var(--text-primary);font-weight:var(--weight-semibold)}
.ef-seg__opt:focus-visible{outline:2px solid transparent;box-shadow:var(--focus-ring)}
.ef-seg__opt:disabled{opacity:.4;cursor:not-allowed}
@media (pointer:coarse){.ef-seg__opt{height:var(--tap-min)}}
@media (forced-colors:active){.ef-seg__opt--active{background:Highlight;color:HighlightText;forced-color-adjust:none}}
`;
export function SegmentedControl({ options, value, onChange, style, className, ...rest }) {
  injectEfCss('ef-css-seg', CSS);
  return (
    <div {...rest} role="group" className={`ef-seg ef-glass ef-glass--clear${className ? ' ' + className : ''}`} style={style}>
      {options.map(o => {
        const opt = typeof o === 'string' ? { id: o, label: o } : o;
        return (
          <button key={opt.id} type="button" className={`ef-seg__opt${value === opt.id ? ' ef-seg__opt--active' : ''}`} aria-pressed={value === opt.id} disabled={opt.disabled} onClick={() => onChange && onChange(opt.id)}>
            {opt.icon ? <Icon name={opt.icon} size={16} /> : null}{opt.label}
          </button>
        );
      })}
    </div>
  );
}
