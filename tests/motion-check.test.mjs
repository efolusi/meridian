import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ALLOWLIST_FILE, SCAN, allowlist, findLiterals, scanRepo } from '../scripts/check_motion.mjs';

// MD28 (#204): motion comes from the tokens (--dur-*, --ease-*), the way Glamor's check-motion.sh
// holds native views to G.Motion. A literal duration or curve in a motion declaration fails the check;
// a value with no token goes in scripts/motion_allowlist.json with its reason, and that list only shrinks.

const bad = (css) => findLiterals(css).length;

describe('findLiterals', () => {
  it('fails a literal duration in transition, animation and their longhands', () => {
    expect(bad('.a{transition:opacity 200ms var(--ease-enter)}')).toBe(1);
    expect(bad('.a{transition:color .2s var(--ease-enter)}')).toBe(1);
    expect(bad('.a{transition-duration:160ms}')).toBe(1);
    expect(bad('.a{animation-duration:0.5s}')).toBe(1);
    expect(bad('.a{animation:ef-pop 1.2s var(--ease-standard) infinite}')).toBe(1);
  });

  it('fails a literal cubic-bezier and a named easing', () => {
    expect(bad('.a{transition:opacity var(--dur-fast) cubic-bezier(.32,.72,0,1)}')).toBe(1);
    expect(bad('.a{transition-timing-function:cubic-bezier(.4,0,.2,1)}')).toBe(1);
    for (const name of ['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear', 'step-end']) {
      expect(bad(`.a{transition:opacity var(--dur-base) ${name}}`), name).toBe(1);
      expect(bad(`.a{animation-timing-function:${name}}`), name).toBe(1);
    }
  });

  it('fails a literal in a style object and as a var() fallback', () => {
    expect(bad("const s = { transition: 'opacity 0.3s var(--ease-enter)' };")).toBe(1);
    expect(bad('.a{animation:ef-x var(--ef-loader-dur,1.4s) var(--ease-standard) infinite}')).toBe(1);
  });

  it('passes the tokens, none, zero, and linear next to the progress token', () => {
    expect(bad('.a{transition:opacity var(--dur-fast) var(--ease-enter),transform var(--dur-base) var(--ease-emphasised)}')).toBe(0);
    expect(bad('.a{transition:width var(--dur-progress) linear}')).toBe(0);
    expect(bad('.a{transition:none;animation:none}')).toBe(0);
    expect(bad('.a{transition-duration:0s;animation-duration:0ms}')).toBe(0);
    expect(bad('.a{animation:ef-spin var(--dur-long) var(--ease-standard) infinite}')).toBe(0);
    expect(bad('.a{transition:opacity var(--dur-fast,var(--dur-base)) var(--ease-enter)}')).toBe(0);
  });

  it('ignores lengths, keyframe percentages, other properties and comments', () => {
    expect(bad('@keyframes x{0%{opacity:0}50%{opacity:.5}100%{opacity:1}}')).toBe(0);
    expect(bad('.a{width:200px;margin:.5em;font-size:1s;transition-property:opacity}')).toBe(0);
    expect(bad('/* transition: opacity 200ms ease */ .a{color:red}')).toBe(0);
    expect(bad('.a{animation-delay:30ms}')).toBe(0);
  });

  it('reports the line and the declaration', () => {
    const found = findLiterals('.a{color:red}\n.b{transition:opacity 200ms var(--ease-enter)}\n');
    expect(found).toEqual([{ line: 2, property: 'transition', value: 'opacity 200ms var(--ease-enter)', literals: ['200ms'] }]);
  });
});

describe('the repository', () => {
  it('scans components, site, blocks, starters and the Meridian CSS, and not the vendored token files', () => {
    expect(SCAN.test('components/forms/Button.jsx')).toBe(true);
    expect(SCAN.test('site/site.css')).toBe(true);
    expect(SCAN.test('site/Docs.dc.html')).toBe(true);
    expect(SCAN.test('blocks/hero.html')).toBe(true);
    expect(SCAN.test('starters/dashboard/Dashboard.dc.html')).toBe(true);
    expect(SCAN.test('styles.css')).toBe(true);
    expect(SCAN.test('landing.css')).toBe(true);
    expect(SCAN.test('tokens/base.css')).toBe(true);
    for (const vendored of ['tokens/effects.css', 'tokens/colors.css', 'tokens/fonts.css', 'site/registry/button.json', '_ds_bundle.js']) {
      expect(SCAN.test(vendored), vendored).toBe(false);
    }
  });

  it('has exactly the literals the allowlist lists, and every entry has a reason', () => {
    const counts = scanRepo();
    const listed = allowlist();
    const over = Object.entries(counts).filter(([file, found]) => found.length > (listed[file]?.count ?? 0)).map(([file, found]) => `${file}: ${found.length} found, ${listed[file]?.count ?? 0} allowed\n  ${found.map((f) => `${f.line}: ${f.property}: ${f.value}`).join('\n  ')}`);
    expect(over).toEqual([]);
    // The list only shrinks: an entry above what is found is stale, lower it or remove it.
    const stale = Object.entries(listed).filter(([file, entry]) => (counts[file]?.length ?? 0) < entry.count).map(([file]) => file);
    expect(stale).toEqual([]);
    for (const [file, entry] of Object.entries(listed)) {
      expect(typeof entry.reason === 'string' && entry.reason.trim().length > 10, `${file} needs a reason`).toBe(true);
      expect(Number.isInteger(entry.count) && entry.count > 0, `${file} needs a count`).toBe(true);
    }
  });

  it('keeps the allowlist in its file', () => {
    expect(ALLOWLIST_FILE).toBe('scripts/motion_allowlist.json');
    expect(() => JSON.parse(readFileSync(ALLOWLIST_FILE, 'utf8'))).not.toThrow();
  });
});
