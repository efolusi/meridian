import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
// A separator with no margin is never what a caller wants: every consumer had
// to remember spacing, and even this repo's own showcases patched it inline
// with two different magic numbers (20px and 10px). Default to one step on the
// space scale; an explicit style or class still wins.
const CSS = `
.ef-divider{display:flex;align-items:center;gap:12px;border:none;margin:var(--space-4) 0}
.ef-divider__line{flex:1;height:1px;background:var(--border-default)}
.ef-divider__label{font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:0.06em;text-transform:uppercase;color:var(--text-muted);white-space:nowrap}
.ef-divider--vertical{display:inline-flex;width:1px;align-self:stretch;background:var(--border-default)}
`;
export function Divider({ label, vertical, style, className, ...rest }) {
  injectEfCss('ef-css-divider', CSS);
  if (vertical) return <span {...rest} className={`ef-divider--vertical${className ? ' ' + className : ''}`} style={style}></span>;
  return (
    <div role="separator" className={`ef-divider${className ? ' ' + className : ''}`} style={style}>
      <span className="ef-divider__line"></span>
      {label ? <React.Fragment><span className="ef-divider__label">{label}</span><span className="ef-divider__line"></span></React.Fragment> : null}
    </div>
  );
}
