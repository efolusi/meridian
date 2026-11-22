'use client';
import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from '../runtime/runtime.jsx';
// A floating chrome-glass tab bar for phones (design-tokens docs/glass.md). It sits above the home
// indicator (safe-area inset) and hides from 720px up, where the TopNav carries the same links.
// While it shows, the scroll port keeps --ef-tabbar-space free at the bottom, so a focused element is never
// scrolled under it (WCAG 2.2 2.4.11); pages add the same space as padding-block-end.
const CSS = `
:root{--ef-tabbar-space:calc(var(--tap-min) + 2 * var(--space-1) + 2 * var(--space-3) + env(safe-area-inset-bottom))}
@media (max-width:719px){:root:has(.ef-tabbar){scroll-padding-block-end:var(--ef-tabbar-space)}}
.ef-tabbar{position:fixed;z-index:20;inset-inline:0;inset-block-end:max(var(--space-3),env(safe-area-inset-bottom));margin-inline:auto;display:flex;gap:var(--space-0-5);width:calc(100% - 2 * var(--space-3));max-width:480px;padding:var(--space-1);border-radius:var(--radius-full)}
.ef-tabbar__item{flex:1;display:inline-flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--space-0-5);min-height:var(--tap-min);padding:var(--space-1) var(--space-2);border-radius:var(--radius-full);color:var(--text-primary);font-size:var(--text-xs);font-weight:var(--weight-semibold);text-decoration:none;transition:background var(--dur-fast) var(--ease-enter)}
.ef-tabbar__item:hover{background:color-mix(in srgb,var(--text-primary) 7%,transparent)}
.ef-tabbar__item[aria-current="page"]{background:var(--accent);color:var(--accent-contrast)}
.ef-tabbar__item:focus-visible{outline:2px solid transparent;box-shadow:var(--focus-ring)}
@media (min-width:720px){.ef-tabbar{display:none}}
@media (forced-colors:active){.ef-tabbar__item[aria-current="page"]{background:Highlight;color:HighlightText;forced-color-adjust:none}}
`;
const LABELS = { en: { nav: 'Main navigation' }, id: { nav: 'Navigasi utama' } };
export function TabBar({ items = [], value, lang = 'en', labels, style, className, ...rest }) {
  injectEfCss('ef-css-tabbar', CSS);
  const text = { ...(LABELS[lang] ?? LABELS.en), ...labels };
  return (
    <nav aria-label={text.nav} {...rest} className={`ef-tabbar ef-glass ef-glass--chrome ef-glass--blur${className ? ' ' + className : ''}`} style={style}>
      {items.map((item) => (
        <a key={item.id} href={item.href} className="ef-tabbar__item" aria-current={value === item.id ? 'page' : undefined}>
          {item.icon ? <Icon name={item.icon} size={20} /> : null}
          {item.label}
        </a>
      ))}
    </nav>
  );
}
