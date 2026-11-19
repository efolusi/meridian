import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { themeInitScript } from '../components/marketing/ThemeToggle.jsx';

// meridian.efolusi.com uses the same theme storage as every Efolusi site (MD03).
const theme = readFileSync('site/theme.js', 'utf8');
const pages = readdirSync('site').filter((f) => f.endsWith('.dc.html'));

describe('docs site theme', () => {
  it('runs themeInitScript() verbatim, so the site and the component never drift', () => {
    expect(theme).toContain(themeInitScript());
  });

  it('loads theme.js first in every page head and has no other theme storage', () => {
    for (const page of pages) {
      const src = readFileSync(`site/${page}`, 'utf8');
      expect(src, page).toMatch(/<head>\n<script src="\.\/theme\.js"><\/script>/);
      expect(src, page).not.toContain('efolusi-site-theme');
      expect(src, page).toContain('window.EfSiteTheme.cycle()');
    }
  });
});
