import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { Badge } from '../display/Badge.jsx';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-sidenav{display:flex;flex-direction:column;width:240px;flex:none;background:var(--surface-subtle);border-right:1px solid var(--border-default);min-height:100%}
.ef-sidenav__brand{display:flex;align-items:center;gap:10px;padding:16px 16px 14px}
.ef-sidenav__group{font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-muted);padding:14px 22px 6px}
.ef-sidenav__item{display:flex;align-items:center;gap:10px;width:calc(100% - 24px);margin:0 12px;height:34px;padding:0 10px;border:none;border-radius:var(--radius-sm);cursor:pointer;text-align:left;background:transparent;color:var(--text-secondary);font-family:var(--font-sans);font-size:var(--text-md);font-weight:500;transition:background var(--dur-fast) var(--ease-out),color var(--dur-fast) var(--ease-out)}
.ef-sidenav__item:hover{background:var(--surface-sunken);color:var(--text-primary)}
.ef-sidenav__item--on{background:var(--border-default);color:var(--text-primary);font-weight:600}
.ef-sidenav__item:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-sidenav__foot{margin-top:auto;padding:12px}
`;
export function SideNav({ brand = 'Efolusi', brandBadge, logoSrc, groups, value, onChange, footer, style, className, ...rest }) {
  injectEfCss('ef-css-sidenav', CSS);
  return (
    <aside {...rest} className={`ef-sidenav${className ? ' ' + className : ''}`} style={style}>
      <div className="ef-sidenav__brand">
        {logoSrc ? <img src={logoSrc} alt="" style={{ width: 30, height: 30 }} /> : null}
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 680, letterSpacing: '-0.02em', fontSize: 19 }}>{brand}</span>
        {brandBadge ? <Badge tone="brand" style={{ marginLeft: 'auto' }}>{brandBadge}</Badge> : null}
      </div>
      {groups.map((g, gi) => (
        <React.Fragment key={gi}>
          {g.label ? <div className="ef-sidenav__group">{g.label}</div> : null}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {g.items.map(it => (
              <button key={it.id} className={`ef-sidenav__item${value === it.id ? ' ef-sidenav__item--on' : ''}`} onClick={() => onChange && onChange(it.id)}>
                <span style={{ display: 'inline-flex', color: 'inherit' }}><Icon name={it.icon} size={17} /></span>
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.label}</span>
                {it.badge != null ? <Badge tone={value === it.id ? 'accent' : 'neutral'}>{it.badge}</Badge> : null}
              </button>
            ))}
          </nav>
        </React.Fragment>
      ))}
      {footer ? <div className="ef-sidenav__foot">{footer}</div> : null}
    </aside>
  );
}
