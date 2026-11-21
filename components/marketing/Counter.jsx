'use client';
import React from 'react';
import { injectEfCss } from '../runtime/runtime.jsx';

// The final value is in the markup from the start (server render, no JavaScript, screen readers).
// The live layer only overlays it, so the width never changes while the number climbs.
const CSS = `
.ef-counter{display:inline-grid;font-variant-numeric:tabular-nums}
.ef-counter>*{grid-area:1/1}
.ef-counter__live{text-align:inherit;user-select:none}
.ef-counter__final{opacity:0}
@media print{.ef-counter__final{opacity:1}.ef-counter__live{visibility:hidden}}
`;

const DURATION_MS = 1200;
const easeOut = (t) => 1 - (1 - t) ** 3;
// The climbing number keeps the decimals of the final value, so 12400 never shows 3,191.117.
const decimalsOf = (n) => (String(n).split('.')[1] || '').length;

/** A stat number that counts up from 0 to `value` once it scrolls into view. Shows the final value at once without JavaScript, with reduced motion, when `animate` is false, or when it is already in view at load. A new `value` climbs from the number on screen. */
export const Counter = React.forwardRef(function Counter({ value, locale = 'en', format, animate = true, className, ...rest }, forwarded) {
  injectEfCss('ef-css-counter', CSS);
  const local = React.useRef(null);
  const numeric = Number.isFinite(Number(value));
  const formatter = React.useMemo(() => new Intl.NumberFormat(locale, format), [locale, JSON.stringify(format)]);
  const final = numeric ? formatter.format(Number(value)) : String(value);
  const [shown, setShown] = React.useState(final);
  // The number on screen and whether it was ever revealed, so a new value climbs from here and never from 0.
  const current = React.useRef(numeric ? Number(value) : 0);
  const revealed = React.useRef(false);
  React.useEffect(() => {
    if (!numeric) return undefined;
    const target = Number(value);
    const node = local.current;
    const reduce = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!animate || reduce || !node || typeof IntersectionObserver === 'undefined') {
      current.current = target; revealed.current = true; setShown(final);
      return undefined;
    }
    let frame = 0;
    const decimals = decimalsOf(target);
    const step = (v) => Number(v.toFixed(decimals));
    const climb = (from) => {
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / DURATION_MS);
        current.current = t === 1 ? target : from + (target - from) * easeOut(t);
        setShown(formatter.format(t === 1 ? target : step(current.current)));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    if (revealed.current) { climb(current.current); return () => cancelAnimationFrame(frame); }
    let first = true;
    const observer = new IntersectionObserver((entries) => {
      const inView = entries.some((e) => e.isIntersecting);
      const atLoad = first;
      first = false;
      if (!inView) {
        // Out of view at load: start from 0 so the climb is seen when it arrives.
        if (atLoad) { current.current = 0; setShown(formatter.format(0)); }
        return;
      }
      observer.disconnect();
      revealed.current = true;
      if (atLoad) { current.current = target; return; }
      climb(0);
    }, { threshold: 0.4 });
    observer.observe(node);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [value, final, numeric, animate, formatter]);
  const ref = (node) => {
    local.current = node;
    if (typeof forwarded === 'function') forwarded(node);
    else if (forwarded) forwarded.current = node;
  };
  if (!numeric) return <span {...rest} ref={ref} data-slot="counter" className={className ? `ef-counter ${className}` : 'ef-counter'}>{final}</span>;
  return (
    <span {...rest} ref={ref} data-slot="counter" className={className ? `ef-counter ${className}` : 'ef-counter'}>
      <span className="ef-counter__final">{final}</span>
      <span className="ef-counter__live" aria-hidden="true">{shown}</span>
    </span>
  );
});
