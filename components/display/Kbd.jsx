'use client';
import React from 'react';
import { injectEfCss } from '../runtime/runtime.jsx';

const CSS = `
.ef-kbd{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:19px;padding:0 var(--space-1);border:1px solid var(--border-strong);border-bottom-width:2px;border-radius:var(--radius-xs);background:var(--surface-card);font-family:var(--font-mono);font-size:var(--text-2xs);color:var(--text-secondary);line-height:1}
.ef-kbd-group{display:inline-flex;align-items:center;gap:var(--space-1)}
`;

function joinClasses(base, className) {
  return `${base}${className ? ' ' + className : ''}`;
}

export const Kbd = React.forwardRef(function Kbd({ className, ...props }, ref) {
  injectEfCss('ef-css-kbd', CSS);
  return <kbd {...props} ref={ref} data-slot="kbd" className={joinClasses('ef-kbd', className)} />;
});

export const KbdGroup = React.forwardRef(function KbdGroup({ className, ...props }, ref) {
  injectEfCss('ef-css-kbd', CSS);
  return <span {...props} ref={ref} data-slot="kbd-group" className={joinClasses('ef-kbd-group', className)} />;
});
