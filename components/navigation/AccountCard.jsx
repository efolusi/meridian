'use client';
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../display/Avatar.jsx';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from '../runtime/runtime.jsx';
const CSS = `
.ef-account-card{position:relative;display:flex;align-items:center;gap:var(--space-3);min-width:0;padding:var(--space-3);background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-md);color:var(--text-primary)}
.ef-account-card__text{display:grid;min-width:0;line-height:1.25}
.ef-account-card__name{font-size:var(--text-sm);font-weight:600;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ef-account-card__email{font-size:var(--text-xs);color:var(--text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ef-account-card--button{width:100%;margin:0;font:inherit;text-align:start;cursor:pointer;transition:background var(--dur-fast) var(--ease-enter),border-color var(--dur-fast) var(--ease-enter)}
@media (hover:hover){.ef-account-card--button:hover{background:var(--surface-sunken)}}
.ef-account-card--button[data-state=open]{background:var(--surface-sunken)}
.ef-account-card--button:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-account-card__mark{display:inline-flex;margin-inline-start:auto;color:var(--text-muted)}
.ef-account-card[data-compact] .ef-account-card__mark{display:none}
@media (pointer:coarse){.ef-account-card--button{min-height:var(--tap-min)}}
@media (prefers-reduced-motion:reduce){.ef-account-card--button{transition:none}}
.ef-account-card[data-compact]{justify-content:center;padding:calc(var(--space-2) - 1px)}
.ef-account-card[data-compact] .ef-account-card__text{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
`;
const initials = (name, email) => {
  const words = (name || '').trim().split(/\s+/).filter(Boolean);
  if (words.length > 1) return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  return (words[0] || email || '').slice(0, 2).toUpperCase();
};
export const AccountCard = React.forwardRef(function AccountCard({ name, email, image, compact = false, interactive = false, className, ...rest }, ref) {
  injectEfCss('ef-css-account-card', CSS);
  const Root = interactive ? 'button' : 'div';
  return (
    <Root {...rest} {...(interactive ? { type: 'button' } : null)} ref={ref} data-slot="account-card" data-compact={compact ? '' : undefined} className={`ef-account-card${interactive ? ' ef-account-card--button' : ''}${className ? ' ' + className : ''}`}>
      <Avatar>
        {image ? <AvatarImage src={image} alt="" /> : null}
        <AvatarFallback>{initials(name, email)}</AvatarFallback>
      </Avatar>
      <span className="ef-account-card__text">
        <span className="ef-account-card__name">{name || email}</span>
        {name ? <span className="ef-account-card__email">{email}</span> : null}
      </span>
      {interactive ? <span className="ef-account-card__mark" aria-hidden="true"><Icon name="chevron-up" size={16} /></span> : null}
    </Root>
  );
});
