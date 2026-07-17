import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-link{display:inline-flex;align-items:center;gap:4px;color:var(--text-link);text-decoration:none;font-weight:var(--weight-medium);cursor:pointer;border-radius:var(--radius-sm);transition:color var(--dur-fast) var(--ease-out)}
.ef-link:hover{color:var(--accent-hover);text-decoration:underline;text-underline-offset:3px}
.ef-link:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-link--quiet{color:var(--text-secondary)}
.ef-link--quiet:hover{color:var(--text-primary)}
.ef-link--standalone{font-weight:var(--weight-semibold)}
`;
export function Link({ href = '#', external, icon, variant = 'default', standalone, children, style, className, ...rest }) {
  injectEfCss('ef-css-link', CSS);
  return (
    <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}
      className={`ef-link${variant === 'quiet' ? ' ef-link--quiet' : ''}${standalone ? ' ef-link--standalone' : ''}${className ? ' ' + className : ''}`} style={style} {...rest}>
      {icon ? <Icon name={icon} size={14} /> : null}
      {children}
      {external ? <Icon name="arrow-up-right" size={13} /> : standalone ? <Icon name="arrow-right" size={14} /> : null}
    </a>
  );
}
