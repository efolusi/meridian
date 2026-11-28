'use client';
import React from 'react';
import { injectEfCss } from '../runtime/runtime.jsx';
const CSS = `
.ef-dots{display:inline-flex;align-items:center}
.ef-dots__dot{position:relative;width:24px;height:24px;padding:0;border:none;background:transparent;cursor:pointer}
.ef-dots__dot::before{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:7px;height:7px;border-radius:var(--radius-full);background:var(--border-strong);transition:background var(--dur-fast) var(--ease-enter),width var(--dur-base) var(--ease-enter)}
@media (hover:hover){.ef-dots__dot:hover::before{background:var(--sand-400)}}
.ef-dots__dot--on::before{width:20px;background:var(--accent-edge)}
.ef-dots__dot:focus-visible{outline:none}
.ef-dots__dot:focus-visible::before{box-shadow:var(--focus-ring)}
/* coarse pointers get the 44px touch target, like form controls do through --control-h-* */
@media (pointer:coarse){.ef-dots{flex-wrap:wrap;justify-content:center;max-width:100%}.ef-dots__dot{width:var(--tap-min);height:var(--tap-min)}}
/* Reduced motion: nothing moves or resizes; the end state is shown at once. */
@media (prefers-reduced-motion:reduce){.ef-dots__dot::before{transition:background var(--dur-fast) var(--ease-enter)}}
`;
export function PageControl({ count, index = 0, onChange, label = 'Page', style, className, ...rest }) {
  injectEfCss('ef-css-dots', CSS);
  return (
    <div {...rest} role="tablist" aria-label={label} className={`ef-dots${className ? ' ' + className : ''}`} style={style}>
      {Array.from({ length: count }, (_, i) => (
        <button key={i} type="button" role="tab" aria-selected={i === index} aria-label={`${label} ${i + 1} of ${count}`}
          className={`ef-dots__dot${i === index ? ' ef-dots__dot--on' : ''}`} onClick={() => onChange && onChange(i)} />
      ))}
    </div>
  );
}
