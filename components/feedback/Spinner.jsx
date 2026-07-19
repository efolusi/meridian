import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
@keyframes ef-spinner{to{transform:rotate(360deg)}}
.ef-spinner{display:inline-flex;color:var(--text-muted);animation:ef-spinner .7s linear infinite}
`;
export function Spinner({ size = 16, label, style, className, ...rest }) {
  injectEfCss('ef-css-spinner', CSS);
  return (
    <span {...rest} role="status" aria-label={label || 'Loading'} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, ...style }} className={className}>
      <span className="ef-spinner"><Icon name="loader-circle" size={size} /></span>
      {label ? <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{label}</span> : null}
    </span>
  );
}
