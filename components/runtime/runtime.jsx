'use client';
// The helpers every component shares: CSS injection, ref plumbing, SSR-safe effects and a
// few small DOM guards. Lowercase exports only, so none of it joins the public namespace.
// It lives in components/ so the bundle, the npm build and the registry copy-in all take it
// the way they take a component file; a component imports it by relative path.
import React from 'react';
/**
 * Put a component's CSS in the document, inside the `meridian` cascade layer.
 *
 * THE LAYER IS THE POINT. This appends a <style> at runtime, so it always
 * lands after whatever stylesheet the app shipped, and at equal specificity
 * later wins. Consumer applications otherwise have to double their selectors
 * (`.hide-sm.hide-sm`) because a one-class utility lost to
 * `.ef-badge { display: inline-flex }`, and Meridian restates radii and colours
 * to get its own back. A design system that has to be out-specified by its
 * consumers is not a foundation, it is a competitor.
 *
 * An unlayered rule beats a layered one no matter the order or the
 * specificity, so app CSS now wins by default and meridian is the floor it
 * stands on. Products can stop fighting; the workarounds above can go.
 *
 * Note this changes precedence for pages that shipped before it. Anywhere an
 * app rule accidentally collided with a component rule and lost, it now wins.
 * That is the intended direction, but it is a real change and worth looking at
 * a page or two after upgrading.
 *
 * Server-rendered apps can also import a static components.css (the registry's
 * `meridian-ssr-css` item), so the HTML is styled before hydration. That sheet
 * lists `<id>_<hash>` pairs in `--ef-css-static` on :root, the hash being
 * FNV-1a over the exact text each component passes here. This skips an id only
 * when the hash of `text` matches: an edited copy, or a component from another
 * release than the sheet, injects its own CSS as before, so the static sheet
 * can save work but never replace a component's CSS. The list is read once per
 * page: reading it per call would force a style recalculation after every
 * <style> this appends.
 */
let efStaticCss;
function efCssHash(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}
export function injectEfCss(id, text) {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  if (!efStaticCss) {
    efStaticCss = new Map();
    const listed = getComputedStyle(document.documentElement).getPropertyValue('--ef-css-static').trim();
    for (const pair of listed ? listed.split(/\s+/) : []) {
      const at = pair.lastIndexOf('_');
      if (at > 0) efStaticCss.set(pair.slice(0, at), pair.slice(at + 1));
    }
  }
  const listedHash = efStaticCss.get(id);
  if (listedHash === true) return;
  if (listedHash !== undefined) {
    // Settle each id once: the hash runs on first render, not on every one.
    if (listedHash === efCssHash(text)) { efStaticCss.set(id, true); return; }
    efStaticCss.delete(id);
  }
  const s = document.createElement('style');
  s.id = id;
  s.textContent = `@layer meridian{${text}}`;
  document.head.appendChild(s);
}
/**
 * Format a number as a CSS percentage that survives server rendering.
 *
 * A bare `value + '%'` writes every digit JavaScript has: `1/3 * 100` becomes
 * `33.33333333333333%`. Browsers keep roughly six significant figures when they
 * parse an inline style, so the DOM reads back `33.3333%`, and React's
 * hydration check compares its own 16-digit string against the browser's
 * truncated one and reports a mismatch on every affected element. The bars in
 * Player, the fill in UsageMeter and the columns in BarChart all hit this.
 *
 * Rounding to three decimals stays well inside what the parser preserves and is
 * far below one pixel at any realistic size. Number-to-string drops trailing
 * zeros on its own, which matters: `33.300%` would be normalised to `33.3%` and
 * reintroduce the very mismatch this avoids.
 *
 * Lowercase, so it stays an internal helper rather than part of the public
 * namespace.
 */
export function cssPct(value) {
  return (Math.round(value * 1000) / 1000) + '%';
}
/**
 * A ref callback that sets CSS properties on the node through the CSSOM, so a runtime
 * value needs no style attribute (strict CSP drops those). null or undefined removes it.
 */
export function styleRef(values) {
  return (node) => {
    if (!node) return;
    for (const [name, value] of Object.entries(values)) {
      if (value == null || value === false) node.style.removeProperty(name);
      else node.style.setProperty(name, typeof value === 'number' ? `${value}px` : String(value));
    }
  };
}
/**
 * styleRef for values the component computes (a panel's position, a measured width)
 * under a style prop the caller passes: a property the caller's style already sets
 * is left to the caller, as `{ ...computed, ...style }` did when it was one attribute.
 * A caller shorthand covers its longhands: `inset` covers top, right, bottom and left, and
 * `flex` covers flex-basis.
 */
const SHORTHAND_COVERS = { inset: ['top', 'right', 'bottom', 'left'], flex: ['flex-basis'] };
export function styleRefUnder(values, style) {
  const own = {};
  const covered = new Set();
  for (const [shorthand, longhands] of Object.entries(SHORTHAND_COVERS)) {
    if (style?.[shorthand] != null) longhands.forEach(name => covered.add(name));
  }
  for (const [name, value] of Object.entries(values)) {
    const camel = name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    if (covered.has(name)) continue;
    if (style?.[camel] == null && style?.[name] == null) own[name] = value;
  }
  return styleRef(own);
}
/**
 * useLayoutEffect that is silent on the server.
 *
 * React warns when useLayoutEffect renders under renderToString; the effect
 * body is positioning work that only means anything with a DOM, so downgrading
 * to useEffect on the server is behaviour-identical. Lowercase: internal.
 */
export const useIsoLayoutEffect = typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;
const LAZY_TYPE = Symbol.for('react.lazy');
/**
 * Whether `child` is an element of `Component`, for compound components that
 * sort their children (Select items, Resizable panels, ScrollArea bars).
 *
 * Children written in a Next.js Server Component reach a client component with
 * a lazy client reference as their type, not the function, so a plain
 * `child.type === Component` is false there. Unwrap the lazy first. While its
 * module is still loading, `_init` throws the module's promise, which suspends
 * exactly as rendering the lazy element would.
 */
export function isElementOfType(child, Component) {
  if (!React.isValidElement(child)) return false;
  let type = child.type;
  if (type && type.$$typeof === LAZY_TYPE && typeof type._init === 'function') type = type._init(type._payload);
  return type === Component;
}
/**
 * The CSS kill-switch cannot reach JS-driven motion — rAF count-ups and
 * scrollTo({behavior:'smooth'}) — so those call sites ask here. Lowercase: internal.
 */
export function prefersReducedMotion() {
  return typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
/**
 * Point several refs at one node.
 *
 * A component that forwards a ref usually needs the same node itself — to
 * anchor an overlay, trap focus, or measure. Lowercase, so it stays an internal
 * helper rather than part of the public namespace.
 */
export function mergeRefs(...refs) {
  return node => {
    for (const r of refs) {
      if (!r) continue;
      if (typeof r === 'function') r(node);
      else r.current = node;
    }
  };
}
