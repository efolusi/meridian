import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { act, render } from '@testing-library/react';
import { Counter } from '../components/marketing/Counter.jsx';

describe('Counter', () => {
  afterEach(() => { delete window.matchMedia; delete window.IntersectionObserver; });

  it('puts the final value in the markup and hides the live layer from screen readers', () => {
    const { container } = render(<Counter value={12400} locale="en" />);
    expect(container.querySelector('.ef-counter__final').textContent).toBe('12,400');
    expect(container.querySelector('.ef-counter__live').getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelector('.ef-counter__live').textContent).toBe('12,400');
  });

  it('formats with Intl options', () => {
    const { container } = render(<Counter value={0.98} locale="en" format={{ style: 'percent' }} />);
    expect(container.querySelector('.ef-counter__final').textContent).toBe('98%');
  });

  it('shows the final value at once with reduced motion', () => {
    window.matchMedia = () => ({ matches: true });
    window.IntersectionObserver = class { observe() { throw new Error('must not observe'); } disconnect() {} };
    const { container } = render(<Counter value={50} locale="en" />);
    expect(container.querySelector('.ef-counter__live').textContent).toBe('50');
  });

  it('starts from 0 and waits for the number to scroll into view', () => {
    window.matchMedia = () => ({ matches: false });
    let callback;
    window.IntersectionObserver = class { constructor(cb) { callback = cb; } observe() {} disconnect() {} };
    const { container } = render(<Counter value={50} locale="en" />);
    act(() => callback([{ isIntersecting: false }]));
    expect(container.querySelector('.ef-counter__live').textContent).toBe('0');
    expect(container.querySelector('.ef-counter__final').textContent).toBe('50');
    expect(callback).toBeTypeOf('function');
  });

  it('shows the final value at once when animate is false', () => {
    window.matchMedia = () => ({ matches: false });
    window.IntersectionObserver = class { observe() { throw new Error('must not observe'); } disconnect() {} };
    const { container } = render(<Counter value={50} locale="en" animate={false} />);
    expect(container.querySelector('.ef-counter__live').textContent).toBe('50');
  });

  it('keeps whole numbers whole while it climbs', async () => {
    window.matchMedia = () => ({ matches: false });
    let callback;
    window.IntersectionObserver = class { constructor(cb) { callback = cb; } observe() {} disconnect() {} };
    const { container } = render(<Counter value={12400} locale="en" />);
    const frames = [];
    const raf = window.requestAnimationFrame;
    window.requestAnimationFrame = (fn) => { frames.push(fn); return frames.length; };
    act(() => callback([{ isIntersecting: false }]));
    act(() => callback([{ isIntersecting: true }]));
    act(() => frames.shift()(performance.now() + 400));
    window.requestAnimationFrame = raf;
    expect(container.querySelector('.ef-counter__live').textContent).toMatch(/^[\d,]+$/);
  });

  it('formats with a fixed default locale, so the server and the browser agree', () => {
    const html = renderToString(<Counter value={12400} />);
    expect(html).toContain('12,400');
    // The browser's default locale differs from the server's: a formatter with no locale would now print 12.400.
    const Original = Intl.NumberFormat;
    const lang = vi.spyOn(Intl, 'NumberFormat').mockImplementation(function (locale, options) { return new Original(locale ?? 'id-ID', options); });
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    act(() => { hydrateRoot(container, <Counter value={12400} />); });
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore(); lang.mockRestore(); container.remove();
  });

  it('shows the final value and does not restart when it is already in view at load', () => {
    window.matchMedia = () => ({ matches: false });
    let callback;
    window.IntersectionObserver = class { constructor(cb) { callback = cb; } observe() {} disconnect() {} };
    const frames = vi.spyOn(window, 'requestAnimationFrame');
    const { container } = render(<Counter value={50} locale="en" />);
    act(() => callback([{ isIntersecting: true }]));
    expect(container.querySelector('.ef-counter__live').textContent).toBe('50');
    expect(frames).not.toHaveBeenCalled();
    frames.mockRestore();
  });

  it('climbs from the number on screen when the value changes, never from 0', () => {
    window.matchMedia = () => ({ matches: false });
    let callback;
    window.IntersectionObserver = class { constructor(cb) { callback = cb; } observe() {} disconnect() {} };
    const { container, rerender } = render(<Counter value={100} locale="en" />);
    act(() => callback([{ isIntersecting: true }]));
    const queue = [];
    const raf = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((fn) => { queue.push(fn); return queue.length; });
    rerender(<Counter value={120} locale="en" />);
    const seen = [];
    for (let i = 0; i < 40 && queue.length; i++) {
      act(() => queue.shift()(performance.now() + i * 40));
      seen.push(Number(container.querySelector('.ef-counter__live').textContent.replace(/,/g, '')));
    }
    raf.mockRestore();
    expect(Math.min(...seen)).toBeGreaterThanOrEqual(100);
    expect(seen.at(-1)).toBe(120);
  });

  it('renders a value that is not a number as plain text', () => {
    const { container } = render(<Counter value="abc" />);
    expect(container.textContent).toBe('abc');
    expect(container.querySelector('.ef-counter__live')).toBeNull();
  });

  it('is not selectable while it climbs, and prints the final value', () => {
    render(<Counter value={5} />);
    const rules = document.getElementById('ef-css-counter').textContent.replace(/\s+/g, '');
    expect(rules).toContain('.ef-counter__live{text-align:inherit;user-select:none}');
    expect(rules).toContain('@mediaprint{.ef-counter__final{opacity:1}.ef-counter__live{visibility:hidden}}');
  });
});
