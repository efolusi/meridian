'use client';
import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from '../runtime/runtime.jsx';
// A link in running text is underlined, always: the link colour is 2.43:1 against the body ink in light and
// 1.88:1 in dark, under the 3:1 that lets colour alone mark it (WCAG 1.4.1). Hover deepens the hue and keeps
// the underline. Only the standalone call to action, which sits alone with an arrow, goes without.
const CSS = `
.ef-link{display:inline-flex;align-items:center;gap:var(--gap-label-icon-sm);color:var(--text-link);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.2em;font-weight:var(--weight-medium);cursor:pointer;border-radius:var(--radius-sm);transition:color var(--dur-fast) var(--ease-enter)}
.ef-link:hover{color:var(--text-link-hover);text-decoration-thickness:2px}
.ef-link:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-link--quiet{color:var(--text-secondary)}
.ef-link--quiet:hover{color:var(--text-primary)}
.ef-link--standalone{font-weight:var(--weight-semibold);text-decoration:none}
.ef-link--standalone:hover{text-decoration:none}
`;
export function Link({ href = '#', external, icon, variant = 'default', standalone, children, style, className, ...rest }) {
  injectEfCss('ef-css-link', CSS);
  return (
    <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}
      className={`ef-link${variant === 'quiet' ? ' ef-link--quiet' : ''}${standalone ? ' ef-link--standalone' : ''}${className ? ' ' + className : ''}`} style={style} {...rest}>
      {icon ? <Icon name={icon} size={16} /> : null}
      {children}
      {external ? <Icon name="arrow-up-right" size={12} /> : standalone ? <Icon name="arrow-right" size={16} /> : null}
    </a>
  );
}
