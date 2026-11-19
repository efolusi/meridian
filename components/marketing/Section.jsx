'use client';
import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';

// --section-y comes from landing.css, which steps it down on smaller screens.
const CSS = `
.ef-section{padding-block:var(--section-y,var(--space-24));color:var(--text-primary)}
.ef-section[data-ruled]{border-top:1px solid var(--border-default)}
.ef-section[data-tone="band"]{background:var(--surface-brand);color:var(--text-on-brand)}
.ef-section__inner{width:100%;max-width:var(--container-max);margin-inline:auto;padding-inline:var(--space-6)}
.ef-section-head{display:flex;flex-direction:column;gap:var(--space-3);max-width:var(--container-text)}
.ef-section-head[data-align="center"]{margin-inline:auto;text-align:center;align-items:center}
.ef-section-head__eyebrow{margin:0;font-family:var(--font-mono);font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:var(--tracking-wide);text-transform:uppercase;color:var(--text-muted)}
.ef-section-head__title{margin:0;font-family:var(--font-display);font-size:clamp(var(--text-3xl),3.4vw,var(--text-4xl));font-weight:var(--weight-semibold);line-height:var(--leading-tight);letter-spacing:var(--tracking-tight);text-wrap:balance}
.ef-section-head__lede{margin:0;font-size:var(--text-lg);line-height:var(--leading-relaxed);color:var(--text-secondary);text-wrap:pretty}
.ef-section[data-tone="band"] .ef-section-head__eyebrow,.ef-section[data-tone="band"] .ef-section-head__lede{color:var(--text-on-brand-muted)}
`;

export const Section = React.forwardRef(function Section(
  { tone = 'default', ruled = false, className, children, ...rest },
  ref,
) {
  injectEfCss('ef-css-section', CSS);
  return (
    <section
      {...rest}
      ref={ref}
      data-slot="section"
      data-tone={tone === 'band' ? 'band' : 'default'}
      data-ruled={ruled ? '' : undefined}
      className={`ef-section${className ? ` ${className}` : ''}`}
    >
      <div className="ef-section__inner">{children}</div>
    </section>
  );
});

export const SectionHead = React.forwardRef(function SectionHead(
  { eyebrow, title, lede, align = 'start', as: Heading = 'h2', className, children, ...rest },
  ref,
) {
  injectEfCss('ef-css-section', CSS);
  return (
    <div
      {...rest}
      ref={ref}
      data-slot="section-head"
      data-align={align === 'center' ? 'center' : 'start'}
      className={`ef-section-head${className ? ` ${className}` : ''}`}
    >
      {eyebrow ? <p className="ef-section-head__eyebrow">{eyebrow}</p> : null}
      <Heading className="ef-section-head__title">{title}</Heading>
      {lede ? <p className="ef-section-head__lede">{lede}</p> : null}
      {children}
    </div>
  );
});
