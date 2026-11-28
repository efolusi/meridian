'use client';
import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { Badge } from '../display/Badge.jsx';
import { useThemeState } from '../marketing/ThemeToggle.jsx';
import { injectEfCss } from '../runtime/runtime.jsx';
import { AccountCard } from './AccountCard.jsx';
const CSS = `
.ef-sidenav{display:flex;flex-direction:column;width:240px;flex:none;background:var(--surface-subtle);border-inline-end:1px solid var(--border-default);align-self:stretch}
.ef-sidenav__brand{display:flex;align-items:center;gap:var(--space-2);padding:var(--space-4) var(--space-4) var(--space-4)}
.ef-sidenav__group{font-size:var(--text-2xs);font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-muted);padding:var(--space-4) var(--space-6) var(--space-2)}
.ef-sidenav__item{position:relative;display:flex;align-items:center;gap:var(--space-3);width:calc(100% - 24px);margin:0 var(--space-3);height:34px;padding:0 var(--space-3);border:none;border-radius:var(--radius-sm);cursor:pointer;text-align:start;background:transparent;color:var(--text-secondary);font-family:var(--font-sans);font-size:var(--text-md);font-weight:500;transition:background var(--dur-fast) var(--ease-enter),color var(--dur-fast) var(--ease-enter)}
@media (hover:hover){.ef-sidenav__item:hover{background:var(--surface-sunken);color:var(--text-primary)}}
.ef-sidenav__item--on{background:var(--border-default);color:var(--text-primary);font-weight:600}
.ef-sidenav__item:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-sidenav__foot{margin-top:auto;display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-4) 0 var(--space-3)}
.ef-sidenav__actions{display:flex;flex-direction:column;gap:var(--space-0-5)}
.ef-sidenav__state{margin-inline-start:auto;font-size:var(--text-xs);font-weight:400;color:var(--text-muted)}
.ef-sidenav__account{margin:0 var(--space-3)}
.ef-sidenav__logo{object-fit:contain}
.ef-sidenav__name{font-family:var(--font-display);font-weight:680;letter-spacing:-0.02em;font-size:var(--text-xl)}
.ef-sidenav__mark{display:none;font-family:var(--font-display);font-weight:680;font-size:var(--text-xl);line-height:1}
.ef-sidenav__badge{margin-inline-start:auto}
.ef-sidenav__nav{display:flex;flex-direction:column;gap:var(--space-0-5)}
.ef-sidenav__icon{display:inline-flex;color:inherit}
.ef-sidenav__label{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ef-sidenav__status{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.ef-sidenav[data-collapsed]{width:72px}
.ef-sidenav[data-collapsed] .ef-sidenav__brand{justify-content:center;padding-inline:0}
.ef-sidenav[data-collapsed] .ef-sidenav__mark{display:inline}
.ef-sidenav[data-collapsed] .ef-sidenav__logo+.ef-sidenav__mark{display:none}
.ef-sidenav[data-collapsed] .ef-sidenav__item{justify-content:center;gap:0;padding:0}
.ef-sidenav[data-collapsed] .ef-sidenav__name,.ef-sidenav[data-collapsed] .ef-sidenav__brand .ef-sidenav__badge,.ef-sidenav[data-collapsed] .ef-sidenav__label,.ef-sidenav[data-collapsed] .ef-sidenav__count,.ef-sidenav[data-collapsed] .ef-sidenav__state{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.ef-sidenav[data-collapsed] .ef-sidenav__item[data-has-count]::after{content:"";position:absolute;inset-block-start:8px;inset-inline-end:12px;width:8px;height:8px;border-radius:var(--radius-full);background:var(--accent-edge)}
.ef-sidenav[data-collapsed] .ef-sidenav__group{height:1px;margin:var(--space-3) var(--space-5);padding:0;overflow:hidden;font-size:0;background:var(--border-default)}
/* coarse pointers get the 44px touch target, like form controls do through --control-h-* */
@media (pointer:coarse){.ef-sidenav__item{height:var(--tap-min)}}
`;
const FOOT_LABELS = {
  en: { theme: 'Theme', light: 'Light', dark: 'Dark', signOut: 'Sign out', next: 'Switch to' },
  id: { theme: 'Tema', light: 'Terang', dark: 'Gelap', signOut: 'Keluar', next: 'Ganti ke' },
};
const textOf = (node) => (typeof node === 'string' || typeof node === 'number' ? String(node) : undefined);
// The theme row and the sign-out row of the foot: the same row style as the nav rows above, the label always in the DOM.
function FootRows({ lang, labels, collapsed, onSignOut }) {
  const text = { ...(FOOT_LABELS[lang] || FOOT_LABELS.en), ...labels };
  const [announce, setAnnounce] = React.useState('');
  const { shown, other, choose } = useThemeState((next) => setAnnounce(`${text.theme}: ${text[next]}`));
  const themeName = `${text.theme}: ${text[shown]}`;
  const switchTo = `${text.next} ${text[other].toLowerCase()}`;
  return (
    <div className="ef-sidenav__actions">
      <button type="button" data-slot="sidenav-theme" className="ef-sidenav__item" aria-label={themeName} title={collapsed ? `${themeName}. ${switchTo}` : switchTo} onClick={choose}>
        <span className="ef-sidenav__icon"><Icon name={shown === 'dark' ? 'moon' : 'sun'} size={16} /></span>
        <span className="ef-sidenav__label">{text.theme}</span>
        <span className="ef-sidenav__state" aria-hidden="true">{text[shown]}</span>
      </button>
      {onSignOut ? (
        <button type="button" data-slot="sidenav-sign-out" className="ef-sidenav__item" title={collapsed ? text.signOut : undefined} onClick={onSignOut}>
          <span className="ef-sidenav__icon"><Icon name="log-out" size={16} /></span>
          <span className="ef-sidenav__label">{text.signOut}</span>
        </button>
      ) : null}
      <span className="ef-sidenav__status" role="status">{announce}</span>
    </div>
  );
}
export function SideNav({ brand = 'Meridian', brandBadge, logoSrc, groups, value, onChange, collapsed = false, account, onSignOut, lang = 'en', labels, style, className, ...rest }) {
  injectEfCss('ef-css-sidenav', CSS);
  return (
    <aside {...rest} data-collapsed={collapsed ? '' : undefined} className={`ef-sidenav${className ? ' ' + className : ''}`} style={style}>
      <div className="ef-sidenav__brand">
        {logoSrc ? <img src={logoSrc} alt="" width={30} height={16} className="ef-sidenav__logo" /> : null}
        <span className="ef-sidenav__mark" aria-hidden="true">{brand.slice(0, 1)}</span>
        <span className="ef-sidenav__name">{brand}</span>
        {brandBadge ? <Badge variant="brand" className="ef-sidenav__badge">{brandBadge}</Badge> : null}
      </div>
      {groups.map((g, gi) => (
        <React.Fragment key={gi}>
          {g.label ? <div className="ef-sidenav__group">{g.label}</div> : null}
          <nav className="ef-sidenav__nav">
            {g.items.map(it => (
              <button key={it.id} type="button" aria-current={value === it.id ? 'page' : undefined} data-has-count={it.badge != null ? '' : undefined} title={collapsed ? textOf(it.label) : undefined} className={`ef-sidenav__item${value === it.id ? ' ef-sidenav__item--on' : ''}`} onClick={() => onChange && onChange(it.id)}>
                <span className="ef-sidenav__icon"><Icon name={it.icon} size={16} /></span>
                <span className="ef-sidenav__label">{it.label}</span>
                {it.badge != null ? <Badge variant={value === it.id ? 'default' : 'secondary'} className={`ef-sidenav__count${value === it.id ? ' ef-badge--accent' : ''}`}>{it.badge}</Badge> : null}
              </button>
            ))}
          </nav>
        </React.Fragment>
      ))}
      {account || onSignOut ? (
        <div className="ef-sidenav__foot" data-slot="sidenav-foot">
          <FootRows lang={lang} labels={labels} collapsed={collapsed} onSignOut={onSignOut} />
          {account ? <AccountCard className="ef-sidenav__account" name={account.name} email={account.email} image={account.image} compact={collapsed} /> : null}
        </div>
      ) : null}
    </aside>
  );
}
