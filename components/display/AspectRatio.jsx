'use client';
import React from 'react';
import { injectEfCss, mergeRefs, styleRef } from '../forms/Button.jsx';

// The ratio is set through the CSSOM, not a style attribute (strict CSP).
const CSS = `
.ef-aspect{position:relative;width:100%}
.ef-aspect__inner{position:absolute;inset:0}
`;

export const AspectRatio = React.forwardRef(function AspectRatio({ ratio, children, style, className, ...rest }, ref) {
  injectEfCss('ef-css-aspect', CSS);
  return (
    <div {...rest} ref={mergeRefs(ref, styleRef({ 'aspect-ratio': String(Math.round(ratio * 1000) / 1000) }))} className={`ef-aspect${className ? ' ' + className : ''}`} style={style}>
      <div className="ef-aspect__inner">{children}</div>
    </div>
  );
});
