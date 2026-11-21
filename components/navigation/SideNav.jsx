'use client';
import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { Badge } from '../display/Badge.jsx';
import { injectEfCss } from '../runtime/runtime.jsx';
const CSS = `
.ef-sidenav{display:flex;flex-direction:column;width:240px;flex:none;background:var(--surface-subtle);border-inline-end:1px solid var(--border-default);align-self:stretch}
.ef-sidenav__brand{display:flex;align-items:center;gap:var(--space-2);padding:var(--space-4) var(--space-4) var(--space-4)}
.ef-sidenav__group{font-size:var(--text-2xs);font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-muted);padding:var(--space-4) var(--space-6) var(--space-2)}
.ef-sidenav__item{display:flex;align-items:center;gap:var(--space-3);width:calc(100% - 24px);margin:0 var(--space-3);height:34px;padding:0 var(--space-3);border:none;border-radius:var(--radius-sm);cursor:pointer;text-align:start;background:transparent;color:var(--text-secondary);font-family:var(--font-sans);font-size:var(--text-md);font-weight:500;transition:background var(--dur-fast) var(--ease-enter),color var(--dur-fast) var(--ease-enter)}
.ef-sidenav__item:hover{background:var(--surface-sunken);color:var(--text-primary)}
.ef-sidenav__item--on{background:var(--border-default);color:var(--text-primary);font-weight:600}
.ef-sidenav__item:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-sidenav__foot{margin-top:auto;padding:var(--space-3)}
.ef-sidenav__logo{object-fit:contain}
.ef-sidenav__name{font-family:var(--font-display);font-weight:680;letter-spacing:-0.02em;font-size:var(--text-xl)}
.ef-sidenav__badge{margin-inline-start:auto}
.ef-sidenav__nav{display:flex;flex-direction:column;gap:var(--space-0-5)}
.ef-sidenav__icon{display:inline-flex;color:inherit}
.ef-sidenav__label{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
/* coarse pointers get the 44px touch target, like form controls do through --control-h-* */
@media (pointer:coarse){.ef-sidenav__item{height:var(--tap-min)}}
`;
export function SideNav({ brand = 'Meridian', brandBadge, logoSrc, groups, value, onChange, footer, style, className, ...rest }) {
  injectEfCss('ef-css-sidenav', CSS);
  return (
    <aside {...rest} className={`ef-sidenav${className ? ' ' + className : ''}`} style={style}>
      <div className="ef-sidenav__brand">
        {logoSrc ? <img src={logoSrc} alt="" width={30} height={16} className="ef-sidenav__logo" /> : null}
        <span className="ef-sidenav__name">{brand}</span>
        {brandBadge ? <Badge className="ef-badge--brand ef-sidenav__badge">{brandBadge}</Badge> : null}
      </div>
      {groups.map((g, gi) => (
        <React.Fragment key={gi}>
          {g.label ? <div className="ef-sidenav__group">{g.label}</div> : null}
          <nav className="ef-sidenav__nav">
            {g.items.map(it => (
              <button key={it.id} type="button" aria-current={value === it.id ? 'page' : undefined} className={`ef-sidenav__item${value === it.id ? ' ef-sidenav__item--on' : ''}`} onClick={() => onChange && onChange(it.id)}>
                <span className="ef-sidenav__icon"><Icon name={it.icon} size={16} /></span>
                <span className="ef-sidenav__label">{it.label}</span>
                {it.badge != null ? <Badge variant={value === it.id ? 'default' : 'secondary'} className={value === it.id ? 'ef-badge--accent' : undefined}>{it.badge}</Badge> : null}
              </button>
            ))}
          </nav>
        </React.Fragment>
      ))}
      {footer ? <div className="ef-sidenav__foot">{footer}</div> : null}
    </aside>
  );
}
