// MD81: one root setting for the shape of everything you press and everything you type into. sso web and efolusi.com
// forced it in their own global CSS (`.ef-btn, .ef-tag, .ef-badge {border-radius: var(--radius-full)}`, `.ef-input__el,
// .ef-textarea {border-radius: var(--radius-lg)}`, `.ef-iconbtn {border-radius: var(--radius-full)}`), pay and the
// komando site kept the rectangle. Meridian now has `data-shape="pill"` (on html or any ancestor), which sets two custom
// properties; the components read them and keep today's value as the fallback, so an absent attribute changes nothing.
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (file) => readFileSync(file, 'utf8');
const css = (file) => /const CSS = `([\s\S]*?)`;/.exec(read(file))[1];
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// The declarations of the rule whose selector list is exactly `selector`, at the start of a line or after a `}`.
const declarations = (text, selector) => {
  const match = new RegExp(`(?:^|[\\n}])${escape(selector)}\\{([^}]*)\\}`).exec(text);
  expect(match, `${selector} rule`).not.toBeNull();
  return match[1];
};
const radius = (text, selector) => /(?:^|;)border-radius:([^;]*)/.exec(declarations(text, selector))?.[1];

const PRESS = '--press-radius';
const FIELD = '--field-radius';

describe('the root setting (tokens/base.css)', () => {
  const base = read('tokens/base.css');

  it('data-shape="pill" sets the press radius to full and the field radius to lg', () => {
    const rule = declarations(base, '[data-shape="pill"]');
    expect(rule).toContain(`${PRESS}:var(--radius-full)`);
    expect(rule).toContain(`${FIELD}:var(--radius-lg)`);
  });

  it('is a plain custom-property rule: no !important, and no default on :root (absent attribute = today)', () => {
    expect(declarations(base, '[data-shape="pill"]')).not.toContain('!important');
    expect(base).not.toMatch(/:root\{[^}]*--(press|field)-radius/);
  });

  it('lives in the meridian layer, so unlayered product CSS can still override a property', () => {
    expect(base.indexOf('[data-shape="pill"]')).toBeLessThan(base.indexOf('@media (forced-colors:active)'));
    expect(base.slice(0, base.indexOf('[data-shape="pill"]')).split('@layer meridian{').length - 1).toBe(1);
  });
});

describe('components read the properties and keep today\'s value as the fallback', () => {
  const PRESSED = [
    ['components/forms/Button.jsx', '.ef-btn', 'var(--radius-sm)'],
    ['components/forms/IconButton.jsx', '.ef-iconbtn', 'var(--radius-sm)'],
    ['components/display/Tag.jsx', '.ef-tag', 'var(--radius-sm)'],
    ['components/display/Tag.jsx', '.ef-tag__body', 'var(--radius-sm)'],
    ['components/display/Tag.jsx', '.ef-tag__x', 'var(--radius-sm)'],
    ['components/display/Badge.jsx', '.ef-badge', 'var(--radius-full)'],
  ];
  for (const [file, selector, today] of PRESSED) {
    it(`${file} ${selector} reads ${PRESS}`, () => {
      expect(radius(css(file), selector)).toBe(`var(${PRESS},${today})`);
    });
  }

  const FIELDS = [
    ['components/forms/Input.jsx', '.ef-input__el'],
    ['components/forms/Input.jsx', '.ef-file-input'],
    ['components/forms/Textarea.jsx', '.ef-textarea'],
    ['components/forms/NumberInput.jsx', '.ef-number'],
    ['components/forms/Select.jsx', '.ef-select-trigger'],
    ['components/forms/NativeSelect.jsx', '.ef-native-select select'],
    ['components/forms/InputGroup.jsx', '.ef-input-group'],
    ['components/forms/Combobox.jsx', '.ef-combobox__chips'],
    ['components/dates/TimePicker.jsx', '.ef-timepicker__input'],
    ['components/code/CopyField.jsx', '.ef-copyfield__box'],
  ];
  for (const [file, selector] of FIELDS) {
    it(`${file} ${selector} reads ${FIELD}`, () => {
      expect(radius(css(file), selector)).toBe(`var(${FIELD},var(--radius-sm))`);
    });
  }

  it('an explicit shape="pill" Button and the glass Input stay full, whatever the setting', () => {
    expect(radius(css('components/forms/Button.jsx'), '.ef-btn--pill')).toBe('var(--radius-full)');
    expect(radius(css('components/forms/Input.jsx'), '.ef-input__el.ef-glass')).toBe('var(--radius-full)');
  });
});

describe('one place for the setting', () => {
  it('no component carries its own data-shape rule, and nothing forces the radius with !important', () => {
    const files = [];
    const walk = (dir) => {
      for (const name of readdirSync(dir, { withFileTypes: true })) {
        const path = `${dir}/${name.name}`;
        if (name.isDirectory()) walk(path);
        else if (name.name.endsWith('.jsx')) files.push(path);
      }
    };
    walk('components');
    for (const file of files) {
      const text = read(file);
      expect(text, `${file} data-shape`).not.toContain('data-shape');
      expect(text, `${file} radius !important`).not.toMatch(/border-radius:[^;}]*!important/);
    }
  });
});
