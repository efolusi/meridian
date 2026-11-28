'use client';
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../display/Avatar.jsx';
import { injectEfCss } from '../runtime/runtime.jsx';
const CSS = `
.ef-account-card{position:relative;display:flex;align-items:center;gap:var(--space-3);min-width:0;padding:var(--space-3);background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-md);color:var(--text-primary)}
.ef-account-card__text{display:grid;min-width:0;line-height:1.25}
.ef-account-card__name{font-size:var(--text-sm);font-weight:600;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ef-account-card__email{font-size:var(--text-xs);color:var(--text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ef-account-card[data-compact]{justify-content:center;padding:calc(var(--space-2) - 1px)}
.ef-account-card[data-compact] .ef-account-card__text{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
`;
const initials = (name, email) => {
  const words = (name || '').trim().split(/\s+/).filter(Boolean);
  if (words.length > 1) return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  return (words[0] || email || '').slice(0, 2).toUpperCase();
};
export const AccountCard = React.forwardRef(function AccountCard({ name, email, image, compact = false, className, ...rest }, ref) {
  injectEfCss('ef-css-account-card', CSS);
  return (
    <div {...rest} ref={ref} data-slot="account-card" data-compact={compact ? '' : undefined} className={`ef-account-card${className ? ' ' + className : ''}`}>
      <Avatar>
        {image ? <AvatarImage src={image} alt="" /> : null}
        <AvatarFallback>{initials(name, email)}</AvatarFallback>
      </Avatar>
      <span className="ef-account-card__text">
        <span className="ef-account-card__name">{name || email}</span>
        {name ? <span className="ef-account-card__email">{email}</span> : null}
      </span>
    </div>
  );
});
