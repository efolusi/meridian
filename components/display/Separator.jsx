import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';

const CSS = `
.ef-separator{flex:none;border:0;background:var(--border-default)}
.ef-separator[data-orientation="horizontal"]{width:100%;height:1px}
.ef-separator[data-orientation="vertical"]{width:1px;height:100%;min-height:1em;align-self:stretch}
`;

export const Separator = React.forwardRef(function Separator(
  { orientation = 'horizontal', decorative = true, className, ...rest },
  ref,
) {
  injectEfCss('ef-css-separator', CSS);
  const axis = orientation === 'vertical' ? 'vertical' : 'horizontal';
  return (
    <div
      {...rest}
      ref={ref}
      role={decorative ? 'none' : 'separator'}
      aria-orientation={!decorative && axis === 'vertical' ? 'vertical' : undefined}
      data-orientation={axis}
      className={`ef-separator${className ? ` ${className}` : ''}`}
    />
  );
});
