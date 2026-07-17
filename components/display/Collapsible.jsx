import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
import { Icon } from '../icons/Icon.jsx';
const CSS = `
.ef-collapsible__trigger{display:flex;align-items:center;gap:8px;width:100%;padding:7px 0;border:none;background:none;cursor:pointer;text-align:left;font-family:var(--font-sans);font-size:var(--text-md);font-weight:600;color:var(--text-primary);border-radius:var(--radius-sm)}
.ef-collapsible__trigger:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-collapsible__chev{display:inline-flex;color:var(--text-muted);transition:transform var(--dur-med) var(--ease-out)}
.ef-collapsible--open .ef-collapsible__chev{transform:rotate(90deg)}
.ef-collapsible__body{padding:2px 0 10px 24px;animation:ef-collapsible-in var(--dur-fast) var(--ease-out)}
@keyframes ef-collapsible-in{from{opacity:0;transform:translateY(-2px)}}
`;
export function Collapsible({ title, defaultOpen, open, onOpenChange, children, style, className }) {
  injectEfCss('ef-css-collapsible', CSS);
  const [un, setUn] = React.useState(!!defaultOpen);
  const isOpen = open !== undefined ? open : un;
  const flip = () => {
    if (open === undefined) setUn(!isOpen);
    if (onOpenChange) onOpenChange(!isOpen);
  };
  return (
    <div className={`ef-collapsible${isOpen ? ' ef-collapsible--open' : ''}${className ? ' ' + className : ''}`} style={style}>
      <button type="button" className="ef-collapsible__trigger" aria-expanded={isOpen} onClick={flip}>
        <span className="ef-collapsible__chev"><Icon name="chevron-right" size={16} /></span>
        {title}
      </button>
      {isOpen ? <div className="ef-collapsible__body">{children}</div> : null}
    </div>
  );
}
