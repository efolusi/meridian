import React from 'react';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle } from '../components/display/Card.jsx';

// MD83: sso, pay and efolusi.com each wrote their own page title (three sizes in sso alone) and sso forced its card
// titles to the display face. Meridian now has one class for the app page title, `.ef-page-title` (display face,
// --text-3xl to --text-4xl, the step SectionHead and the pay and sso billing titles already use), and CardTitle takes
// size="display" for a section card that wants the display face.
const read = (file) => readFileSync(file, 'utf8');
const declarations = (text, selector) => {
  const at = text.indexOf(`\n${selector}{`);
  expect(at, `${selector} rule`).toBeGreaterThan(-1);
  return text.slice(at + selector.length + 2, text.indexOf('}', at));
};

describe('.ef-page-title (tokens/base.css)', () => {
  const base = read('tokens/base.css');
  const rule = declarations(base, '.ef-page-title');

  it('is the display face at --text-3xl to --text-4xl, tokens only', () => {
    expect(rule).toContain('font-family:var(--font-display)');
    expect(rule).toContain('font-size:clamp(var(--text-3xl),4vw,var(--text-4xl))');
    expect(rule).toContain('font-weight:var(--weight-bold)');
    expect(rule).toContain('line-height:var(--leading-tight)');
    expect(rule).toContain('letter-spacing:var(--tracking-display)');
    expect(rule).not.toMatch(/\d+px|\d+rem|#[0-9a-f]{3,6}/i);
    expect(rule).not.toContain('!important');
  });

  it('balances the wrap, breaks a long word and has no margin of its own', () => {
    expect(rule).toContain('text-wrap:balance');
    // break-word, not anywhere: anywhere also lowers the min-content width, so in a flex or grid row the title
    // would collapse to one letter per line instead of keeping its column.
    expect(rule).toContain('overflow-wrap:break-word');
    expect(rule).not.toContain('overflow-wrap:anywhere');
    expect(rule).toContain('margin:0');
  });

  it('sits in the meridian layer, before the unlayered forced-colors block', () => {
    const at = base.indexOf('.ef-page-title{');
    expect(at).toBeLessThan(base.indexOf('@media (forced-colors:active)'));
    expect(base.slice(0, at).split('@layer meridian{').length - 1).toBe(1);
  });
});

describe('CardTitle size="display" (MD83)', () => {
  it('adds the display modifier, and the default has none', () => {
    render(<Card><CardHeader><CardTitle size="display">Plan</CardTitle><CardTitle>Usage</CardTitle></CardHeader></Card>);
    expect(screen.getByRole('heading', { name: 'Plan' }).className).toBe('ef-card__title ef-card__title--display');
    expect(screen.getByRole('heading', { name: 'Usage' }).className).toBe('ef-card__title');
  });

  it('does not forward size to the DOM, and keeps as, className and ref', () => {
    const ref = React.createRef();
    render(<Card><CardHeader><CardTitle ref={ref} as="h3" size="display" className="extra">Billing</CardTitle></CardHeader></Card>);
    const heading = screen.getByRole('heading', { name: 'Billing', level: 3 });
    expect(heading.hasAttribute('size')).toBe(false);
    expect(heading.className).toBe('ef-card__title ef-card__title--display extra');
    expect(ref.current).toBe(heading);
  });

  it('the display modifier is the display face at --text-2xl, as sso forced it', () => {
    const css = /const CSS = `([\s\S]*?)`;/.exec(read('components/display/Card.jsx'))[1];
    const rule = declarations(css, '.ef-card__title--display');
    expect(rule).toBe('font-family:var(--font-display);font-size:var(--text-2xl);font-weight:var(--weight-bold);line-height:var(--leading-snug);letter-spacing:var(--tracking-display)');
  });

  it('is typed and documented', () => {
    expect(read('components/display/Card.d.ts')).toMatch(/interface CardTitleProps[\s\S]*size\?: 'default' \| 'display'/);
    expect(read('components/display/Card.prompt.md')).toMatch(/size="display"/);
    expect(read('components/display/Card.prompt.md')).toMatch(/ef-page-title/);
  });
});

describe('docs and demo', () => {
  it('has a demo that uses both', () => {
    expect(read('site/examples/display.jsx')).toMatch(/@demo Card Page title and display card title[\s\S]*ef-page-title[\s\S]*size="display"/);
  });
});
