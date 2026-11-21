'use client';
import React from 'react';
import { injectEfCss } from '../runtime/runtime.jsx';

const CSS = `
@keyframes ef-skel{0%,100%{opacity:1}50%{opacity:.45}}
.ef-skel{display:block;background:var(--border-default);border-radius:var(--radius-sm);animation:ef-skel 1.4s var(--ease-standard) infinite}
.ef-skel[data-shimmer]{background:linear-gradient(90deg,var(--border-default) 0%,var(--surface-sunken) 50%,var(--border-default) 100%) 100% 0/200% 100%;animation:ef-skel-shimmer 1.6s linear infinite}
@keyframes ef-skel-shimmer{to{background-position:-100% 0}}
@media (prefers-reduced-motion:reduce){.ef-skel[data-shimmer]{background:var(--border-default);animation:none}}
`;

export const Skeleton = React.forwardRef(function Skeleton(
  { shimmer = false, className, ...rest },
  ref,
) {
  injectEfCss('ef-css-skel', CSS);
  return <div {...rest} ref={ref} data-slot="skeleton" data-shimmer={shimmer ? '' : undefined} className={`ef-skel${className ? ' ' + className : ''}`} />;
});
