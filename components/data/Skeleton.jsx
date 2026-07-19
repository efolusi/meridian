import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
@keyframes ef-skel{0%,100%{opacity:1}50%{opacity:.45}}
.ef-skel{display:block;background:var(--border-default);border-radius:var(--radius-sm);animation:ef-skel 1.4s var(--ease-in-out) infinite}
.ef-skel--circle{border-radius:var(--radius-full)}
`;
export function Skeleton({ variant = 'text', width, height, lines = 1, style, className, ...rest }) {
  injectEfCss('ef-css-skel', CSS);
  const h = height != null ? height : variant === 'text' ? 12 : variant === 'circle' ? (width || 32) : 64;
  const w = width != null ? width : variant === 'circle' ? h : '100%';
  if (variant === 'text' && lines > 1) {
    return (
      <span {...rest} style={{ display: 'flex', flexDirection: 'column', gap: 8, ...style }} className={className}>
        {Array.from({ length: lines }, (_, i) => (
          <span key={i} className="ef-skel" style={{ width: i === lines - 1 ? '60%' : w, height: h }}></span>
        ))}
      </span>
    );
  }
  return <span className={`ef-skel${variant === 'circle' ? ' ef-skel--circle' : ''}${className ? ' ' + className : ''}`} style={{ width: w, height: h, ...style }}></span>;
}
