// MD97: the running-text link rule (MD92) underlined classless links in an li inside a nav, although the rule says
// navigation lists are not covered. The rule must skip every ancestor that is navigation or a menu, and keep its
// specificity at 0,0,1 so a layered component rule still outranks it. The browser check is
// tests/fixtures/md97-nav-links.html, read by scripts/smoke_headless.mjs; jsdom cannot compute :not() with a complex
// selector, so this file reads the CSS text.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const baseCss = readFileSync('tokens/base.css', 'utf8');
const fixture = readFileSync('tests/fixtures/md97-nav-links.html', 'utf8');

// Every rule of base.css whose selector ends in a classless anchor that the running-text parents reach.
const rules = () => [...baseCss.matchAll(/(?:^|\n)(:where\([^)]*\) a:where\([^{]*)\{([^}]*)\}/g)].map((m) => ({ selector: m[1], body: m[2] }));
const underlineRule = () => rules().find((r) => /text-decoration:underline/.test(r.body) && !/:hover/.test(r.selector));
const hoverRule = () => rules().find((r) => /:hover/.test(r.selector));

// Ancestors where a link is navigation or a control, never running text (decided by one question: is colour its
// only cue inside a block of prose?). menubar and toolbar are controls of the same kind as menu and tablist.
const EXCLUDED = ['nav', '[role=navigation]', '[role=menu]', '[role=menubar]', '[role=tablist]', '[role=toolbar]'];

describe('a classless link inside navigation is not underlined by the running-text rule (MD97)', () => {
  it('finds the underline rule and its hover rule', () => {
    expect(underlineRule(), 'underline rule').toBeDefined();
    expect(hoverRule(), 'hover rule').toBeDefined();
  });

  for (const [label, get] of [['underline', underlineRule], ['hover', hoverRule]]) {
    for (const ancestor of EXCLUDED) {
      it(`${label} rule skips a link inside ${ancestor}`, () => {
        const excluded = /:not\(:is\(([^)]*)\) \*\)/.exec(get().selector);
        expect(excluded, `an ancestor exclusion :not(:is(...) *) in ${get().selector}`).not.toBeNull();
        expect(excluded[1].split(',').map((s) => s.trim())).toContain(ancestor);
      });
    }

    it(`${label} rule keeps zero specificity: the whole link condition sits inside :where()`, () => {
      // After the parents there is exactly one a:where(...) group, and nothing outside :where() but :hover.
      const tail = get().selector.replace(/^:where\([^)]*\) /, '');
      expect(tail).toMatch(/^a:where\(.*\)(:hover)?$/);
      expect(tail.replace(/:where\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*\)/, '')).toMatch(/^a(:hover)?$/);
    });

    it(`${label} rule keeps the class opt-out`, () => {
      expect(get().selector).toContain(':not([class])');
    });
  }

  it('does not add a selector that drops the underline for nav links in a second, later rule', () => {
    // One rule with an exclusion is the design; an opt-out pair would need the same specificity order and is not used.
    expect(baseCss).not.toMatch(/(?:nav|\[role=navigation\])[^{}]*a:where\(:not\(\[class\]\)\)\{text-decoration:none/);
  });

  it('the browser fixture names every excluded ancestor and the three text cases', () => {
    for (const ancestor of ['nav', 'role="navigation"', 'role="menu"', 'role="menubar"', 'role="tablist"', 'role="toolbar"']) {
      expect(fixture, ancestor).toContain(ancestor);
    }
    for (const name of ['nav-list', 'footer-nav', 'breadcrumb', 'p', 'li-plain', 'td']) {
      expect(fixture).toContain(`data-case="${name}"`);
    }
    expect(fixture).toMatch(/data-case="p" data-expect="underline"/);
    expect(fixture).toMatch(/data-case="li-plain" data-expect="underline"/);
    expect(fixture).toMatch(/data-case="td" data-expect="underline"/);
  });
});
