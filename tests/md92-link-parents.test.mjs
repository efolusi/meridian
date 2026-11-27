// MD92: the link colour is 2.43:1 against the body ink in light and 1.88:1 in dark, so a classless link inside running
// text needs the underline (WCAG 1.4.1). The v2.5.0 rule named p, dd, blockquote and figcaption only; 18 classless links
// in li and td on the product site, and the links of an Alert description (sso /account), stayed colour only.
// Each parent is decided by one question: is the link inside a block of running text, where colour is its only cue?
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const baseCss = readFileSync('tokens/base.css', 'utf8');
const LINK = 'a:where(:not([class]))';

// The parent list of the one rule that underlines classless links in running text.
const parents = () => {
  const match = /(?:^|\n):where\(([^)]*)\) a:where\(:not\(\[class\]\)\)\{([^}]*)\}/.exec(baseCss);
  expect(match, 'the running-text link rule in tokens/base.css').not.toBeNull();
  return { list: match[1].split(',').map((part) => part.trim()), declarations: match[2] };
};

describe('a classless link in running text is underlined (MD92)', () => {
  it('underlines, with the same thin underline as before', () => {
    expect(parents().declarations).toMatch(/text-decoration:underline/);
    expect(parents().declarations).toMatch(/text-decoration-thickness:1px/);
  });

  it('thickens on hover and never drops the underline', () => {
    const hover = new RegExp(`:where\\(${parents().list.map((p) => p.replace(/[.]/g, '\\.')).join(', ')}\\) ${LINK.replace(/[()[\]]/g, '\\$&')}:hover\\{([^}]*)\\}`).exec(baseCss);
    expect(hover, 'hover rule with the same parents').not.toBeNull();
    expect(hover[1]).not.toMatch(/text-decoration:none/);
  });

  // Parents that are running text: the v2.5.0 four, plus the four MD92 adds.
  for (const parent of ['p', 'dd', 'blockquote', 'figcaption', 'li', 'td', 'caption', 'label']) {
    it(`covers ${parent}`, () => {
      expect(parents().list).toContain(parent);
    });
  }

  it('covers the Alert description (sso /account: Platform terms, Privacy notice)', () => {
    expect(parents().list).toContain('.ef-alert__description');
  });

  // Parents that are not running text. A link there is a control or a navigation item, and the opt-out of a class
  // (`:not([class])`) is how a component marks its own link.
  for (const parent of ['th', 'summary', 'ul', 'ol', 'nav', 'dt']) {
    it(`does not cover ${parent} (a label, a control or a list container, not running text)`, () => {
      expect(parents().list).not.toContain(parent);
    });
  }

  it('keeps the class opt-out: a component anchor and a nav link with a class stay as their own rule draws them', () => {
    expect(baseCss).toContain(`) ${LINK}{text-decoration:underline`);
    expect(parents().list.join(' ')).not.toMatch(/\[class\]/);
  });
});
