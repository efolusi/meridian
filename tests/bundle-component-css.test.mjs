// MD87: the starters load _ds_bundle.js, not the component source, so a component CSS change reaches the browser smoke only
// once the bundle is rebuilt (PR 284 round 6 shipped an Alert fix with a stale bundle and the smoke stayed red). The Alert
// test in alert-icons.test.jsx checks that one component; this checks every component that carries its own CSS string.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));
const bundle = readFileSync('_ds_bundle.js', 'utf8');
const withCss = walk('components')
  .filter((file) => file.endsWith('.jsx'))
  .map((file) => ({ file, match: /const CSS = `([\s\S]*?)`;/.exec(readFileSync(file, 'utf8')) }))
  .filter(({ match }) => match);

describe('_ds_bundle.js carries the component CSS on disk (MD87)', () => {
  it('finds the components that carry a CSS string', () => {
    expect(withCss.length).toBeGreaterThan(100);
  });

  it.each(withCss.map(({ file, match }) => [file, match[1].trim()]))('%s: its CSS is in the bundle', (_file, css) => {
    expect(bundle).toContain(css);
  });
});
