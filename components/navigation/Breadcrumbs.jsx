import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-crumbs{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.ef-crumbs__link{font-size:var(--text-sm);color:var(--text-muted);text-decoration:none;padding:2px 4px;border-radius:var(--radius-sm);transition:color var(--dur-fast) var(--ease-out)}
a.ef-crumbs__link:hover{color:var(--text-primary);text-decoration:none}
.ef-crumbs__link--current{color:var(--text-primary);font-weight:var(--weight-medium)}
.ef-crumbs__sep{color:var(--sand-400);display:inline-flex}
`;
export function Breadcrumbs({ items, style, className, ...rest }) {
  injectEfCss('ef-css-crumbs', CSS);
  return (
    <nav {...rest} aria-label="Breadcrumb" className={`ef-crumbs${className ? ' ' + className : ''}`} style={style}>
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <React.Fragment key={i}>
            {last ? <span className="ef-crumbs__link ef-crumbs__link--current" aria-current="page">{it.label}</span>
              : <a className="ef-crumbs__link" href={it.href || '#'} onClick={it.onClick}>{it.label}</a>}
            {!last && <span className="ef-crumbs__sep"><Icon name="chevron-right" size={13} /></span>}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
