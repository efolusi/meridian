import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// MD74. The accent is the owl's copper. As a fill it is 2.47 to 2.72:1 on the light surfaces, under the 3:1
// a shape needs (WCAG 1.4.11), so a component paints a shape with --accent-edge: the 1px edge of a fill, the
// colour of a mark, a border, a line or a thin fill. scripts/check_contrast.py gates --accent-edge on every
// ground; this test keeps components from going back to the bare accent.
// --accent-warm (2.89 on the page) and --accent-soft (1.83) are under 3:1 too: they may tint a gradient, never
// draw a shape or a control's only edge.

const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));

// Text bubble and avatar of the chat: they carry words or a name beside them, no control draws on them.
const DECORATION = [
  { file: 'components/ai/Bubble.jsx', selector: '.ef-bubble[data-variant="default"]>.ef-bubble__content', why: 'the user message bubble: text on a fill, 6.37:1' },
  { file: 'components/ai/ChatMessage.jsx', selector: '.ef-msg__bot', why: 'the bot avatar next to its name' },
  { file: 'components/ai/ChatMessage.jsx', selector: '.ef-msg__caret', why: 'the streaming caret, gone when the text stops' },
];

const SHAPE_PROP = /^(border(-[a-z-]+)?|outline(-[a-z-]+)?|stroke|fill|accent-color|caret-color|color|box-shadow|text-decoration-color)$/;
const FILL_PROP = /^background(-color)?$/;

function rules(css) {
  return [...css.matchAll(/([^{}`]+)\{([^{}]*)\}/g)].map((m) => ({
    selector: m[1].trim().split('\n').pop().trim(),
    decls: m[2].split(';').map((d) => d.trim()).filter(Boolean).map((d) => [d.slice(0, d.indexOf(':')).trim(), d.slice(d.indexOf(':') + 1).trim()]),
  }));
}

function bareAccentShapes(css, file = '') {
  const found = [];
  for (const { selector, decls } of rules(css)) {
    const hasEdge = decls.some(([, v]) => v.includes('var(--accent-edge)'));
    for (const [prop, value] of decls) {
      if (!/var\(--accent\)/.test(value) || /gradient\(/.test(value)) continue;
      if (SHAPE_PROP.test(prop)) found.push(`${file} ${selector} { ${prop}: ${value} } draws a shape with the bare accent`);
      else if (FILL_PROP.test(prop) && !hasEdge && !DECORATION.some((d) => d.file === file && d.selector === selector)) found.push(`${file} ${selector} { ${prop}: ${value} } is a fill with no accent-edge beside it`);
    }
  }
  for (const m of css.matchAll(/\b(stroke|fill)="var\(--accent\)"/g)) found.push(`${file} ${m[0]} draws a chart mark with the bare accent`);
  return found;
}

describe('components draw accent shapes with --accent-edge (MD74)', () => {
  it('detects a bare accent border, a fill with no edge and an SVG stroke', () => {
    expect(bareAccentShapes('.a{border-color:var(--accent)}')).toHaveLength(1);
    expect(bareAccentShapes('.a{background:var(--accent);color:var(--accent-contrast)}')).toHaveLength(1);
    expect(bareAccentShapes('<path stroke="var(--accent)" />')).toHaveLength(1);
    expect(bareAccentShapes('.a{background:var(--accent);border-color:var(--accent-edge)}')).toEqual([]);
    expect(bareAccentShapes('.a{background:var(--accent);box-shadow:inset 0 0 0 1px var(--accent-edge)}')).toEqual([]);
    expect(bareAccentShapes('.a{background:radial-gradient(color-mix(in oklab,var(--accent) 6%,transparent),transparent)}')).toEqual([]);
  });

  it('keeps the decoration list real: each entry still paints the bare accent', () => {
    for (const d of DECORATION) {
      const css = readFileSync(d.file, 'utf8');
      expect(rules(css).some((r) => r.selector === d.selector && r.decls.some(([, v]) => v === 'var(--accent)')), `${d.file} ${d.selector}`).toBe(true);
    }
  });

  it('has no component that paints a bare accent shape', () => {
    const files = walk('components').filter((f) => f.endsWith('.jsx'));
    expect(files.length).toBeGreaterThan(50);
    expect(files.flatMap((f) => bareAccentShapes(readFileSync(f, 'utf8'), f))).toEqual([]);
  });
});

describe('--accent-warm and --accent-soft are decoration, never a shape (MD74)', () => {
  const ROOTS = ['components', 'site', 'starters', 'showcases', 'blocks'];
  const files = ROOTS.flatMap(walk).filter((f) => /\.(jsx|html|css|js)$/.test(f) && !f.includes('/registry/'));

  it('reads neither token as a border, fill, stroke, outline, text colour or shadow', () => {
    const uses = [];
    for (const f of files) {
      for (const { selector, decls } of rules(readFileSync(f, 'utf8'))) {
        for (const [prop, value] of decls) {
          if (/var\(--accent-(warm|soft)\)/.test(value) && !/gradient\(/.test(value)) uses.push(`${f} ${selector} { ${prop}: ${value} }`);
        }
      }
    }
    expect(uses, 'accent-warm is 2.89:1 and accent-soft 1.83:1 on the page; use --accent-edge for a shape, --text-link for text').toEqual([]);
  });
});
