'use client';
import React from 'react';
import { injectEfCss } from '../runtime/runtime.jsx';
import { Icon } from '../icons/Icon.jsx';
const CSS = `
.ef-reasoning{border:1px solid var(--border-default);border-radius:var(--radius-md);background:var(--surface-subtle);overflow:hidden}
.ef-reasoning__head{display:flex;align-items:center;gap:var(--space-2);width:100%;padding:var(--space-2) var(--space-3);border:none;background:none;cursor:pointer;text-align:start;font-family:var(--font-sans);font-size:var(--text-sm);font-weight:500;color:var(--text-secondary)}
.ef-reasoning__head:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-reasoning__glyph{display:inline-flex;color:var(--text-muted)}
.ef-reasoning--streaming .ef-reasoning__glyph{animation:ef-reasoning-pulse 1.2s var(--ease-enter) infinite}
@keyframes ef-reasoning-pulse{0%,100%{opacity:1}50%{opacity:var(--ef-pulse-floor)}}
.ef-reasoning__chev{margin-inline-start:auto;display:inline-flex;color:var(--text-muted);transition:transform var(--dur-base) var(--ease-enter)}
.ef-reasoning--open .ef-reasoning__chev{transform:rotate(180deg)}
.ef-reasoning__body{padding:var(--space-0-5) var(--space-4) var(--space-3);font-size:var(--text-md);line-height:1.65;color:var(--text-secondary);white-space:pre-wrap;border-top:1px dashed var(--border-default);padding-top:var(--space-3);margin:0 0}
`;
export function Reasoning({ streaming, duration, defaultOpen, open, onOpenChange, label, children, style, className, ...rest }) {
  injectEfCss('ef-css-reasoning', CSS);
  const [un, setUn] = React.useState(!!defaultOpen);
  const isOpen = open !== undefined ? open : un;
  const flip = () => {
    if (open === undefined) setUn(!isOpen);
    if (onOpenChange) onOpenChange(!isOpen);
  };
  const head = label || (streaming ? 'Thinking…' : duration ? 'Thought for ' + duration : 'Reasoning');
  return (
    <div {...rest} className={`ef-reasoning${isOpen ? ' ef-reasoning--open' : ''}${streaming ? ' ef-reasoning--streaming' : ''}${className ? ' ' + className : ''}`} style={style}>
      <button type="button" className="ef-reasoning__head" aria-expanded={isOpen} onClick={flip}>
        <span className="ef-reasoning__glyph"><Icon name="brain" size={16} /></span>
        {head}
        <span className="ef-reasoning__chev"><Icon name="chevron-down" size={16} /></span>
      </button>
      {isOpen ? <div className="ef-reasoning__body">{children}</div> : null}
    </div>
  );
}
