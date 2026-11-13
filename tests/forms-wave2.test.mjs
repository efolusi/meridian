// Wave 2 (2026-11-13) owner decisions for forms and dates, pinned against the
// component CSS sources: control edges, option focus rings, coarse-pointer
// hit targets, disabled Switch label, Calendar header and range band.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = file => readFileSync(join(process.cwd(), 'components', file), 'utf8');

// Every declaration block whose selector list contains `selector` exactly.
function rules(file, selector) {
  const text = source(file);
  const out = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  for (const [, selectors, body] of text.matchAll(re)) {
    if (selectors.split('\n').pop().split(',').map(s => s.trim()).includes(selector)) out.push(body);
  }
  return out;
}
// The body of the first `@media (pointer:coarse)` block in a file.
function coarse(file) {
  const text = source(file);
  const at = text.indexOf('@media (pointer:coarse){');
  if (at < 0) return '';
  let depth = 0;
  for (let i = text.indexOf('{', at); i < text.length; i += 1) {
    if (text[i] === '{') depth += 1;
    if (text[i] === '}') { depth -= 1; if (depth === 0) return text.slice(at, i + 1); }
  }
  return '';
}

describe('1. form-control edges use --border-control', () => {
  const EDGES = [
    ['forms/Input.jsx', '.ef-input__el'],
    ['forms/Input.jsx', '.ef-file-input'],
    ['forms/Textarea.jsx', '.ef-textarea'],
    ['forms/Select.jsx', '.ef-select-trigger'],
    ['forms/NativeSelect.jsx', '.ef-native-select select'],
    ['forms/InputGroup.jsx', '.ef-input-group'],
    ['forms/Combobox.jsx', '.ef-combobox__chips'],
    ['forms/NumberInput.jsx', '.ef-number'],
    ['forms/InputOTP.jsx', '.ef-otp__slot'],
    ['forms/Checkbox.jsx', '.ef-check__box'],
    ['forms/Radio.jsx', '.ef-radio__dot'],
    ['forms/Switch.jsx', '.ef-switch'],
    ['dates/TimePicker.jsx', '.ef-timepicker__input'],
  ];
  for (const [file, selector] of EDGES) {
    it(`${selector} edge`, () => {
      const body = rules(file, selector).join(';');
      expect(body).toContain('var(--border-control');
      // --border-strong may remain only as the fallback inside --border-control.
      expect(body.split('var(--border-control,var(--border-strong))').join('')).not.toContain('var(--border-strong)');
    });
  }
});

describe('2. active options show an inset focus ring', () => {
  for (const [file, selector] of [
    ['forms/Select.jsx', '.ef-select-item:focus-visible'],
    ['forms/Select.jsx', '.ef-select-item[data-highlighted]'],
    ['forms/Combobox.jsx', '.ef-combobox__item[data-highlighted="true"]'],
    ['dates/TimePicker.jsx', '.ef-timepicker__opt--hi'],
  ]) {
    it(selector, () => {
      expect(rules(file, selector).join(';')).toMatch(/box-shadow:inset 0 0 0 2px var\(--focus-ring-color\)/);
    });
  }
  it('Select hover stays a tint, without the ring', () => {
    expect(rules('forms/Select.jsx', '.ef-select-item:hover').join(';')).not.toContain('focus-ring');
  });
  it('Combobox options show a pointer like Select', () => {
    expect(rules('forms/Combobox.jsx', '.ef-combobox__item').join(';')).toContain('cursor:pointer');
  });
});

describe('3. fixed-size hit targets honour --tap-min on coarse pointers', () => {
  const TARGETS = [
    ['dates/Calendar.jsx', '.ef-cal__day'],
    ['forms/NumberInput.jsx', '.ef-number__step'],
    ['forms/Combobox.jsx', '.ef-combobox__chip-remove'],
    ['forms/Combobox.jsx', '.ef-combobox__button'],
    ['forms/Input.jsx', '.ef-input__reveal'],
    ['forms/Toggle.jsx', '.ef-toggle'],
    ['forms/Button.jsx', '.ef-btn--xs'],
    ['forms/Button.jsx', '.ef-btn--icon-xs'],
    ['forms/InputGroup.jsx', '.ef-input-group__button'],
    ['forms/Select.jsx', '.ef-select-item'],
    ['forms/Checkbox.jsx', '.ef-check__box'],
    ['forms/Radio.jsx', '.ef-radio__dot'],
  ];
  for (const [file, selector] of TARGETS) {
    it(`${selector}`, () => {
      const block = coarse(file);
      expect(block, `${file} has a pointer:coarse block`).not.toBe('');
      expect(block).toContain(selector);
      expect(block).toContain('var(--tap-min)');
    });
  }
});

describe('4. disabled Switch label, Calendar header and range band', () => {
  it('dims the label of a disabled Switch', () => {
    expect(rules('forms/Switch.jsx', '.ef-switch-field[data-disabled] .ef-switch__label').join(';')).toMatch(/opacity:\.45/);
  });
  it('sets weekday headers on the type scale without uppercase', () => {
    const body = rules('dates/Calendar.jsx', '.ef-cal__dow').join(';');
    expect(body).toContain('font-size:var(--text-xs)');
    expect(body).not.toMatch(/uppercase|font-size:10px|letter-spacing/);
  });
  it('paints the range band with theme-aware tokens', () => {
    const body = rules('dates/Calendar.jsx', '.ef-cal__day[data-range-middle="true"]').join(';');
    expect(body).toContain('background:var(--accent-subtle)');
    expect(body).not.toMatch(/--brand-\d+/);
  });
});

describe('5. text on --accent-subtle uses --accent-subtle-fg', () => {
  it('Toggle pressed state', () => {
    expect(rules('forms/Toggle.jsx', '.ef-toggle--on').join(';')).toContain('color:var(--accent-subtle-fg');
  });
});
