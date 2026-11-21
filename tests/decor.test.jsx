import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import { renderToString } from 'react-dom/server';
import { render } from '@testing-library/react';
import { Decor } from '../components/display/Decor.jsx';

const SOURCE = fs.readFileSync('components/display/Decor.jsx', 'utf8');
const TOKENS = fs.readFileSync('tokens/colors.css', 'utf8');
const css = () => SOURCE.match(/const CSS = `([\s\S]*?)`;/)[1];

describe('Decor markup', () => {
  it('is hidden from assistive technology and takes no pointer events', () => {
    const { container } = render(<Decor />);
    const el = container.firstChild;
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(el.hasAttribute('role')).toBe(false);
    expect(el.getAttribute('data-slot')).toBe('decor');
    expect(css()).toContain('pointer-events:none');
  });

  it.each(['mesh', 'noise', 'grid', 'dots'])('draws the %s pattern', (pattern) => {
    const { container } = render(<Decor pattern={pattern} />);
    expect(container.firstChild.getAttribute('data-pattern')).toBe(pattern);
    expect(css()).toContain(`.ef-decor[data-pattern="${pattern}"]`);
  });

  it('defaults to mesh, passes class and style through, and fades only when asked', () => {
    const { container } = render(<><Decor className="x" style={{ opacity: 0.5 }} /><Decor fade /></>);
    const [a, b] = container.children;
    expect(a.getAttribute('data-pattern')).toBe('mesh');
    expect(a.className).toContain('x');
    expect(a.style.opacity).toBe('0.5');
    expect(a.hasAttribute('data-fade')).toBe(false);
    expect(b.hasAttribute('data-fade')).toBe(true);
  });

  it('renders the same markup on the server and on the client', () => {
    const server = renderToString(<Decor pattern="grid" fade />);
    const { container } = render(<Decor pattern="grid" fade />);
    expect(container.innerHTML).toBe(server);
  });
});

describe('Decor styles', () => {
  it('has no motion at all, so reduced motion has nothing to stop', () => {
    expect(css()).not.toMatch(/animation|transition|@keyframes/);
  });

  it('is hidden in forced-colors mode', () => {
    expect(css().replace(/\s+/g, '')).toContain('@media(forced-colors:active){.ef-decor{display:none}}');
  });

  it('takes every colour from tokens and has no colour literal', () => {
    expect(css()).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i);
  });

  it('colours the mesh from the accent group, so a rebrand and dark mode reach it', () => {
    const mesh = css().match(/\[data-pattern="mesh"\]\{[^}]*\}\s*(?=\.ef-decor\[data-pattern="grid")/s)?.[0] ?? css().match(/\[data-pattern="mesh"\][^\n]*/)[0];
    const used = new Set([...mesh.matchAll(/var\((--[\w-]+)\)/g)].map((m) => m[1]));
    expect([...used].sort()).toEqual(['--accent', '--accent-subtle-border'].filter((t) => used.has(t)));
    expect(used.size).toBeGreaterThan(0);
  });

  it('loads no file and embeds no data URI, so the package has no asset to miss', () => {
    expect(css()).not.toMatch(/url\(|@import/);
  });
});

// Contrast of body text over the strongest point of each pattern, light and dark.
const block = (name) => {
  const re = name === 'light' ? /:root\s*\{([\s\S]*?)\n\}/ : /\[data-theme="dark"\]\s*\{([\s\S]*?)\n\}/;
  return Object.fromEntries([...TOKENS.match(re)[1].matchAll(/(--[\w-]+):([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
};
const resolve = (name, themed) => {
  let v = themed[name] ?? block('light')[name];
  for (let i = 0; i < 8 && v && v.startsWith('var('); i += 1) {
    const next = v.match(/var\((--[\w-]+)\)/)[1];
    v = themed[next] ?? block('light')[next];
  }
  return v;
};
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const over = (fg, alpha, bg) => fg.map((c, i) => c * alpha + bg[i] * (1 - alpha));
const lum = (c) => {
  const [r, g, b] = c.map((v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };

describe('Decor follows a rebrand', () => {
  it('resolves the mesh colours from whatever --accent holds', () => {
    const themed = { ...block('light'), '--accent': '#FF0000', '--accent-subtle-border': '#00FF00' };
    expect(resolve('--accent', themed)).toBe('#FF0000');
    expect(resolve('--accent-subtle-border', themed)).toBe('#00FF00');
  });
});

describe.each(['light', 'dark'])('Decor contrast in %s', (theme) => {
  const themed = block(theme);
  const hex = (token) => rgb(resolve(token, themed));
  const mixes = [...css().matchAll(/var\((--[\w-]+)\)\s+(\d+)%/g)].map((m) => ({ token: m[1], alpha: Number(m[2]) / 100 }));

  it('finds the strengths it measures, noise included', () => {
    expect(mixes.length).toBeGreaterThan(0);
    const noiseRule = css().match(/\[data-pattern="noise"\]\{[^}]*\}/)[0];
    expect(noiseRule).toMatch(/var\(--[\w-]+\)\s+\d+%/);
  });

  it.each(['--surface-page', '--surface-card', '--surface-sunken'])('keeps text-primary and text-secondary at 4.5:1 over %s', (surface) => {
    const bg = hex(surface);
    const worst = [
      ...mixes.map((m) => over(hex(m.token), m.alpha, bg)),
    ];
    for (const text of ['--text-primary', '--text-secondary']) {
      for (const point of worst) expect(ratio(hex(text), point)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
