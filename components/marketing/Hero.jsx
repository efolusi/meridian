'use client';
import React from 'react';
import { injectEfCss } from '../runtime/runtime.jsx';

// --hero-top and --hero-bottom come from landing.css, which steps them down on smaller screens.
// At 640px and below the actions stack in one grid column as wide as the widest button, so a stacked pair has one width (MD147).
const CSS = `
.ef-hero{padding-block:var(--hero-top,var(--space-16)) var(--hero-bottom,var(--space-16));color:var(--text-primary)}
.ef-hero__inner{display:flex;flex-direction:column;gap:var(--space-5);width:100%;max-width:var(--container-max);margin-inline:auto;padding-inline:var(--space-6)}
.ef-hero[data-align="center"] .ef-hero__inner{align-items:center;text-align:center}
.ef-hero__title{margin:0;max-width:18ch;font-family:var(--font-display);font-size:clamp(var(--text-5xl),4.2vw,var(--text-6xl));font-weight:var(--weight-bold);line-height:var(--leading-tight);letter-spacing:var(--tracking-display);text-wrap:balance}
.ef-hero__sub{margin:0;max-width:var(--container-text);font-size:var(--text-lg);line-height:var(--leading-relaxed);color:var(--text-secondary);text-wrap:pretty}
.ef-hero__actions{display:flex;flex-wrap:wrap;gap:var(--space-3);margin-top:var(--space-2)}
.ef-hero[data-align="center"] .ef-hero__actions{justify-content:center}
@media (max-width:640px){.ef-hero__actions{display:grid;grid-template-columns:minmax(0,max-content);justify-content:center}.ef-hero[data-align="start"] .ef-hero__actions{justify-content:start}}
.ef-hero__proof{display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm);color:var(--text-muted)}
.ef-hero-accent{position:relative;display:inline-block}
.ef-hero-accent svg{position:absolute;inset-inline:0;bottom:-0.14em;width:100%;height:0.22em;overflow:visible}
.ef-hero-accent path{fill:none;stroke:var(--brand-500);stroke-width:7;stroke-linecap:round;stroke-dasharray:100;stroke-dashoffset:100;animation:ef-hero-draw var(--dur-slow) var(--ease-enter) var(--dur-slow) forwards}
@keyframes ef-hero-draw{to{stroke-dashoffset:0}}
@media (prefers-reduced-motion:reduce){.ef-hero-accent path{animation:none;stroke-dashoffset:0}}
`;

export const Hero = React.forwardRef(function Hero(
  { title, sub, actions, proof, align = 'center', as: Heading = 'h1', className, children, ...rest },
  ref,
) {
  injectEfCss('ef-css-hero', CSS);
  return (
    <section
      {...rest}
      ref={ref}
      data-slot="hero"
      data-align={align === 'start' ? 'start' : 'center'}
      className={`ef-hero${className ? ` ${className}` : ''}`}
    >
      <div className="ef-hero__inner">
        <Heading className="ef-hero__title">{title}</Heading>
        {sub ? <p className="ef-hero__sub">{sub}</p> : null}
        {actions ? <div className="ef-hero__actions">{actions}</div> : null}
        {proof ? <div className="ef-hero__proof">{proof}</div> : null}
        {children}
      </div>
    </section>
  );
});

/** One word of the hero title with a hand-drawn underline that draws itself once. */
export function HeroAccent({ children, className, ...rest }) {
  injectEfCss('ef-css-hero', CSS);
  return (
    <span {...rest} data-slot="hero-accent" className={`ef-hero-accent${className ? ` ${className}` : ''}`}>
      {children}
      <svg viewBox="0 0 220 26" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d="M6 16 C 48 22, 88 6, 126 13 S 196 21, 214 9" pathLength="100" />
      </svg>
    </span>
  );
}
