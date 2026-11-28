'use client';
import React from 'react';
import { injectEfCss } from '../runtime/runtime.jsx';
import { Icon } from '../icons/Icon.jsx';

// Every card keeps a hairline: some tone fills sit near the page colour in one theme.
const CSS = `
.ef-feature-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,18rem),1fr));gap:var(--space-6)}
.ef-feature-card{position:relative;display:flex;flex-direction:column;gap:var(--space-3);min-height:100%;padding:var(--space-8);overflow:hidden;border:1px solid var(--border-default);border-radius:var(--radius-xl);background:var(--surface-card);color:var(--text-primary);text-decoration:none;transition:transform var(--dur-base) var(--ease-enter),box-shadow var(--dur-base) var(--ease-enter)}
.ef-feature-card[data-tone="peach"]{background:var(--tone-peach-fill);color:var(--tone-peach-on-fill)}
.ef-feature-card[data-tone="band"]{background:var(--tone-band-fill);color:var(--tone-band-on-fill)}
.ef-feature-card[data-tone="amber"]{background:var(--tone-amber-fill);color:var(--tone-amber-on-fill)}
a.ef-feature-card:hover{transform:translateY(calc(-1 * var(--space-1)));box-shadow:var(--shadow-lg);color:inherit}
a.ef-feature-card[data-tone]:hover{color:inherit}
a.ef-feature-card:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-feature-card__icon{display:inline-flex;align-items:center;justify-content:center;width:var(--control-h-lg);height:var(--control-h-lg);border-radius:var(--radius-md);background:var(--surface-card);color:var(--accent-subtle-fg)}
.ef-feature-card[data-tone="peach"] .ef-feature-card__icon,.ef-feature-card[data-tone="amber"] .ef-feature-card__icon{background:var(--surface-card);color:var(--text-primary)}
.ef-feature-card[data-tone="band"] .ef-feature-card__icon{background:var(--tone-band-on-fill);color:var(--tone-band-fill)}
.ef-feature-card__title{margin:var(--space-2) 0 0;font-family:var(--font-display);font-size:var(--text-2xl);font-weight:var(--weight-semibold);line-height:var(--leading-snug)}
.ef-feature-card__body{margin:0;font-size:var(--text-md);line-height:var(--leading-relaxed)}
.ef-feature-card__cta{display:inline-flex;align-items:center;gap:var(--space-1);margin-top:auto;padding-top:var(--space-3);font-weight:var(--weight-semibold)}
@media (prefers-reduced-motion:reduce){.ef-feature-card{transition:none}a.ef-feature-card:hover{transform:none}}
`;

export const FeatureGrid = React.forwardRef(function FeatureGrid({ className, ...rest }, ref) {
  injectEfCss('ef-css-feature', CSS);
  return <div {...rest} ref={ref} data-slot="feature-grid" className={`ef-feature-grid${className ? ` ${className}` : ''}`} />;
});

export const FeatureCard = React.forwardRef(function FeatureCard(
  { href, icon, title, body, cta, tone = 'default', as: Heading = 'h3', className, children, ...rest },
  ref,
) {
  injectEfCss('ef-css-feature', CSS);
  const Root = href ? 'a' : 'div';
  return (
    <Root
      {...rest}
      ref={ref}
      href={href}
      data-slot="feature-card"
      data-tone={['peach', 'band', 'amber'].includes(tone) ? tone : undefined}
      className={`ef-feature-card${className ? ` ${className}` : ''}`}
    >
      {icon ? <span className="ef-feature-card__icon" aria-hidden="true"><Icon name={icon} size={20} /></span> : null}
      <Heading className="ef-feature-card__title">{title}</Heading>
      {body ? <p className="ef-feature-card__body">{body}</p> : null}
      {children}
      {cta ? <span className="ef-feature-card__cta">{cta}<Icon name="arrow-right" size={16} /></span> : null}
    </Root>
  );
});
