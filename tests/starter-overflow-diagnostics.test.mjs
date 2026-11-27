// MD74 round 5: the starter smoke said 'horizontal overflow +2px' and nothing else, which cost a CI round to read. A failure
// now names the widest elements: tag, class, how far each one pokes past the viewport.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('the starter smoke names the element that overflows (MD74 round 5)', () => {
  const smoke = readFileSync('scripts/smoke_starters.mjs', 'utf8');
  const walk = readFileSync('scripts/overflow_culprits.mjs', 'utf8');
  it('collects the elements that reach past the viewport and prints them with the failure', () => {
    expect(smoke).toMatch(/culprits/);
    expect(walk).toMatch(/getBoundingClientRect\(\)\.right/);
    expect(smoke).toMatch(/horizontal overflow \+\$\{state\.overflow\}px \(\$\{state\.culprits/);
  });
  it('keeps the 1px tolerance', () => {
    expect(smoke).toMatch(/state\.overflow > 1/);
  });
});
