import React from 'react';
import { readFileSync } from 'node:fs';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button, buttonVariants } from '../components/forms/Button.jsx';
import { THEMES, ratio } from './helpers/token-table.mjs';
import { rulesOf } from './helpers/component-css.mjs';

// MD94: the trailing arrow bubble and the on-band variant. The bubble is the button's label colour and the arrow is the
// button's own fill, so the bubble reads on the button (3:1, WCAG 1.4.11) and the arrow reads on the bubble (4.5:1).
const source = readFileSync('components/forms/Button.jsx', 'utf8');
const css = /const CSS = `([\s\S]*?)`;/.exec(source)[1];
const rules = rulesOf(css);
const rule = (selector) => rules.find((r) => r.selector === selector)?.body ?? '';
const decl = (body, property) => new RegExp(`(?:^|;)${property.replace(/[-]/g, '\\-')}:([^;]+)`).exec(body)?.[1];

describe('Button iconBubble (MD94)', () => {
  it.each(['md', 'lg', 'xl'])('draws a round bubble at %s, makes the button a pill and replaces iconRight', (size) => {
    const { container } = render(<Button size={size} iconBubble="arrow-right" iconRight="plus">Start</Button>);
    const button = container.querySelector('button');
    expect(button.classList.contains('ef-btn--bubble')).toBe(true);
    expect(button.classList.contains('ef-btn--pill')).toBe(true);
    const bubble = button.querySelector('.ef-btn__bubble');
    expect(bubble).not.toBeNull();
    expect(bubble.getAttribute('aria-hidden')).toBe('true');
    expect(bubble.querySelector('[data-slot="icon"]').dataset.size).toBe(size === 'md' ? '16' : '20');
    expect(button.querySelectorAll('[data-slot="icon"]')).toHaveLength(1);
    expect(button.lastElementChild).toBe(bubble);
  });

  it.each([
    ['ghost', 'md'], ['link', 'md'], ['primary', 'sm'], ['primary', 'xs'], ['primary', 'icon'],
  ])('keeps a plain trailing icon on %s at %s, where a bubble does not fit', (variant, size) => {
    const { container } = render(<Button variant={variant} size={size} iconBubble="arrow-right">Go</Button>);
    const button = container.querySelector('button');
    expect(button.querySelector('.ef-btn__bubble')).toBeNull();
    expect(button.classList.contains('ef-btn--bubble')).toBe(false);
    expect(button.querySelector('[data-slot="icon"]')).not.toBeNull();
  });

  it('draws the spinner inside the bubble and keeps the left icon while loading', () => {
    const { container } = render(<Button iconLeft="plus" iconBubble="arrow-right" loading>Saving</Button>);
    const button = container.querySelector('button');
    expect(button.querySelector('.ef-btn__bubble .ef-btn__spin')).not.toBeNull();
    expect(button.querySelectorAll('.ef-btn__spin')).toHaveLength(1);
    expect(button.getAttribute('aria-busy')).toBe('true');
  });

  it('is off by default: a plain Button has no bubble', () => {
    const { container } = render(<Button iconRight="arrow-right">Go</Button>);
    expect(container.querySelector('.ef-btn__bubble')).toBeNull();
    expect(container.querySelector('button').className).not.toContain('bubble');
  });

  it('gives a link the same classes through buttonVariants', () => {
    expect(buttonVariants({ size: 'xl', bubble: true })).toBe('ef-btn ef-btn--primary ef-btn--xl ef-btn--pill ef-btn--bubble');
    expect(buttonVariants({ variant: 'ghost', bubble: true })).toBe('ef-btn ef-btn--ghost ef-btn--md');
    expect(buttonVariants({ variant: 'band', size: 'lg' })).toBe('ef-btn ef-btn--band ef-btn--lg');
  });
});

describe('Button bubble pair cascade', () => {
  it('no rule that applies to every bubble sets the pair: it would override the variant (same specificity, later in the sheet)', () => {
    // Found on the built page: a .ef-btn--bubble default put the secondary ink on the primary bubble, 2.37:1 in dark.
    for (const selector of ['.ef-btn--bubble', '.ef-btn__bubble']) {
      expect(decl(rule(selector), '--ef-btn-ink'), selector).toBeUndefined();
      expect(decl(rule(selector), '--ef-btn-fill'), selector).toBeUndefined();
    }
  });

  it.each(['primary', 'secondary', 'brand', 'danger', 'band'])('%s sets both halves of the pair itself', (variant) => {
    expect(decl(rule(`.ef-btn--${variant}`), '--ef-btn-ink'), variant).toBeDefined();
    expect(decl(rule(`.ef-btn--${variant}`), '--ef-btn-fill'), variant).toBeDefined();
  });
});

describe('Button bubble sizes follow the control heights', () => {
  it.each([['md', '5px'], ['lg', '6px'], ['xl', '8px']])('%s: the circle is the control height less twice the inset (%s), and the end padding is the inset', (size, inset) => {
    expect(decl(rule(`.ef-btn--bubble.ef-btn--${size}`), '--ef-btn-inset')).toBe(inset);
    expect(decl(rule(`.ef-btn--bubble.ef-btn--${size}`), 'padding-inline-end')).toBe('var(--ef-btn-inset)');
    const bubble = rule(`.ef-btn--${size} .ef-btn__bubble`);
    expect(decl(bubble, 'width')).toBe(`calc(var(--control-h-${size}) - 2 * var(--ef-btn-inset))`);
    expect(decl(bubble, 'height')).toBe(decl(bubble, 'width'));
  });

  it('is a circle with no physical side padding', () => {
    expect(decl(rule('.ef-btn__bubble'), 'border-radius')).toBe('var(--radius-full)');
    expect(css).not.toMatch(/padding-(?:left|right)/);
  });
});

// The fill and ink pairs: [selector, fill token (or the band's own), ink token], per state.
const PAIRS = [
  ['primary', '.ef-btn--primary', 'var(--accent)'],
  ['primary hover', '.ef-btn--primary:hover', 'var(--accent-hover)'],
  ['primary active', '.ef-btn--primary:active', 'var(--accent-active)'],
  ['secondary', '.ef-btn--secondary', 'var(--surface-page)'],
  ['brand', '.ef-btn--brand', 'var(--surface-brand)'],
  ['brand hover', '.ef-btn--brand:hover', 'var(--surface-brand-hover)'],
  ['danger', '.ef-btn--danger', 'var(--status-danger-solid)'],
  ['danger hover', '.ef-btn--danger:hover', 'var(--danger-700)'],
  ['band', '.ef-btn--band', 'var(--cream-50)'],
  ['band hover', '.ef-btn--band:hover', 'var(--brand-200)'],
  ['band active', '.ef-btn--band:active', 'var(--brand-300)'],
];

describe('Button bubble contrast, from the tokens', () => {
  it.each(PAIRS)('%s: the arrow is the button fill', (_name, selector, fill) => {
    expect(decl(rule(selector), '--ef-btn-fill')).toBe(fill);
  });

  it('the bubble is the ink and the ink is the label colour', () => {
    expect(decl(rule('.ef-btn__bubble'), 'background')).toBe('var(--ef-btn-ink)');
    expect(decl(rule('.ef-btn__bubble'), 'color')).toBe('var(--ef-btn-fill)');
    expect(decl(rule('.ef-btn--primary'), '--ef-btn-ink')).toBe('var(--accent-contrast)');
    expect(decl(rule('.ef-btn--secondary'), '--ef-btn-ink')).toBe('var(--text-primary)');
    expect(decl(rule('.ef-btn--brand'), '--ef-btn-ink')).toBe('var(--text-on-brand)');
    expect(decl(rule('.ef-btn--danger'), '--ef-btn-ink')).toBe('var(--status-danger-on-solid)');
    expect(decl(rule('.ef-btn--band'), '--ef-btn-ink')).toBe('var(--brand-950)');
    expect(decl(rule('.ef-btn--band'), 'color')).toBe('var(--brand-950)');
  });

  const INKS = { primary: '--accent-contrast', secondary: '--text-primary', brand: '--text-on-brand', danger: '--status-danger-on-solid', band: '--brand-950' };
  const cases = PAIRS.flatMap(([name, selector, fill]) => THEMES.map(([theme, table]) => [`${name} in ${theme}`, table, INKS[name.split(' ')[0]], /^var\((--[\w-]+)\)$/.exec(fill)[1]]));

  it.each(cases)('%s: bubble against button at least 3:1, arrow against bubble at least 4.5:1', (_name, table, ink, fill) => {
    // The bubble sits inside the button, so the bubble is measured against the fill the button has in that state.
    expect(ratio(table, ink, fill)).toBeGreaterThanOrEqual(4.5);
  });

  it('the band button is held by its accent edge on the cream band (3:1) and by its fill on the dark band', () => {
    for (const [theme, table] of THEMES) {
      expect(ratio(table, '--cream-50', '--surface-brand') >= 3 || ratio(table, '--accent-edge', '--surface-brand') >= 3, `${theme} band boundary`).toBe(true);
    }
  });

  it('the disabled primary keeps the neutral pair, bubble and arrow included', () => {
    const disabled = rule('.ef-btn--primary:is(:disabled,[aria-disabled="true"],[data-disabled]):not([data-loading])');
    expect(decl(disabled, '--ef-btn-ink')).toBe('var(--text-muted)');
    expect(decl(disabled, '--ef-btn-fill')).toBe('var(--surface-track)');
  });
});

describe('Button arrow nudge follows the motion tokens', () => {
  const nudge = css.slice(css.indexOf('@media (hover:hover){@media (prefers-reduced-motion:no-preference){'));
  const block = nudge.slice(0, nudge.indexOf('\n'));

  it('moves only with a fine pointer and only when motion is welcome, by the shift token', () => {
    expect(block).toContain('translate:var(--shift-sm) 0');
    expect(block).toContain('translate:calc(-1 * var(--shift-sm)) 0');
  });

  it('declares its transition inside that query, from the duration and curve tokens, so reduced motion has none', () => {
    expect(block).toContain('transition:translate var(--dur-base) var(--ease-enter)');
    expect(css.replace(block, '')).not.toMatch(/transition:[^;}]*\btranslate\b/);
    expect(block).not.toMatch(/\d+(?:ms|s)\b|cubic-bezier|ease-in|ease-out|linear/);
  });

  it('mirrors the arrow in right-to-left', () => {
    expect(decl(rule('.ef-btn__bubble:dir(rtl) [data-slot="icon"]'), 'transform')).toBe('scaleX(-1)');
  });
});
