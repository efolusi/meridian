import React from 'react';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Input } from '../components/forms/Input.jsx';
import { NumberInput } from '../components/forms/NumberInput.jsx';
import { NativeSelect } from '../components/forms/NativeSelect.jsx';

// MD82: sso forced its sign-in fields to 52px in its own CSS because Meridian stopped at `lg` (44px) while Button has
// `xl` (52px). The three fields that have a `size` prop get `xl` at the Button xl height, --control-h-xl, so a form
// and its submit button line up without a CSS override. --control-h-xl is not part of the pointer:coarse block of
// spacing.css (only xs to lg grow to --tap-min), so it stays 52px on touch, and 46px in compact density, both above 44.
const read = (file) => readFileSync(file, 'utf8');
const css = (file) => /const CSS = `([\s\S]*?)`;/.exec(read(file))[1];

describe('Input, NumberInput and NativeSelect take size xl (MD82)', () => {
  it('Input size="xl" carries the xl class and no other size class', () => {
    const { container } = render(<Input aria-label="Email" size="xl" />);
    const el = container.querySelector('input');
    expect(el.className).toBe('ef-input__el ef-input__el--xl');
    expect(el.hasAttribute('size')).toBe(false);
  });

  it('Input size="xl" with an icon uses the large icon', () => {
    const { container } = render(<Input aria-label="Email" size="xl" iconLeft="mail" />);
    expect(container.querySelector('.ef-input__icon [data-slot="icon"]').getAttribute('data-size')).toBe('20');
  });

  it('NumberInput size="xl" carries ef-number--xl', () => {
    const { container } = render(<NumberInput aria-label="Seats" size="xl" defaultValue={3} />);
    expect(container.querySelector('.ef-number').className).toContain('ef-number--xl');
  });

  it('NativeSelect size="xl" sets data-size="xl"', () => {
    const { container } = render(<NativeSelect aria-label="Region" size="xl"><option>EU</option></NativeSelect>);
    expect(container.querySelector('[data-slot="native-select"]').getAttribute('data-size')).toBe('xl');
  });
});

describe('the xl rules use the Button xl height', () => {
  it('Button xl and Input xl read the same token', () => {
    expect(css('components/forms/Button.jsx')).toContain('.ef-btn--xl{height:var(--control-h-xl)');
    expect(css('components/forms/Input.jsx')).toContain('.ef-input__el--xl{height:var(--control-h-xl);padding-inline:var(--space-4);font-size:var(--text-lg)}');
  });

  it('Input xl with an icon pads for the 20px icon, like lg', () => {
    expect(css('components/forms/Input.jsx')).toContain('.ef-input--icon .ef-input__el--xl{padding-inline-start:calc(var(--space-3) + var(--icon-lg) + var(--space-2))}');
  });

  it('NumberInput xl is the xl height less the 1px borders, with the lg padding, size and step width', () => {
    const text = css('components/forms/NumberInput.jsx');
    expect(text).toContain('.ef-number--xl .ef-number__el{height:calc(var(--control-h-xl) - 2px);padding:0 var(--space-4);font-size:var(--text-lg)}');
    expect(text).toContain('.ef-number--xl .ef-number__step{width:28px}');
  });

  it('NativeSelect xl is the xl height and the xl text size, as Input xl is', () => {
    expect(css('components/forms/NativeSelect.jsx')).toContain('.ef-native-select[data-size="xl"] select{height:var(--control-h-xl);font-size:var(--text-lg)}');
  });
});

describe('xl stays a touch target on a coarse pointer', () => {
  const spacing = read('tokens/spacing.css');
  const coarse = spacing.slice(spacing.indexOf('@media (pointer: coarse)'));

  it('the coarse block does not touch --control-h-xl, so it stays 52px on touch', () => {
    expect(coarse).toContain('--control-h-lg: var(--tap-min)');
    expect(coarse).not.toContain('--control-h-xl');
  });

  it('--control-h-xl is at least --tap-min (44px) in both densities', () => {
    const values = [...spacing.matchAll(/--control-h-xl:\s*(\d+)px/g)].map((m) => Number(m[1]));
    expect(values).toEqual([52, 46]);
    for (const value of values) expect(value).toBeGreaterThanOrEqual(44);
  });
});

describe('the types, the prompt guides and the demo name xl', () => {
  it('lists xl in the three .d.ts files', () => {
    expect(read('components/forms/Input.d.ts')).toMatch(/size\?: number \| 'sm' \| 'md' \| 'lg' \| 'xl'/);
    expect(read('components/forms/NumberInput.d.ts')).toMatch(/size\?: 'sm' \| 'md' \| 'lg' \| 'xl'/);
    expect(read('components/forms/NativeSelect.d.ts')).toMatch(/size\?: 'sm' \| 'md' \| 'lg' \| 'xl'/);
  });

  it('says in the Input prompt guide that xl matches Button xl and is for the main form of a page', () => {
    expect(read('components/forms/Input.prompt.md')).toMatch(/`xl`[^.]*Button[^.]*52px/);
  });

  it('has an Input demo of the sizes with xl', () => {
    expect(read('site/examples/forms.jsx')).toMatch(/@demo Input Sizes[\s\S]*size="xl"/);
  });
});
