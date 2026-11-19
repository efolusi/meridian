'use client';
import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';

// Legal copy lives in dictionaries as plain strings. Two marks are read, nothing else,
// and nothing is ever rendered as HTML:
//   [label](href)  a link; "{lang}" in href becomes the page language
//   **text**       strong
const TOKEN = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;

export function parseLegalInline(text, lang = '') {
  const parts = [];
  let last = 0;
  for (const match of String(text).matchAll(TOKEN)) {
    if (match.index > last) parts.push({ type: 'text', text: text.slice(last, match.index) });
    if (match[1] !== undefined) parts.push({ type: 'link', text: match[1], href: match[2].replaceAll('{lang}', lang) });
    else parts.push({ type: 'strong', text: match[3] });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ type: 'text', text: text.slice(last) });
  return parts;
}

const SAFE_HREF = /^(https?:|mailto:|\/(?![/\\])|#|\.)/i;

function Inline({ text, lang }) {
  return parseLegalInline(text, lang).map((part, i) => {
    if (part.type === 'strong') return <strong key={i}>{part.text}</strong>;
    if (part.type === 'link') {
      // Only web, mail and in-site links; anything else (javascript:, data:) stays text.
      if (!SAFE_HREF.test(part.href)) return part.text;
      const external = /^https?:\/\//i.test(part.href);
      return <a key={i} href={part.href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{part.text}</a>;
    }
    return part.text;
  });
}

function Block({ block, lang }) {
  if (typeof block === 'string') return <p><Inline text={block} lang={lang} /></p>;
  if (block.h3) return <h3 id={block.id}><Inline text={block.h3} lang={lang} /></h3>;
  if (block.ul) return <ul>{block.ul.map((item, i) => <li key={i}><Inline text={item} lang={lang} /></li>)}</ul>;
  return null;
}

const CSS = `
.ef-legal{width:100%;max-width:var(--container-text);margin-inline:auto;padding:var(--space-12) var(--space-6) var(--space-16);color:var(--text-primary);font-size:var(--text-md);line-height:var(--leading-relaxed)}
.ef-legal__back{display:inline-flex;align-items:center;min-height:var(--tap-min);color:var(--text-secondary);text-decoration:none}
.ef-legal__back:hover{color:var(--text-primary)}
.ef-legal h1{margin:var(--space-4) 0 var(--space-2);font-family:var(--font-display);font-size:var(--text-4xl);line-height:var(--leading-tight);letter-spacing:var(--tracking-display)}
.ef-legal__meta{margin:0 0 var(--space-8);color:var(--text-muted);font-size:var(--text-sm)}
.ef-legal h2{margin:var(--space-10) 0 var(--space-3);font-family:var(--font-display);font-size:var(--text-2xl);line-height:var(--leading-snug);scroll-margin-top:calc(var(--control-h-lg) + var(--space-8))}
.ef-legal h3{margin:var(--space-6) 0 var(--space-2);font-size:var(--text-lg);scroll-margin-top:calc(var(--control-h-lg) + var(--space-8))}
.ef-legal p,.ef-legal ul{margin:0 0 var(--space-4)}
.ef-legal ul{padding-inline-start:var(--space-6)}
.ef-legal a{color:var(--text-link);text-decoration:underline;text-underline-offset:var(--space-1)}
.ef-legal a:hover{color:var(--text-link-hover)}
.ef-legal a:focus-visible{outline:none;border-radius:var(--radius-xs);box-shadow:var(--focus-ring)}
.ef-legal__toc{margin:var(--space-8) 0;padding:var(--space-5) var(--space-6);border:1px solid var(--border-default);border-radius:var(--radius-md);background:var(--surface-subtle)}
.ef-legal__toc-head{margin:0 0 var(--space-2);font-weight:var(--weight-semibold)}
.ef-legal__toc ol{margin:0;padding-inline-start:var(--space-6)}
.ef-legal__toc li{margin-block:var(--space-1)}
`;

/** The shared body of a terms or privacy page. Section ids are stable link targets (/terms#refunds). */
export const LegalDocument = React.forwardRef(function LegalDocument(
  { title, meta, intro = [], sections = [], contentsLabel, backLink, lang = '', className, ...rest },
  ref,
) {
  injectEfCss('ef-css-legal', CSS);
  return (
    <article {...rest} ref={ref} data-slot="legal-document" className={`ef-legal${className ? ` ${className}` : ''}`}>
      {backLink ? <a className="ef-legal__back" href={backLink.href}>{backLink.label}</a> : null}
      <h1>{title}</h1>
      {meta ? <p className="ef-legal__meta">{meta}</p> : null}
      {intro.map((block, i) => <Block key={i} block={block} lang={lang} />)}
      {contentsLabel && sections.length ? (
        <nav className="ef-legal__toc" aria-label={contentsLabel}>
          <p className="ef-legal__toc-head">{contentsLabel}</p>
          <ol>{sections.map((s) => <li key={s.id}><a href={`#${s.id}`}>{s.head}</a></li>)}</ol>
        </nav>
      ) : null}
      {sections.map((s) => (
        <section key={s.id} aria-labelledby={s.id}>
          <h2 id={s.id}>{s.head}</h2>
          {s.blocks.map((block, i) => <Block key={i} block={block} lang={lang} />)}
        </section>
      ))}
    </article>
  );
});
