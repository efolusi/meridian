// MD81: one root setting for the shape of everything you press and everything you type into. sso web and efolusi.com
// forced it in their own global CSS (`.ef-btn, .ef-tag, .ef-badge {border-radius: var(--radius-full)}`, `.ef-input__el,
// .ef-textarea {border-radius: var(--radius-lg)}`, `.ef-iconbtn {border-radius: var(--radius-full)}`), pay and the
// komando site kept the rectangle. Meridian now has `data-shape="pill"` (on html or body), which sets two custom
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

  it('data-shape="pill" sets the press radius to full and the field radius to md (16px, what efolusi.com and sso web draw)', () => {
    const rule = declarations(base, '[data-shape="pill"]');
    expect(rule).toContain(`${PRESS}:var(--radius-full)`);
    expect(rule).toContain(`${FIELD}:var(--radius-md)`);
    expect(rule).not.toContain(`${FIELD}:var(--radius-lg)`);
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
    ['components/forms/ButtonGroup.jsx', '.ef-btn-group__text', 'var(--radius-sm)'],
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

// Portal.jsx appends every overlay to document.body (or a `container`), so a data-shape on a subtree never reaches
// Dialog, Popover, Toast and the like: the docs say html or body, never "any ancestor".
describe('the docs say where the attribute works, and what it really draws', () => {
  const DOCS = [
    ['CHANGELOG.md', (text) => text.split('\n').find((line) => line.includes('(MD81)'))],
    ['guidelines/theming.md', (text) => text.slice(text.indexOf('## Shape'), text.indexOf('## Fonts'))],
    ['tokens/base.css', (text) => text.slice(text.indexOf('Shape (MD81)'), text.indexOf('[data-shape="pill"]'))],
    ['components/forms/Button.prompt.md', (text) => text],
    ['components/forms/Input.prompt.md', (text) => text],
    ['components/display/Tag.prompt.md', (text) => text],
    ['site/Docs.dc.html', (text) => text.split('\n').find((line) => line.includes('New root setting data-shape'))],
  ];
  for (const [file, pick] of DOCS) {
    it(`${file} does not claim a subtree works`, () => {
      const text = pick(read(file));
      expect(text, `${file} section`).toBeTruthy();
      expect(text).not.toMatch(/any ancestor|on an ancestor|elemen induk mana pun/);
    });
  }

  const shape = read('guidelines/theming.md');
  const section = shape.slice(shape.indexOf('## Shape'), shape.indexOf('## Fonts'));
  it('theming.md names html and body, and the portalled overlays a subtree does not reach', () => {
    expect(section).toContain('`<html>` or `<body>`');
    expect(section).toMatch(/portal/i);
    expect(section).toContain('`container`');
  });

  it('theming.md says what the field radius draws: a stadium when the radius is over half the height', () => {
    expect(section).toContain('stadium');
    expect(section).toContain('16px');
  });

  // The field radius is --radius-md (16px), measured live on efolusi.com and sso web. At --radius-lg (22px) the
  // 28 to 44px fields became stadiums, so no doc may still name --radius-lg or 22px as the field radius.
  for (const [file, pick] of DOCS) {
    it(`${file} does not state the old field radius (--radius-lg, 22px)`, () => {
      const text = pick(read(file));
      expect(text, `${file} section`).toBeTruthy();
      expect(text).not.toMatch(/--radius-lg|22px/);
    });
  }

  it('theming.md lists the controls that follow neither property', () => {
    for (const name of ['Toggle', 'ButtonTile', 'InputOTP', 'Sidebar']) expect(section, name).toContain(name);
    expect(section).toContain('neither');
  });
});
