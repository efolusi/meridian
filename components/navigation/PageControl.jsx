import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-dots{display:inline-flex;align-items:center}
.ef-dots__dot{position:relative;width:24px;height:24px;padding:0;border:none;background:transparent;cursor:pointer}
.ef-dots__dot::before{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:7px;height:7px;border-radius:var(--radius-full);background:var(--border-strong);transition:background var(--dur-fast) var(--ease-out),width var(--dur-med) var(--ease-out)}
.ef-dots__dot:hover::before{background:var(--sand-400)}
.ef-dots__dot--on::before{width:20px;background:var(--accent)}
.ef-dots__dot:focus-visible{outline:none}
.ef-dots__dot:focus-visible::before{box-shadow:var(--focus-ring)}
`;
export function PageControl({ count, index = 0, onChange, label = 'Page', style, className, ...rest }) {
  injectEfCss('ef-css-dots', CSS);
  return (
    <div {...rest} role="tablist" aria-label={label} className={`ef-dots${className ? ' ' + className : ''}`} style={style}>
      {Array.from({ length: count }, (_, i) => (
        <button key={i} role="tab" aria-selected={i === index} aria-label={`${label} ${i + 1} of ${count}`}
          className={`ef-dots__dot${i === index ? ' ef-dots__dot--on' : ''}`} onClick={() => onChange && onChange(i)} />
      ))}
    </div>
  );
}
