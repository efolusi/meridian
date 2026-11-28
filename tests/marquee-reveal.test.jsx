import { afterEach, describe, expect, it } from 'vitest';
import { act, fireEvent, render } from '@testing-library/react';
import { Marquee } from '../components/marketing/Marquee.jsx';
import { Reveal } from '../components/marketing/Reveal.jsx';

const css = (id) => document.getElementById(id).textContent.replace(/\s+/g, '');

describe('Marquee', () => {
  it('lists the items once for screen readers and hides the moving copy', () => {
    const { container, getByRole } = render(<Marquee label="What we build" items={['Open', 'Private']} />);
    expect(getByRole('list', { name: 'What we build' }).querySelectorAll('li')).toHaveLength(2);
    expect(container.querySelector('.ef-marquee__viewport').getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelectorAll('.ef-marquee__item')).toHaveLength(4);
  });

  it('pauses on hover, keyboard focus and its button, and stops with reduced motion', () => {
    const { getByRole, container } = render(<Marquee lang="id" items={['a']} />);
    const rules = css('ef-css-marquee');
    // Hover pauses it only where a pointer can hover (MD132 sweep); keyboard focus and the button always do.
    expect(rules).toMatch(/@media\(hover:hover\)\{\.ef-marquee:hover\.ef-marquee__track\{animation-play-state:paused\}\}/);
    expect(rules).toMatch(/\.ef-marquee:focus-within\.ef-marquee__track,\.ef-marquee\[data-paused\]\.ef-marquee__track\{animation-play-state:paused\}/);
    expect(rules).toMatch(/@media\(prefers-reduced-motion:reduce\)\{\.ef-marquee__track\{animation:none\}/);
    const button = getByRole('button', { name: 'Jeda daftar berjalan' });
    fireEvent.click(button);
    expect(container.firstChild.hasAttribute('data-paused')).toBe(true);
    expect(button.getAttribute('aria-label')).toBe('Putar daftar berjalan');
  });
});

describe('Reveal', () => {
  afterEach(() => { delete window.matchMedia; delete window.IntersectionObserver; });

  it('shows content at once with reduced motion', () => {
    window.matchMedia = (q) => ({ matches: q.includes('reduce') });
    const { container } = render(<Reveal>Hello</Reveal>);
    expect(container.firstChild.getAttribute('data-reveal')).toBe('shown');
  });

  it('waits for the element to scroll into view, then shows it', () => {
    window.matchMedia = () => ({ matches: false });
    let callback;
    window.IntersectionObserver = class { constructor(cb) { callback = cb; } observe() {} unobserve() {} };
    const { container } = render(<Reveal>Hello</Reveal>);
    const node = container.firstChild;
    expect(node.getAttribute('data-reveal')).toBe('pending');
    act(() => callback([{ isIntersecting: true, target: node }]));
    expect(node.getAttribute('data-reveal')).toBe('shown');
  });

  it('keeps content visible before the script runs', () => {
    render(<Reveal>Hello</Reveal>);
    expect(css('ef-css-reveal')).not.toMatch(/^\[data-reveal\]\{opacity:0/);
  });
});
