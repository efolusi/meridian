import { readFileSync, readdirSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

const GROUPS = ['ai', 'code', 'data', 'display', 'files', 'finance', 'icons'];
const rules = () => GROUPS.flatMap(g => readdirSync(new URL(`../components/${g}/`, import.meta.url))
  .filter(f => f.endsWith('.jsx'))
  .flatMap(f => [...readFileSync(new URL(`../components/${g}/${f}`, import.meta.url), 'utf8').matchAll(/(\.[\w-][^{}`]*)\{([^{}]*)\}/g)]
    .map(m => ({ file: `${g}/${f}`, sel: m[1].trim(), body: m[2] }))));

// brand-700 on accent-subtle is 2.22:1 in dark. Text and icons on that
// surface use --accent-subtle-fg (>= 4.5:1 in both themes, tokens area).
describe('text on --accent-subtle', () => {
  it('never uses --brand-700 directly', () => {
    const bad = rules().filter(r => /background:var\(--accent-subtle\)/.test(r.body) && /(^|;)color:var\(--brand-700\)/.test(r.body));
    expect(bad.map(r => `${r.file} ${r.sel}`)).toEqual([]);
  });
  it.each([
    ['ai/Citation.jsx', '.ef-citation'],
    ['ai/Citation.jsx', '.ef-sources__num'],
    ['ai/ModelSelector.jsx', '.ef-modelsel__badge'],
    ['ai/FeedbackBar.jsx', '.ef-feedback__btn--on'],
    ['display/Badge.jsx', '.ef-badge--accent'],
    ['display/TreeList.jsx', '.ef-tree__row--sel'],
  ])('%s %s uses --accent-subtle-fg', (file, sel) => {
    const r = rules().find(x => x.file === file && x.sel === sel);
    expect(r).toBeTruthy();
    expect(r.body).toMatch(/(^|;)color:var\(--accent-subtle-fg/);
  });
});

// Small chips read as pills at --radius-sm (8px on a 16-19px box).
describe('small chips use --radius-xs', () => {
  it.each([
    ['ai/Citation.jsx', '.ef-citation'],
    ['ai/Citation.jsx', '.ef-sources__num'],
    ['display/Kbd.jsx', '.ef-kbd'],
  ])('%s %s', (file, sel) => {
    const r = rules().find(x => x.file === file && x.sel === sel);
    expect(r.body).toContain('border-radius:var(--radius-xs)');
  });
});
