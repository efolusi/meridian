import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-loader{display:inline-flex;align-items:baseline;font-family:var(--font-sans);font-size:13.5px;color:var(--text-muted)}
.ef-loader--pulse{animation:ef-loader-pulse var(--ef-loader-dur,1.4s) ease-in-out infinite both}
@keyframes ef-loader-pulse{0%,100%{opacity:.4}50%{opacity:1}}
.ef-loader--shimmer{background:linear-gradient(90deg,color-mix(in oklab,currentColor 40%,transparent) 0%,color-mix(in oklab,currentColor 40%,transparent) 35%,currentColor 50%,color-mix(in oklab,currentColor 40%,transparent) 65%,color-mix(in oklab,currentColor 40%,transparent) 100%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:ef-loader-shimmer var(--ef-loader-dur,2.2s) linear infinite}
@keyframes ef-loader-shimmer{0%{background-position:100% 0}100%{background-position:-100% 0}}
.ef-loader__dots{margin-left:2px;display:inline-flex;-webkit-text-fill-color:currentColor}
.ef-loader__dots span{animation:ef-loader-dot var(--ef-loader-dur,1.4s) ease-in-out infinite both}
.ef-loader__dots span:nth-child(2){animation-delay:calc(var(--ef-loader-dur,1.4s)*.14)}
.ef-loader__dots span:nth-child(3){animation-delay:calc(var(--ef-loader-dur,1.4s)*.28)}
@keyframes ef-loader-dot{0%,80%,100%{opacity:0}40%{opacity:1}}
`;
export function Loader({ variant = 'pulse', dots, duration, children = 'Thinking', style, className }) {
  injectEfCss('ef-css-loader', CSS);
  const vars = duration ? { '--ef-loader-dur': duration + 's' } : null;
  return (
    <span role="status" aria-label={typeof children === 'string' ? children : 'Loading'} className={`ef-loader ef-loader--${variant}${className ? ' ' + className : ''}`} style={{ ...vars, ...style }}>
      {children}
      {dots ? <span className="ef-loader__dots" aria-hidden="true"><span>.</span><span>.</span><span>.</span></span> : null}
    </span>
  );
}
