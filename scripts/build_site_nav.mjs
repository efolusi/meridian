// Build site/nav.json — the one list SiteSearch reads for its Pages and Docs groups.
//
// PAGES are DERIVED from the actual site/*.dc.html files, so a new page appears in
// search without editing any array: add the .dc.html, run the generator (check:fix
// does this), and it shows up with a title-derived label and a mapped-or-fallback
// icon. Label comes from each page's <title> (minus the " — Meridian" suffix);
// order and icon come from the small maps below, with a stable alphabetical tail
// and a 'file' fallback icon for any page not yet mapped.
//
// DOCS is a maintained list here (its true source is the DCLogic runtime inside
// Docs.dc.html; lifting it out would mean refactoring that page's runtime, which
// is out of proportion for a nine-item list). Keeping it in nav.json still removes
// the second hand-authored copy that used to live in SiteSearch.jsx.
//
//   node scripts/build_site_nav.mjs          # write site/nav.json
//   node scripts/build_site_nav.mjs --check  # fail if nav.json is stale vs the pages on disk
//
// Wired into check_all.mjs as a generator plus a stale gate.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = path.join(ROOT, 'site');
const OUT = path.join(SITE, 'nav.json');
const CHECK = process.argv.includes('--check');

// Preferred nav order and icon per page id. A page not listed here still appears
// (appended alphabetically, with the fallback icon) — that is the "no array edit"
// property. DsSite is the home page.
const ORDER = ['DsSite', 'Docs', 'Components', 'Blocks', 'Examples', 'Charts', 'Themes', 'Colors'];
const ICONS = {
  DsSite: 'house', Docs: 'book-open', Components: 'package', Blocks: 'layout-dashboard',
  Examples: 'bot', Charts: 'chart-line', Themes: 'sparkles', Colors: 'sliders-horizontal',
};
const FALLBACK_ICON = 'file';
const LABEL_OVERRIDE = { DsSite: 'Home' }; // its <title> is the tagline, not a nav label

// Docs sections — id (Docs.dc.html anchor) and its label. One maintained copy.
const DOCS = [
  ['introduction', 'Introduction'], ['installation', 'Installation'], ['theming', 'Theming'],
  ['dark-mode', 'Dark mode & density'], ['typography', 'Typography'], ['monorepo', 'Repository'],
  ['ai', 'AI & skills'], ['contributing', 'Contributing'], ['changelog', 'Changelog'],
];

function pageLabel(base, html) {
  if (LABEL_OVERRIDE[base]) return LABEL_OVERRIDE[base];
  const m = html.match(/<title>([^<]+)<\/title>/i);
  const title = m ? m[1].trim() : base;
  return title.split('—')[0].trim() || base; // "Blocks — Meridian" -> "Blocks"
}

function build() {
  const files = fs.readdirSync(SITE).filter(f => /\.dc\.html$/.test(f)).map(f => f.replace(/\.dc\.html$/, ''));
  const rank = b => { const i = ORDER.indexOf(b); return i === -1 ? ORDER.length : i; };
  const sorted = files.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
  const pages = sorted.map(base => ({
    id: `./${base}.dc.html`,
    label: pageLabel(base, fs.readFileSync(path.join(SITE, `${base}.dc.html`), 'utf8')),
    icon: ICONS[base] || FALLBACK_ICON,
  }));
  const docs = DOCS.map(([id, label]) => ({ id: `./Docs.dc.html#${id}`, label }));
  return JSON.stringify({ pages, docs }, null, 2) + '\n';
}

const next = build();

if (CHECK) {
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (cur !== next) {
    console.error('site/nav.json is out of date with the site/*.dc.html pages.');
    console.error('run: node scripts/build_site_nav.mjs');
    process.exit(1);
  }
  const n = JSON.parse(next);
  console.log(`site/nav.json matches (${n.pages.length} pages, ${n.docs.length} docs)`);
  process.exit(0);
}

fs.writeFileSync(OUT, next);
const n = JSON.parse(next);
console.log(`site/nav.json: ${n.pages.length} pages, ${n.docs.length} docs -> site/nav.json`);
