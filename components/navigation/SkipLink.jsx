import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
/* Off-screen rather than display:none or visibility:hidden: both of those
   remove the link from the focus order entirely, which is the one thing a skip
   link must never do. Clip-path keeps it reachable by Tab while invisible. */
.ef-skip{position:absolute;inset-inline-start:var(--space-4);inset-block-start:var(--space-4);z-index:var(--z-modal);display:inline-flex;align-items:center;height:var(--control-h-md);min-height:var(--tap-min);padding:0 14px;border:1px solid var(--border-strong);border-radius:var(--radius-sm);background:var(--surface-card);color:var(--text-primary);font-family:var(--font-sans);font-size:var(--text-md);font-weight:var(--weight-semibold);text-decoration:none;box-shadow:var(--shadow-md);clip-path:inset(50%);white-space:nowrap}
.ef-skip:focus-visible{clip-path:none;outline:none;box-shadow:var(--focus-ring),var(--shadow-md)}
/* Some browsers still focus a link on click without :focus-visible; keep the
   plain :focus reveal so a pointer user never hits an invisible target. */
.ef-skip:focus{clip-path:none}
`;
/**
 * First focusable element on the page: one Tab press moves a keyboard user past
 * the whole header into the content.
 *
 * The target must be focusable for the jump to move focus, not just scroll:
 * give the landmark `tabIndex={-1}` (`<main id="main" tabIndex={-1}>`). Without
 * it Safari and Firefox scroll the page but leave focus in the header, so the
 * next Tab returns to the navigation the user just skipped.
 */
export function SkipLink({ href = '#main', children = 'Skip to content', style, className, ...rest }) {
  injectEfCss('ef-css-skip', CSS);
  return (
    <a {...rest} href={href} className={`ef-skip${className ? ' ' + className : ''}`} style={style}>
      {children}
    </a>
  );
}
