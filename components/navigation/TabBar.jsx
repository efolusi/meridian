'use client';
import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from '../runtime/runtime.jsx';
// A floating chrome-glass tab bar for phones (design-tokens docs/glass.md). It sits above the home
// indicator (safe-area inset) and hides from 720px up, where the TopNav carries the same links.
const CSS = `
.ef-tabbar{position:fixed;z-index:20;left:50%;bottom:max(var(--space-3),env(safe-area-inset-bottom));translate:-50% 0;display:flex;gap:var(--space-0-5);width:calc(100% - 2 * var(--space-3));max-width:480px;padding:var(--space-1);border-radius:var(--radius-full)}
.ef-tabbar__item{flex:1;display:inline-flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--space-0-5);min-height:var(--tap-min);padding:var(--space-1) var(--space-2);border-radius:var(--radius-full);color:var(--text-primary);font-size:var(--text-xs);font-weight:var(--weight-semibold);text-decoration:none;transition:background var(--dur-fast) var(--ease-enter)}
.ef-tabbar__item:hover{background:color-mix(in srgb,var(--text-primary) 7%,transparent)}
.ef-tabbar__item[aria-current="page"]{background:var(--accent);color:var(--accent-contrast)}
.ef-tabbar__item:focus-visible{outline:none;box-shadow:var(--focus-ring)}
@media (min-width:720px){.ef-tabbar{display:none}}
@media (forced-colors:active){.ef-tabbar__item[aria-current="page"]{background:Highlight;color:HighlightText;forced-color-adjust:none}}
`;
export function TabBar({ items = [], value, style, className, ...rest }) {
  injectEfCss('ef-css-tabbar', CSS);
  return (
    <nav {...rest} className={`ef-tabbar ef-glass ef-glass--chrome ef-glass--blur${className ? ' ' + className : ''}`} style={style}>
      {items.map((item) => (
        <a key={item.id} href={item.href} className="ef-tabbar__item" aria-current={value === item.id ? 'page' : undefined}>
          {item.icon ? <Icon name={item.icon} size={20} /> : null}
          {item.label}
        </a>
      ))}
    </nav>
  );
}
