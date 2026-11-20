import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// MD20 (#184): a missing "])," in Docs.dc.html broke its whole page script on the live
// site, and no check noticed. Every site page's logic script must at least compile.
const pages = readdirSync('site').filter((f) => f.endsWith('.dc.html'));

describe('site page scripts', () => {
  it.each(pages)('%s: the data-dc-script compiles', (page) => {
    const html = readFileSync(`site/${page}`, 'utf8');
    const scripts = [...html.matchAll(/<script type="text\/x-dc" data-dc-script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    for (const source of scripts) {
      expect(() => new Function('DCLogic', source), page).not.toThrow();
    }
  });
});
