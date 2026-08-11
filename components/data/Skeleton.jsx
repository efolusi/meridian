import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';

const CSS = `
@keyframes ef-skel{0%,100%{opacity:1}50%{opacity:.45}}
.ef-skel{display:block;background:var(--border-default);border-radius:var(--radius-sm);animation:ef-skel 1.4s var(--ease-in-out) infinite}
`;

export const Skeleton = React.forwardRef(function Skeleton(
  { className, ...rest },
  ref,
) {
  injectEfCss('ef-css-skel', CSS);
  return <div {...rest} ref={ref} data-slot="skeleton" className={`ef-skel${className ? ' ' + className : ''}`} />;
});
