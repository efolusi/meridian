'use client';
import React from 'react';
import { injectEfCss } from '../runtime/runtime.jsx';

// Content is visible until the script runs, so a page without JavaScript loses nothing.
const CSS = `
[data-reveal="pending"]{opacity:0;transform:translateY(var(--space-3));transition:opacity var(--dur-slow) var(--ease-enter),transform var(--dur-slow) var(--ease-enter)}
[data-reveal="shown"]{opacity:1;transform:none;transition:opacity var(--dur-slow) var(--ease-enter),transform var(--dur-slow) var(--ease-enter)}
@media (prefers-reduced-motion:reduce){[data-reveal]{opacity:1;transform:none;transition:none}}
`;

const STAGGER_MS = 70;
const FALLBACK_MS = 1600;
let observer = null;
const pending = new Map();

function observe(node, show) {
  if (typeof IntersectionObserver === 'undefined') { show(); return () => {}; }
  if (!observer) {
    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        pending.get(entry.target)?.();
        pending.delete(entry.target);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  }
  pending.set(node, show);
  observer.observe(node);
  return () => { pending.delete(node); observer?.unobserve(node); };
}

/** Fades and lifts its content in once it scrolls into view. `stagger` delays it by its index among Reveal siblings. */
export const Reveal = React.forwardRef(function Reveal({ as: Tag = 'div', stagger = true, className, style, children, ...rest }, forwarded) {
  injectEfCss('ef-css-reveal', CSS);
  const local = React.useRef(null);
  const [state, setState] = React.useState(undefined);
  const [delay, setDelay] = React.useState(0);
  React.useEffect(() => {
    const node = local.current;
    if (!node) return undefined;
    const reduce = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setState('shown'); return undefined; }
    if (stagger && node.parentNode) {
      const siblings = [...node.parentNode.children].filter((c) => c.hasAttribute('data-reveal'));
      setDelay(Math.max(0, siblings.indexOf(node)) * STAGGER_MS);
    }
    setState('pending');
    const show = () => setState('shown');
    const stop = observe(node, show);
    const timer = setTimeout(show, FALLBACK_MS);
    return () => { stop(); clearTimeout(timer); };
  }, [stagger]);
  const ref = (node) => {
    local.current = node;
    // The stagger delay goes through the CSSOM, not a style attribute (strict CSP drops those).
    // A transitionDelay the caller passes in style is theirs and stays.
    if (node && style?.transitionDelay == null) {
      if (delay && state) node.style.setProperty('transition-delay', `${delay}ms`);
      else node.style.removeProperty('transition-delay');
    }
    if (typeof forwarded === 'function') forwarded(node);
    else if (forwarded) forwarded.current = node;
  };
  return (
    <Tag
      {...rest}
      ref={ref}
      data-slot="reveal"
      data-reveal={state || ''}
      className={className}
      style={style}
    >
      {children}
    </Tag>
  );
});
