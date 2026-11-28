'use client';
import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { Badge } from '../display/Badge.jsx';
import { useThemeState } from '../marketing/ThemeToggle.jsx';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '../overlay/DropdownMenu.jsx';
import { Tooltip, TooltipContent, TooltipTrigger } from '../feedback/Tooltip.jsx';
import { injectEfCss, useIsoLayoutEffect } from '../runtime/runtime.jsx';
import { AccountCard } from './AccountCard.jsx';
const CSS = `
.ef-sidenav{display:flex;flex-direction:column;width:240px;flex:none;overflow:hidden;background:var(--surface-subtle);border-inline-end:1px solid var(--border-default);align-self:stretch}
.ef-sidenav[data-ready]{transition:width var(--dur-slow) var(--ease-standard)}
.ef-sidenav__brand{display:flex;align-items:center;gap:var(--space-2);padding:var(--space-4) var(--space-3) var(--space-4) var(--space-4)}
.ef-sidenav__toggle{display:inline-flex;align-items:center;justify-content:center;flex:none;width:var(--control-h-sm-plus);height:var(--control-h-sm-plus);margin-inline-start:auto;padding:0;border:none;border-radius:var(--radius-sm);cursor:pointer;background:transparent;color:var(--text-secondary);transition:background var(--dur-fast) var(--ease-enter),color var(--dur-fast) var(--ease-enter)}
@media (hover:hover){.ef-sidenav__toggle:hover{background:var(--surface-sunken);color:var(--text-primary)}}
.ef-sidenav__toggle:focus-visible{outline:none;box-shadow:var(--focus-ring)}
[dir=rtl] .ef-sidenav__toggle .ef-sidenav__icon{transform:scaleX(-1)}
.ef-sidenav__group{font-size:var(--text-2xs);font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-muted);padding:var(--space-4) var(--space-6) var(--space-2)}
.ef-sidenav__item{position:relative;display:flex;align-items:center;gap:var(--space-3);width:calc(100% - 24px);margin:0 var(--space-3);height:34px;padding:0 var(--space-3);border:none;border-radius:var(--radius-sm);cursor:pointer;text-align:start;background:transparent;color:var(--text-secondary);font-family:var(--font-sans);font-size:var(--text-md);font-weight:500;transition:background var(--dur-fast) var(--ease-enter),color var(--dur-fast) var(--ease-enter)}
@media (hover:hover){.ef-sidenav__item:hover{background:var(--surface-sunken);color:var(--text-primary)}}
.ef-sidenav__item--on{background:var(--border-default);color:var(--text-primary);font-weight:600}
.ef-sidenav__item:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-sidenav__foot{margin-top:auto;padding:var(--space-4) var(--space-3) var(--space-3)}
.ef-sidenav__menu{min-width:208px}
.ef-sidenav__logo{object-fit:contain}
.ef-sidenav__name{font-family:var(--font-display);font-weight:680;letter-spacing:-0.02em;font-size:var(--text-xl)}
.ef-sidenav__mark{display:none;font-family:var(--font-display);font-weight:680;font-size:var(--text-xl);line-height:1}
.ef-sidenav__badge{margin-inline-start:auto}
.ef-sidenav__nav{display:flex;flex-direction:column;gap:var(--space-0-5)}
.ef-sidenav__icon{display:inline-flex;color:inherit}
.ef-sidenav__label{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ef-sidenav__status{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.ef-sidenav[data-collapsed]{width:72px}
.ef-sidenav[data-collapsed] .ef-sidenav__brand{flex-direction:column;justify-content:center;gap:var(--space-2);padding:var(--space-4) 0 var(--space-3)}
.ef-sidenav[data-collapsed] .ef-sidenav__toggle{margin-inline-start:0}
.ef-sidenav[data-collapsed] .ef-sidenav__mark{display:inline}
.ef-sidenav[data-collapsed] .ef-sidenav__logo+.ef-sidenav__mark{display:none}
.ef-sidenav[data-collapsed] .ef-sidenav__item{justify-content:center;gap:0;padding:0}
.ef-sidenav[data-collapsed] .ef-sidenav__name,.ef-sidenav[data-collapsed] .ef-sidenav__brand .ef-sidenav__badge,.ef-sidenav[data-collapsed] .ef-sidenav__label,.ef-sidenav[data-collapsed] .ef-sidenav__count{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.ef-sidenav[data-collapsed] .ef-sidenav__item[data-has-count]::after{content:"";position:absolute;inset-block-start:8px;inset-inline-end:12px;width:8px;height:8px;border-radius:var(--radius-full);background:var(--accent-edge)}
.ef-sidenav[data-collapsed] .ef-sidenav__group{height:1px;margin:var(--space-3) var(--space-5);padding:0;overflow:hidden;font-size:0;background:var(--border-default)}
/* coarse pointers get the 44px touch target, like form controls do through --control-h-* */
@media (pointer:coarse){.ef-sidenav__item{height:var(--tap-min)}.ef-sidenav__toggle{width:var(--tap-min);height:var(--tap-min)}}
@media (prefers-reduced-motion:reduce){.ef-sidenav[data-ready],.ef-sidenav__toggle{transition:none}}
`;
const LABELS = {
  en: { theme: 'Theme', light: 'Light', dark: 'Dark', signOut: 'Sign out', collapse: 'Collapse sidebar', expand: 'Expand sidebar' },
  id: { theme: 'Tema', light: 'Terang', dark: 'Gelap', signOut: 'Keluar', collapse: 'Ciutkan sidebar', expand: 'Perluas sidebar' },
};
// The rail is one stored choice per viewer on this origin: '1' collapsed, '0' expanded.
const COLLAPSE_KEY = 'efolusi-sidenav-collapsed';
// A phone puts the rail in a drawer at full width, so there is nothing to collapse there.
const PHONE = '(max-width:767px)';
const readCollapsed = (key) => {
  try { const v = globalThis.localStorage?.getItem(key); return v === '1' ? true : v === '0' ? false : null; } catch { return null; }
};
const writeCollapsed = (key, collapsed) => {
  try { globalThis.localStorage?.setItem(key, collapsed ? '1' : '0'); } catch { /* storage blocked: the choice lasts until reload */ }
};
// The foot: one account card that opens the account menu above it (Theme as Light and Dark, the product's own items, Sign out).
// The menu is the DropdownMenu, so arrows, Escape and focus return come from it.
function AccountFoot({ account, collapsed, lang, labels, menuItems, onSignOut }) {
  const text = { ...(LABELS[lang] || LABELS.en), ...labels };
  const [announce, setAnnounce] = React.useState('');
  const { shown, set } = useThemeState((next) => setAnnounce(`${text.theme}: ${text[next]}`));
  return (
    <div className="ef-sidenav__foot" data-slot="sidenav-foot">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <AccountCard interactive name={account.name} email={account.email} image={account.image} compact={collapsed} />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" sideOffset={8} className="ef-sidenav__menu">
          <DropdownMenuLabel>{text.theme}</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={shown} onValueChange={set}>
            <DropdownMenuRadioItem value="light">{text.light}</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">{text.dark}</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          {(menuItems || []).map((it) => (
            <DropdownMenuItem key={it.id} onSelect={it.onSelect}>
              {it.icon ? <Icon name={it.icon} size={16} /> : null}
              <span>{it.label}</span>
            </DropdownMenuItem>
          ))}
          {onSignOut ? (
            <>
              {menuItems && menuItems.length ? <DropdownMenuSeparator /> : null}
              <DropdownMenuItem onSelect={onSignOut}>
                <Icon name="log-out" size={16} />
                <span>{text.signOut}</span>
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      <span className="ef-sidenav__status" role="status">{announce}</span>
    </div>
  );
}
export function SideNav({ brand = 'Meridian', brandBadge, logoSrc, groups, value, onChange, collapsed: collapsedProp, defaultCollapsed = false, onCollapsedChange, collapsible = true, storageKey = COLLAPSE_KEY, account, menuItems, onSignOut, lang = 'en', labels, style, className, id, ...rest }) {
  injectEfCss('ef-css-sidenav', CSS);
  const railId = React.useId();
  const controlled = collapsedProp !== undefined;
  const [own, setOwn] = React.useState(defaultCollapsed);
  const [phone, setPhone] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  // Read the stored choice and the phone query before the first paint, then allow the width to animate only after
  // that frame: a restored rail is already at its width when it appears and never slides into place.
  useIsoLayoutEffect(() => {
    if (!controlled && storageKey) {
      const stored = readCollapsed(storageKey);
      if (stored !== null) setOwn(stored);
    }
    const mq = globalThis.matchMedia?.(PHONE);
    const sync = () => setPhone(!!mq?.matches);
    sync();
    mq?.addEventListener?.('change', sync);
    const frame = (cb) => (globalThis.requestAnimationFrame ? globalThis.requestAnimationFrame(cb) : setTimeout(cb, 16));
    frame(() => frame(() => setReady(true)));
    return () => mq?.removeEventListener?.('change', sync);
  }, []);
  const collapsed = controlled ? !!collapsedProp : own && !phone;
  const toggle = () => {
    const next = !collapsed;
    if (!controlled) {
      setOwn(next);
      if (storageKey) writeCollapsed(storageKey, next);
    }
    onCollapsedChange?.(next);
  };
  const showToggle = collapsible && !phone && (!controlled || !!onCollapsedChange);
  const text = { ...(LABELS[lang] || LABELS.en), ...labels };
  const railTip = (label, side = 'right') => (collapsed ? <TooltipContent side={side}>{label}</TooltipContent> : null);
  return (
    <aside {...rest} id={id || railId} data-collapsed={collapsed ? '' : undefined} data-ready={ready ? '' : undefined} className={`ef-sidenav${className ? ' ' + className : ''}`} style={style}>
      <div className="ef-sidenav__brand">
        {logoSrc ? <img src={logoSrc} alt="" width={30} height={16} className="ef-sidenav__logo" /> : null}
        <span className="ef-sidenav__mark" aria-hidden="true">{brand.slice(0, 1)}</span>
        <span className="ef-sidenav__name">{brand}</span>
        {brandBadge ? <Badge variant="brand" className="ef-sidenav__badge">{brandBadge}</Badge> : null}
        {showToggle ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="ef-sidenav__toggle" aria-expanded={!collapsed} aria-controls={id || railId} aria-label={collapsed ? text.expand : text.collapse} onClick={toggle}>
                <span className="ef-sidenav__icon"><Icon name="panel-left" size={16} /></span>
              </button>
            </TooltipTrigger>
            <TooltipContent side={collapsed ? 'right' : 'bottom'}>{collapsed ? text.expand : text.collapse}</TooltipContent>
          </Tooltip>
        ) : null}
      </div>
      {groups.map((g, gi) => (
        <React.Fragment key={gi}>
          {g.label ? <div className="ef-sidenav__group">{g.label}</div> : null}
          <nav className="ef-sidenav__nav">
            {g.items.map(it => (
              <Tooltip key={it.id} open={collapsed ? undefined : false}>
                <TooltipTrigger asChild>
                  <button type="button" aria-current={value === it.id ? 'page' : undefined} data-has-count={it.badge != null ? '' : undefined} className={`ef-sidenav__item${value === it.id ? ' ef-sidenav__item--on' : ''}`} onClick={() => onChange && onChange(it.id)}>
                    <span className="ef-sidenav__icon"><Icon name={it.icon} size={16} /></span>
                    <span className="ef-sidenav__label">{it.label}</span>
                    {it.badge != null ? <Badge variant={value === it.id ? 'default' : 'secondary'} className={`ef-sidenav__count${value === it.id ? ' ef-badge--accent' : ''}`}>{it.badge}</Badge> : null}
                  </button>
                </TooltipTrigger>
                {typeof it.label === 'string' || typeof it.label === 'number' ? railTip(it.label) : null}
              </Tooltip>
            ))}
          </nav>
        </React.Fragment>
      ))}
      {account ? <AccountFoot account={account} collapsed={collapsed} lang={lang} labels={labels} menuItems={menuItems} onSignOut={onSignOut} /> : null}
    </aside>
  );
}
