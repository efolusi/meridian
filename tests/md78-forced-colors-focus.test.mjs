// MD78: forced-colors mode drops box-shadow, and component files draw their focus ring as a box-shadow after
// `outline:none`, so a focused control could show no ring at all (WCAG 2.4.7). MD74 fixed Switch, Toolbar and Player
// one by one. The systemic fix is one rule in tokens/base.css: a 2px Highlight outline on every :focus-visible,
// declared !important. The base rule was already unlayered and already beat a component's `outline:none` (an
// unlayered rule outranks every @layer rule); !important changes the outcome only against a product's own unlayered
// rules, such as its `outline:none`. An important declaration in a layer beats an important one outside it, so no
// component may carry an `!important` outline, and no component forced-colors block restates the focus outline: the
// base rule is the one place. A test scans every CSS template of every component file.
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (file) => readFileSync(file, 'utf8');
const components = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) walk(path);
    else if (entry.name.endsWith('.jsx')) components.push(path);
  }
};
walk('components');
// Every CSS template a component injects: the const named in each injectEfCss(id, NAME) call, all of them joined.
const injected = (text) => [...new Set([...text.matchAll(/injectEfCss\('[^']*',\s*([A-Za-z_$][\w$]*)\)/g)].map((m) => m[1]))];
const templates = (text) => injected(text).map((name) => new RegExp(`const ${name.replace(/\$/g, '\\$')} = \`([\\s\\S]*?)\`;`).exec(text)?.[1]);
const css = (file) => templates(read(file)).filter((t) => t !== undefined).join('\n');
// The text inside each `@media (forced-colors:active){ ... }`, braces balanced.
const forcedBlocks = (text) => {
  const blocks = [];
  let from = 0;
  for (;;) {
    const start = text.indexOf('@media (forced-colors:active){', from);
    if (start === -1) return blocks;
    let depth = 0;
    let end = start + '@media (forced-colors:active)'.length;
    for (; end < text.length; end += 1) {
      if (text[end] === '{') depth += 1;
      if (text[end] === '}') { depth -= 1; if (depth === 0) break; }
    }
    blocks.push(text.slice(start + '@media (forced-colors:active){'.length, end));
    from = end;
  }
};
// [selector, body] pairs of the flat rules in a block.
const rules = (block) => [...block.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => [m[1].trim(), m[2]]);

describe('the one forced-colors focus rule (tokens/base.css)', () => {
  const base = read('tokens/base.css');
  const [block] = forcedBlocks(base);

  it('draws a 2px Highlight outline, offset 2px, on every :focus-visible, with !important', () => {
    expect(block).toContain(':focus-visible{outline:2px solid Highlight!important;outline-offset:2px}');
  });

  it('is unlayered: every brace before it is closed, so it is outside @layer meridian', () => {
    const before = base.slice(0, base.indexOf('@media (forced-colors:active)')).replace(/\/\*[\s\S]*?\*\//g, '');
    expect(before).toContain('@layer meridian{');
    const depth = [...before].reduce((n, c) => n + (c === '{') - (c === '}'), 0);
    expect(depth).toBe(0);
  });

  it('is the only !important outline in the stylesheet', () => {
    expect(base.replace(/\/\*[\s\S]*?\*\//g, '').match(/outline[^;}]*!important/g)).toHaveLength(1);
  });
});

describe('no component fights the base focus rule', () => {
  it('scans every component file (guards the scan itself)', () => {
    expect(components.length).toBeGreaterThan(100);
    expect(components.filter((file) => forcedBlocks(css(file)).length > 0).length).toBeGreaterThanOrEqual(6);
  });

  it('reads every CSS template in a file: each injected const is found, and no other CSS const is left unread', () => {
    for (const file of components) {
      const text = read(file);
      const names = injected(text);
      const found = templates(text);
      expect(found.every((t) => t !== undefined), `${file} injects a template the scan cannot find`).toBe(true);
      // A template const that is never injected would be CSS nobody scans; there is none, and a second one must be injected.
      const declared = [...text.matchAll(/^(?:export )?const ([A-Za-z_$][\w$]*)\s*=\s*`/gm)].map((m) => m[1]).filter((name) => /css|style/i.test(name));
      expect(declared.sort(), `${file} CSS templates vs injected`).toEqual(names.sort());
    }
  });

  it('joins several templates of one file (the scan itself, on a file with two)', () => {
    const text = "const CSS = `.a{x:1}`;\nconst MORE_CSS = `.b{y:2}`;\ninjectEfCss('a', CSS);\ninjectEfCss('b', MORE_CSS);";
    expect(templates(text)).toEqual(['.a{x:1}', '.b{y:2}']);
  });

  it('no component sets an !important outline: a layered important beats the unlayered one', () => {
    for (const file of components) expect(css(file), file).not.toMatch(/outline[^;}]*!important/);
  });

  it('no forced-colors block sets a focus outline (the base rule is the only one) or switches an outline off', () => {
    for (const file of components) {
      for (const block of forcedBlocks(css(file))) {
        for (const [selector, body] of rules(block)) {
          const outline = /(?:^|;)outline:([^;]*)/.exec(body)?.[1];
          const offset = /(?:^|;)outline-offset:([^;]*)/.exec(body)?.[1];
          // The base rule is the one place for the focus outline: restating it here is a second copy that can drift.
          expect(/:focus(-visible|-within)?\b/.test(selector), `${file} ${selector} restates the focus outline`).toBe(false);
          expect(offset, `${file} ${selector} outline-offset`).toBeUndefined();
          // An edge outline on a selected or default state is fine; none may switch the outline off.
          if (outline !== undefined) expect(outline, `${file} ${selector}`).not.toMatch(/^(none|0|transparent)\b/);
          expect(body, `${file} ${selector}`).not.toMatch(/outline-(style|width):\s*(none|0)/);
        }
      }
    }
  });

  it('catches a component that would fight it (the scan itself, on a bad rule)', () => {
    const bad = forcedBlocks('x @media (forced-colors:active){.a:focus-visible{outline:none}.b{outline:1px solid Highlight}} y');
    expect(rules(bad[0])).toEqual([['.a:focus-visible', 'outline:none'], ['.b', 'outline:1px solid Highlight']]);
  });
});
