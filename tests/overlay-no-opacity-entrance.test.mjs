import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// MD54 (warm glass, design-tokens docs/glass.md): sheets, drawers, popovers and menus sit on thick glass.
// An opacity entrance shows the text behind them for the length of the animation, so they enter by
// transform only, and under reduced motion they appear at once (no ef-reduce-fade).
const OVERLAYS = {
  'components/overlay/Sheet.jsx': 'ef-sheet',
  'components/overlay/Drawer.jsx': 'ef-drawer',
  'components/overlay/Popover.jsx': 'ef-popover__panel',
  'components/overlay/DropdownMenu.jsx': 'ef-dropdown-menu__content',
  'components/overlay/ContextMenu.jsx': 'ef-context-menu__content',
  'components/overlay/HoverCard.jsx': 'ef-hovercard__panel',
};

const keyframes = (css) => [...css.matchAll(/@keyframes ([\w-]+)\{((?:[^{}]|\{[^{}]*\})*)\}/g)].map((m) => ({ name: m[1], body: m[2] }));

describe('overlays on glass never animate opacity', () => {
  for (const [file, cls] of Object.entries(OVERLAYS)) {
    const src = readFileSync(file, 'utf8');
    it(`${file}: its keyframes move, they do not fade`, () => {
      const frames = keyframes(src);
      expect(frames.length, file).toBeGreaterThan(0);
      for (const k of frames) expect(k.body, `${file} @keyframes ${k.name}`).not.toMatch(/opacity/);
    });
    it(`${file}: under reduced motion it appears at once`, () => {
      const reduce = [...src.matchAll(/@media \(prefers-reduced-motion:reduce\)\{([^@]*?\}\})/g)].map((m) => m[1]).filter((b) => b.includes(cls));
      expect(reduce.length, `${file} has a reduced-motion rule for .${cls}`).toBeGreaterThan(0);
      for (const b of reduce) {
        expect(b, file).not.toMatch(/ef-reduce-fade/);
        expect(b, file).toMatch(/animation:none/);
      }
    });
  }
});

// MD54: the panels sit on thick glass: the material.thick tint with the fixed sheet blur.
const THICK_BG = 'background:color-mix(in srgb,var(--material-tint) calc(var(--material-thick) * 100%),transparent)';
const THICK_BLUR = 'backdrop-filter:blur(var(--material-blur-thick)) saturate(var(--material-saturate))';
const PANEL = {
  'components/overlay/Popover.jsx': '.ef-popover__panel',
  'components/overlay/DropdownMenu.jsx': '.ef-dropdown-menu__content',
  'components/overlay/ContextMenu.jsx': '.ef-context-menu__content',
  'components/overlay/HoverCard.jsx': '.ef-hovercard__panel',
  'components/overlay/Drawer.jsx': '.ef-drawer[data-vaul-drawer-direction]',
  'components/overlay/Sheet.jsx': '.ef-sheet[data-side]',
};
describe('overlay panels are thick glass', () => {
  for (const [file, sel] of Object.entries(PANEL)) {
    it(`${file}: ${sel}`, () => {
      const src = readFileSync(file, 'utf8');
      const at = src.indexOf(`${sel}{`);
      expect(at, `${file} has a ${sel} rule`).toBeGreaterThanOrEqual(0);
      const body = src.slice(at, src.indexOf('}', at));
      expect(body).toContain(THICK_BG);
      expect(body).toContain(`-webkit-${THICK_BLUR}`);
      expect(body).toContain(THICK_BLUR);
      expect(body).not.toContain('background:var(--surface-card)');
    });
  }
});
