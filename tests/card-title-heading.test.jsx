import React from 'react';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle } from '../components/display/Card.jsx';

// MD70: CardTitle was a div, so a page made of cards had no headings (WCAG 1.3.1). It is an h2 by default and
// takes `as` for the level the page needs; the look comes from .ef-card__title, not from the element.
describe('CardTitle is a heading (MD70)', () => {
  it('renders an h2 by default', () => {
    render(<Card><CardHeader><CardTitle>Usage</CardTitle></CardHeader></Card>);
    const heading = screen.getByRole('heading', { name: 'Usage' });
    expect(heading.tagName).toBe('H2');
    expect(heading.getAttribute('data-slot')).toBe('card-title');
    expect(heading.className).toBe('ef-card__title');
  });

  it('takes `as` for another level', () => {
    render(<Card><CardHeader><CardTitle as="h3">Billing</CardTitle></CardHeader></Card>);
    expect(screen.getByRole('heading', { name: 'Billing', level: 3 })).toBeTruthy();
  });

  it('keeps className, ref and other props on the heading', () => {
    const ref = React.createRef();
    render(<Card><CardHeader><CardTitle ref={ref} className="extra" id="t">Plan</CardTitle></CardHeader></Card>);
    expect(ref.current.tagName).toBe('H2');
    expect(ref.current.className).toBe('ef-card__title extra');
    expect(ref.current.id).toBe('t');
  });

  it('sets the font, margin and spacing the global h2 rule would otherwise supply', () => {
    // base.css gives h1-h4 the display font, tracking and snug leading in a lower layer; the title class wins.
    const css = /const CSS = `([\s\S]*?)`;/.exec(readFileSync('components/display/Card.jsx', 'utf8'))[1];
    const rule = css.slice(css.indexOf('.ef-card__title{'), css.indexOf('}', css.indexOf('.ef-card__title{')));
    for (const prop of ['margin:0', 'font-family:var(--font-sans)', 'letter-spacing:0', 'line-height:', 'font-size:', 'font-weight:']) expect(rule).toContain(prop);
  });
});
