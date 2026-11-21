import { afterEach, describe, expect, it } from 'vitest';
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
    act(() => callback([{ isIntersecting: true }]));
    act(() => frames.shift()(performance.now() + 400));
    window.requestAnimationFrame = raf;
    expect(container.querySelector('.ef-counter__live').textContent).toMatch(/^[\d,]+$/);
  });
});
