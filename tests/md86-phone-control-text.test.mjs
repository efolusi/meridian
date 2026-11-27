// MD86: iOS Safari zooms the whole page when a text control takes focus while its text is under 16px. pay web
// reported NativeSelect at 14px; Input md, Textarea, NumberInput and the InputGroup control Combobox is built on
// are 13 or 14px too. One rule in tokens/base.css lifts the control text to 16px at phone widths, for every size.
// It is unlayered, so it outranks the sized component rules in @layer meridian whatever the source order is.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const base = readFileSync('tokens/base.css', 'utf8');
const read = (file) => readFileSync(file, 'utf8');

const PHONE = '@media (max-width:767px)';
// The body of the first `{ ... }` block that starts at `open`, braces balanced.
const block = (text, open) => {
  const start = text.indexOf(open);
  if (start === -1) return null;
  let depth = 0;
  for (let i = text.indexOf('{', start); i < text.length; i += 1) {
    if (text[i] === '{') depth += 1;
    if (text[i] === '}' && (depth -= 1) === 0) return text.slice(text.indexOf('{', start) + 1, i);
  }
  return null;
};
// The phone block, unlayered: cut off everything inside `@layer meridian{ ... }` first.
const layered = block(base, '@layer meridian{');
const unlayered = base.replace(layered, '');
const phone = block(unlayered, PHONE);
const rule = phone && /^([^{]+)\{([^}]*)\}$/.exec(phone.trim());

// Every text control the family ships: [file, selector as written in that file's CSS].
const CONTROLS = [
  ['components/forms/Input.jsx', '.ef-input__el'],
  ['components/forms/Input.jsx', '.ef-input__el--sm'],
  ['components/forms/Textarea.jsx', '.ef-textarea'],
  ['components/forms/NumberInput.jsx', '.ef-number__el'],
  ['components/forms/NativeSelect.jsx', '.ef-native-select select'],
  ['components/forms/InputGroup.jsx', '.ef-input-group__control'],
  ['components/forms/Combobox.jsx', '.ef-combobox__chips-input'],
];

describe('one phone rule lifts control text to 16px (tokens/base.css)', () => {
  it('is a single unlayered @media (max-width:767px) rule with one font-size declaration', () => {
    expect(phone, `${PHONE} block outside @layer meridian`).not.toBeNull();
    expect(rule, 'one selector list and one declaration block').not.toBeNull();
    expect(rule[2].trim().replace(/;$/, '')).toBe('font-size:16px');
  });

  it('is no !important: a product can still choose a larger size', () => {
    expect(rule[2]).not.toContain('!important');
  });

  for (const [file, selector] of CONTROLS) {
    it(`covers ${selector} (${file})`, () => {
      expect(read(file), `${selector} exists in ${file}`).toContain(selector.replace(' select', ''));
      const listed = rule[1].split(',').map((s) => s.trim());
      expect(listed, `${selector} in the phone rule`).toContain(selector);
    });
  }

  it('never shrinks a control: the largest control size (lg, xl) is text-lg, which is 16px already', () => {
    expect(/--text-lg:\s*16px/.test(read('tokens/typography.css'))).toBe(true);
    for (const size of ['lg', 'xl']) expect(read('components/forms/Input.jsx')).toContain(`.ef-input__el--${size}{`);
    expect(read('components/forms/Input.jsx')).toMatch(/\.ef-input__el--xl\{[^}]*font-size:var\(--text-lg\)/);
  });

  it('has no desktop effect: the rule sits inside the phone block only', () => {
    expect(unlayered.replace(phone, '')).not.toContain('.ef-input__el');
  });
});
