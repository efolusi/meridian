import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

// Menu items, command options and navigation-menu links showed keyboard
// focus only as a --surface-sunken tint on --surface-card: 1.13:1 light,
// 1.11:1 dark, under the 3:1 a focus indicator needs (WCAG 1.4.11, 2.4.7).
// They now draw an inset --focus-ring-color ring (inset, so the panel's
// overflow never clips it) and show a pointer cursor.
const css = file => {
  const src = readFileSync(`components/${file}`, 'utf8');
  return src.slice(src.indexOf('const CSS = `'), src.indexOf('`;')).replace(/\s+/g, ' ');
};
const RING = /box-shadow:inset 0 0 0 2px var\(--focus-ring-color\)/;
const rule = (text, selector) => {
  const at = text.indexOf(selector + '{');
  return at < 0 ? '' : text.slice(at, text.indexOf('}', at));
};

describe('focus ring and cursor on menu-like items', () => {
  it.each([
    ['overlay/DropdownMenu.jsx', '.ef-dropdown-menu__item:focus-visible', '.ef-dropdown-menu__item'],
    ['overlay/ContextMenu.jsx', '.ef-context-menu__item:focus-visible', '.ef-context-menu__item'],
    ['overlay/Command.jsx', '.ef-command__item[data-selected="true"]', '.ef-command__item'],
    ['navigation/NavigationMenu.jsx', '.ef-navigation-menu__link:focus-visible', '.ef-navigation-menu__trigger'],
  ])('%s', (file, focusSelector, itemSelector) => {
    const text = css(file);
    expect(rule(text, focusSelector)).toMatch(RING);
    expect(rule(text, itemSelector)).toMatch(/cursor:pointer/);
  });

  it('Menubar triggers use a pointer cursor', () => {
    expect(rule(css('navigation/Menubar.jsx'), '.ef-menubar__trigger')).toMatch(/cursor:pointer/);
  });

  it('the ring colour holds 3:1 on the panel in both themes', () => {
    const colors = readFileSync('tokens/colors.css', 'utf8');
    const table = body => Object.fromEntries([...body.matchAll(/(--[\w-]+):([^;]+);/g)].map(m => [m[1], m[2].trim()]));
    const light = table(colors.match(/:root\{([\s\S]*?)\n\}/)[1]);
    const dark = { ...light, ...table(colors.match(/\[data-theme="dark"\]\{([\s\S]*?)\n\}/)[1]) };
    const hex = (t, v) => { for (let i = 0; i < 10; i += 1) { const r = v.match(/^var\((--[\w-]+)\)$/); if (!r) return v; v = t[r[1]]; } return v; };
    const lum = h => { const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(s => (s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
    const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
    for (const t of [light, dark]) {
      expect(ratio(hex(t, 'var(--focus-ring-color)'), hex(t, 'var(--surface-card)'))).toBeGreaterThanOrEqual(3);
      expect(ratio(hex(t, 'var(--focus-ring-color)'), hex(t, 'var(--surface-sunken)'))).toBeGreaterThanOrEqual(3);
    }
  });
});
