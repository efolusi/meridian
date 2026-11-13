import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('PR #66 port review fixes', () => {
  it('every docs page sets data-theme from the OS when nothing is stored, so the site chrome matches the auto-dark tokens', () => {
    const pages = readdirSync('site').filter(f => f.endsWith('.dc.html'));
    expect(pages.length).toBeGreaterThan(0);
    for (const f of pages) {
      const src = readFileSync(`site/${f}`, 'utf8');
      if (!src.includes("localStorage.getItem('efolusi-site-theme')")) continue;
      expect(src, f).toMatch(/localStorage\.getItem\('efolusi-site-theme'\) \|\| \(window\.matchMedia && window\.matchMedia\('\(prefers-color-scheme: dark\)'\)\.matches \? 'dark' : 'light'\)/);
      expect(src, f).not.toMatch(/if \(t\) document\.documentElement\.setAttribute\('data-theme', t\)/);
    }
  });

  it('the Bricolage fallback is Arial Bold across the heading weights it was measured against', () => {
    const face = readFileSync('tokens/fonts.css', 'utf8').match(/@font-face\{font-family:'Bricolage Grotesque Fallback';[^}]*\}/)[0];
    expect(face).toMatch(/local\('Arial Bold'\)/);
    expect(face).toMatch(/font-weight:100 900/);
  });
});
