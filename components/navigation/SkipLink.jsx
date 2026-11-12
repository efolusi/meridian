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
 * The link moves focus to its target itself instead of following the hash:
 * a plain jump changes location.hash, which a hash-based router reads as a
 * route, and Safari and Firefox scroll without moving focus unless the target
 * is focusable. The target gets `tabIndex=-1` when it has no tabindex, then
 * receives focus. An onClick that calls preventDefault keeps full control.
 */
export function SkipLink({ href = '#main', children = 'Skip to content', style, className, onClick, ...rest }) {
  injectEfCss('ef-css-skip', CSS);
  const jump = event => {
    onClick?.(event);
    if (event.defaultPrevented || typeof href !== 'string' || href.length < 2 || href[0] !== '#') return;
    const target = document.getElementById(decodeURIComponent(href.slice(1)));
    if (!target) return;
    event.preventDefault();
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus();
  };
  return (
    <a {...rest} href={href} onClick={jump} className={`ef-skip${className ? ' ' + className : ''}`} style={style}>
      {children}
    </a>
  );
}
