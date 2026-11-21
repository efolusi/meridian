'use client';
import React from 'react';
import { injectEfCss } from '../runtime/runtime.jsx';

// The final value is in the markup from the start (server render, no JavaScript, screen readers).
// The live layer only overlays it, so the width never changes while the number climbs.
const CSS = `
.ef-counter{display:inline-grid;font-variant-numeric:tabular-nums}
.ef-counter>*{grid-area:1/1}
.ef-counter__live{text-align:inherit}
.ef-counter__final{opacity:0}
`;

const DURATION_MS = 1200;
const easeOut = (t) => 1 - (1 - t) ** 3;
// The climbing number keeps the decimals of the final value, so 12400 never shows 3,191.117.
const decimalsOf = (n) => (String(n).split('.')[1] || '').length;

/** A stat number that counts up from 0 to `value` once it scrolls into view. Shows the final value at once without JavaScript, with reduced motion, or when `animate` is false. */
export const Counter = React.forwardRef(function Counter({ value, locale, format, animate = true, className, ...rest }, forwarded) {
  injectEfCss('ef-css-counter', CSS);
  const local = React.useRef(null);
  const formatter = React.useMemo(() => new Intl.NumberFormat(locale, format), [locale, JSON.stringify(format)]);
  const final = formatter.format(value);
  const [shown, setShown] = React.useState(final);
  React.useEffect(() => {
    setShown(final);
    const node = local.current;
    const reduce = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!animate || reduce || !node || typeof IntersectionObserver === 'undefined') return undefined;
    let frame = 0;
    const decimals = decimalsOf(value);
    const step = (v) => Number(v.toFixed(decimals));
    setShown(formatter.format(0));
    const run = () => {
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / DURATION_MS);
        setShown(formatter.format(t === 1 ? value : step(value * easeOut(t))));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      observer.disconnect();
      run();
    }, { threshold: 0.4 });
    observer.observe(node);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [value, final, animate, formatter]);
  const ref = (node) => {
    local.current = node;
    if (typeof forwarded === 'function') forwarded(node);
    else if (forwarded) forwarded.current = node;
  };
  return (
    <span {...rest} ref={ref} data-slot="counter" className={className ? `ef-counter ${className}` : 'ef-counter'}>
      <span className="ef-counter__final">{final}</span>
      <span className="ef-counter__live" aria-hidden="true">{shown}</span>
    </span>
  );
});
