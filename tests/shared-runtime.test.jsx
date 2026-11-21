import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cssPct, injectEfCss, isElementOfType, mergeRefs, prefersReducedMotion, styleRef, useIsoLayoutEffect } from '../components/forms/Button.jsx';

// MD24 (#195): the helpers every component shares. These tests pin their behaviour, so moving
// them out of Button.jsx changes only where they are imported from.

describe('cssPct', () => {
  it('rounds to three decimals and keeps no trailing zeros', () => {
    expect(cssPct(100 / 3)).toBe('33.333%');
    expect(cssPct(33.3)).toBe('33.3%');
    expect(cssPct(50)).toBe('50%');
    expect(cssPct(0)).toBe('0%');
    expect(cssPct(80.06002337425701)).toBe('80.06%');
  });
});

describe('styleRef', () => {
  const node = () => document.createElement('div');

  it('sets numbers in px, strings as given, and custom properties', () => {
    const el = node();
    styleRef({ height: 12, width: '40%', '--ef-x': '3' })(el);
    expect([el.style.height, el.style.width, el.style.getPropertyValue('--ef-x')]).toEqual(['12px', '40%', '3']);
  });

  it('removes a property whose value is null, undefined or false', () => {
    const el = node();
    el.style.setProperty('height', '9px');
    el.style.setProperty('width', '9px');
    el.style.setProperty('top', '9px');
    styleRef({ height: null, width: undefined, top: false })(el);
    expect([el.style.height, el.style.width, el.style.top]).toEqual(['', '', '']);
  });

  it('does nothing for a null node (unmount)', () => {
    expect(() => styleRef({ height: 1 })(null)).not.toThrow();
  });
});

describe('mergeRefs', () => {
  it('calls function refs and assigns object refs, and skips empty ones', () => {
    const fn = vi.fn();
    const obj = { current: null };
    const merged = mergeRefs(fn, obj, null, undefined);
    merged('node');
    expect(fn).toHaveBeenCalledWith('node');
    expect(obj.current).toBe('node');
    merged(null);
    expect(fn).toHaveBeenLastCalledWith(null);
    expect(obj.current).toBeNull();
  });
});

describe('useIsoLayoutEffect', () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

  it('is useLayoutEffect where there is a window', () => {
    expect(useIsoLayoutEffect).toBe(React.useLayoutEffect);
  });

  it('is useEffect on the server, so renderToString does not warn', async () => {
    vi.resetModules();
    vi.stubGlobal('window', undefined);
    const mod = await import('../components/forms/Button.jsx');
    expect(mod.useIsoLayoutEffect).toBe(React.useEffect);
  });
});

describe('prefersReducedMotion', () => {
  afterEach(() => { delete window.matchMedia; });

  it('is false without matchMedia', () => {
    delete window.matchMedia;
    expect(prefersReducedMotion()).toBe(false);
  });

  it('follows the reduced-motion media query', () => {
    const seen = [];
    window.matchMedia = (query) => { seen.push(query); return { matches: true }; };
    expect(prefersReducedMotion()).toBe(true);
    expect(seen).toEqual(['(prefers-reduced-motion: reduce)']);
    window.matchMedia = () => ({ matches: false });
    expect(prefersReducedMotion()).toBe(false);
  });
});

describe('isElementOfType', () => {
  const Target = () => null;
  const Other = () => null;

  it('is true for an element of the component and false for anything else', () => {
    expect(isElementOfType(<Target />, Target)).toBe(true);
    expect(isElementOfType(<Other />, Target)).toBe(false);
    expect(isElementOfType('text', Target)).toBe(false);
    expect(isElementOfType(null, Target)).toBe(false);
  });

  it('unwraps a lazy client reference, suspending while it loads', async () => {
    const lazy = React.lazy(() => Promise.resolve({ default: Target }));
    const element = React.createElement(lazy);
    let thrown;
    try { isElementOfType(element, Target); } catch (e) { thrown = e; }
    expect(typeof thrown?.then).toBe('function');
    await thrown;
    expect(isElementOfType(element, Target)).toBe(true);
    expect(isElementOfType(element, Other)).toBe(false);
  });
});

describe('injectEfCss', () => {
  beforeEach(() => document.head.querySelectorAll('style[id^="ef-css-pin"]').forEach((s) => s.remove()));

  it('adds one style element per id, wrapped in the meridian layer', () => {
    injectEfCss('ef-css-pin-a', '.a{color:red}');
    injectEfCss('ef-css-pin-a', '.a{color:blue}');
    const styles = document.head.querySelectorAll('style#ef-css-pin-a');
    expect(styles).toHaveLength(1);
    expect(styles[0].textContent).toBe('@layer meridian{.a{color:red}}');
  });

  it('does nothing without a document', async () => {
    vi.resetModules();
    vi.stubGlobal('document', undefined);
    const mod = await import('../components/forms/Button.jsx');
    expect(() => mod.injectEfCss('ef-css-pin-b', '.b{}')).not.toThrow();
    vi.unstubAllGlobals();
    expect(document.getElementById('ef-css-pin-b')).toBeNull();
    vi.resetModules();
  });
});
