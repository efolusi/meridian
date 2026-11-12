import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

// In the dark theme the toast surface (--surface-inverse) is near-white, and
// the success and warning icons used the dark theme's bright status tones:
// 2.33:1 and 2.78:1, under the 3:1 non-text minimum (WCAG 1.4.11).
const colors = readFileSync('tokens/colors.css', 'utf8');
const toast = readFileSync('components/feedback/Toast.jsx', 'utf8');
const table = body => Object.fromEntries([...body.matchAll(/(--[\w-]+):([^;]+);/g)].map(m => [m[1], m[2].trim()]));
const light = table(colors.match(/:root\{([\s\S]*?)\n\}/)[1]);
const dark = { ...light, ...table(colors.match(/\[data-theme="dark"\]\{([\s\S]*?)\n\}/)[1]) };
function hex(value) {
  for (let v = value, i = 0; i < 10; i += 1) {
    const ref = v.match(/^var\((--[\w-]+)\)$/);
    if (!ref) return v;
    v = dark[ref[1]];
  }
  throw new Error(`unresolved ${value}`);
}
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
function evaluate(expr) {
  const mix = expr.match(/^color-mix\(in srgb,(var\(--[\w-]+\)) (\d+)%,(var\(--[\w-]+\))\)$/);
  if (!mix) return rgb(hex(expr));
  const a = rgb(hex(mix[1])); const b = rgb(hex(mix[3])); const w = Number(mix[2]) / 100;
  return a.map((c, i) => Math.round(c * w + b[i] * (1 - w)));
}
const lum = c => { const [r, g, b] = c.map(v => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (x, y) => { const [hi, lo] = [lum(x), lum(y)].sort((p, q) => q - p); return (hi + 0.05) / (lo + 0.05); };

describe('dark-theme toast status icons', () => {
  it.each(['success', 'warning', 'danger', 'info'])('%s icon holds 3:1 on --surface-inverse', tone => {
    const rule = toast.match(new RegExp(`\\[data-theme="dark"\\] \\.ef-toast--${tone} \\.ef-toast__icon\\{color:([^}]+)\\}`));
    expect(rule, `${tone} has a dark override`).toBeTruthy();
    expect(ratio(evaluate(rule[1]), rgb(hex('var(--surface-inverse)')))).toBeGreaterThanOrEqual(3);
  });
});
