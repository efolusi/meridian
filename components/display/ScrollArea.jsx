import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-scrollarea{position:relative;overflow:hidden}
.ef-scrollarea__viewport{width:100%;height:100%;overflow:auto;scrollbar-width:thin;scrollbar-color:var(--border-strong) transparent}
.ef-scrollarea__viewport::-webkit-scrollbar{width:9px;height:9px}
.ef-scrollarea__viewport::-webkit-scrollbar-track{background:transparent}
.ef-scrollarea__viewport::-webkit-scrollbar-thumb{background:var(--border-strong);border-radius:var(--radius-full);border:2px solid transparent;background-clip:content-box}
.ef-scrollarea__viewport::-webkit-scrollbar-thumb:hover{background:var(--text-muted);border:2px solid transparent;background-clip:content-box}
.ef-scrollarea__bar{position:absolute;pointer-events:none;opacity:0}
`;
export const ScrollArea = React.forwardRef(function ScrollArea({ maxHeight, height, children, style, className, ...rest }, ref) {
  injectEfCss('ef-css-scrollarea', CSS);
  const nodes = React.Children.toArray(children);
  const bars = nodes.filter(child => React.isValidElement(child) && child.type === ScrollBar);
  const content = nodes.filter(child => !(React.isValidElement(child) && child.type === ScrollBar));
  return <div {...rest} ref={ref} data-slot="scroll-area" className={`ef-scrollarea${className ? ' ' + className : ''}`} style={{ maxHeight, height, ...style }}><div data-slot="scroll-area-viewport" className="ef-scrollarea__viewport" style={{ maxHeight, height }}>{content}</div>{bars}</div>;
});
export const ScrollBar = React.forwardRef(function ScrollBar({ orientation = 'vertical', className, ...props }, ref) {
  return <span {...props} ref={ref} aria-hidden="true" data-slot="scroll-area-scrollbar" data-orientation={orientation} className={`ef-scrollarea__bar${className ? ' ' + className : ''}`} />;
});
