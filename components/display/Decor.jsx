'use client';
import React from 'react';
import { injectEfCss } from '../runtime/runtime.jsx';

// The parent sets `position:relative; isolation:isolate`; the block sits at z-index:-1 inside it.
// Colours come from the accent group (rebrand and dark mode reach them) and the text tokens, at low strength, and tests/decor.test.jsx measures body text over the strongest point.
const CSS = `
.ef-decor{position:absolute;inset:0;z-index:-1;pointer-events:none;background-repeat:no-repeat}
.ef-decor[data-pattern="mesh"]{background-image:radial-gradient(60% 50% at 15% 10%,color-mix(in oklab,var(--accent-subtle-border) 70%,transparent),transparent 70%),radial-gradient(55% 45% at 85% 20%,color-mix(in oklab,var(--accent-subtle-border) 50%,transparent),transparent 70%),radial-gradient(70% 50% at 50% 100%,color-mix(in oklab,var(--accent) 6%,transparent),transparent 70%)}
.ef-decor[data-pattern="grid"]{background-repeat:repeat;background-size:32px 32px;background-image:linear-gradient(to right,color-mix(in oklab,var(--text-muted) 16%,transparent) 1px,transparent 1px),linear-gradient(to bottom,color-mix(in oklab,var(--text-muted) 16%,transparent) 1px,transparent 1px)}
.ef-decor[data-pattern="dots"]{background-repeat:repeat;background-size:20px 20px;background-image:radial-gradient(circle,color-mix(in oklab,var(--text-muted) 22%,transparent) 1px,transparent 1.5px)}
.ef-decor[data-pattern="noise"]{background-repeat:repeat;background-size:7px 7px,11px 11px,13px 13px;background-position:0 0,3px 5px,6px 2px;background-image:radial-gradient(circle,color-mix(in oklab,var(--text-muted) 12%,transparent) .6px,transparent .8px),radial-gradient(circle,color-mix(in oklab,var(--text-muted) 10%,transparent) .6px,transparent .8px),radial-gradient(circle,color-mix(in oklab,var(--text-muted) 8%,transparent) .6px,transparent .8px)}
.ef-decor[data-fade]{-webkit-mask-image:linear-gradient(to bottom,black 55%,transparent);mask-image:linear-gradient(to bottom,black 55%,transparent)}
@media (forced-colors:active){.ef-decor{display:none}}
`;

/** A decorative backdrop (gradient mesh, grain, grid or dots) drawn in CSS only. Hidden from assistive technology, no motion, hidden in forced-colors mode. */
export const Decor = React.forwardRef(function Decor({ pattern = 'mesh', fade = false, className, ...rest }, ref) {
  injectEfCss('ef-css-decor', CSS);
  return <div {...rest} ref={ref} aria-hidden="true" data-slot="decor" data-pattern={pattern} data-fade={fade ? '' : undefined} className={className ? `ef-decor ${className}` : 'ef-decor'} />;
});
