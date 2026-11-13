import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// A visually hidden live region is position:absolute. Without a positioned
// ancestor it is placed against the page, escapes every overflow clip on the
// way up and widens the document (the app-page starter overflowed by 247px at
// 320px). Each component that renders one must be its containing block.
const cases = [
  ['components/code/CopyField.jsx', 'ef-copyfield', 'ef-copyfield__sr'],
  ['components/code/CodeBlock.jsx', 'ef-code', 'ef-code__sr'],
];

describe('hidden live regions stay inside their component', () => {
  for (const [file, root, sr] of cases) {
    it(`${root} contains .${sr}`, () => {
      const src = readFileSync(file, 'utf8');
      expect(src).toMatch(new RegExp(`\\.${sr}\\{[^}]*position:absolute`));
      expect(src).toMatch(new RegExp(`\\.${root}\\{[^}]*position:relative`));
    });
  }
});
