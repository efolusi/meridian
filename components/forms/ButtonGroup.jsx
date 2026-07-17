import React from 'react';
import { injectEfCss } from './Button.jsx';
const CSS = `
.ef-btn-group{display:inline-flex;align-items:stretch;isolation:isolate}
.ef-btn-group>*:not(:first-child){border-top-left-radius:0!important;border-bottom-left-radius:0!important;margin-left:-1px}
.ef-btn-group>*:not(:last-child){border-top-right-radius:0!important;border-bottom-right-radius:0!important}
.ef-btn-group>*:hover,.ef-btn-group>*:focus-visible{z-index:1}
`;
export function ButtonGroup({ children, style, className, ...rest }) {
  injectEfCss('ef-css-btn-group', CSS);
  return <div role="group" className={`ef-btn-group${className ? ' ' + className : ''}`} style={style} {...rest}>{children}</div>;
}
