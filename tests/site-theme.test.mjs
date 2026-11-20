import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// meridian.efolusi.com uses the shipped plain scripts (browser/), the same ones other
// Efolusi sites load, so the docs site is their first user (MD03, MD14).
const pages = readdirSync('site').filter((f) => f.endsWith('.dc.html'));

describe('docs site theme', () => {
  it('loads theme-init.js first in every page head, then the marketing module', () => {
    for (const page of pages) {
      const src = readFileSync(`site/${page}`, 'utf8');
      expect(src, page).toMatch(/<head>\n<script src="\.\.\/browser\/theme-init\.js"><\/script>\n<script type="module" src="\.\.\/browser\/marketing\.js"><\/script>/);
    }
  });

  it('marks its header button as a theme toggle and keeps no theme logic of its own', () => {
    for (const page of pages) {
      const src = readFileSync(`site/${page}`, 'utf8');
      expect(src, page).toMatch(/data-slot="theme-toggle" class="site-theme"/);
      expect(src, page).not.toMatch(/EfSiteTheme|efolusi-site-theme|toggleTheme/);
    }
  });
});
