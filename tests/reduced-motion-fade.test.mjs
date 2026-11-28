import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

// MD33 (#212): under prefers-reduced-motion the tokens swap to the documented 120 ms fade
// (design-tokens docs/motion.md). The kill switch used to force transition-duration to .01ms
// with !important, so the fade never ran. The switch stops loops (animation) and leaves transitions to the tokens.
// base.css leaves the loading loops out of the rule by name (MD122): `*:not(:is(...)),*::before,*::after`; a starter keeps the plain `*,*::before,*::after`.
const KILL_SWITCH = /@media \(prefers-reduced-motion:reduce\)\{(?:\*,|\*:not\(:is\([^{}]*\)\),)\*::before,\*::after\{([^}]*)\}\}/;
const files = execFileSync('git', ['ls-files', 'tokens/base.css', 'starters'], { encoding: 'utf8' }).split('\n').filter((f) => /^tokens\/base\.css$|^starters\/.+\.html$/.test(f));
const withSwitch = files.filter((f) => KILL_SWITCH.test(readFileSync(f, 'utf8')));

describe('the reduced-motion kill switch', () => {
  it('is in tokens/base.css and the starters that carry one', () => {
    expect(withSwitch).toContain('tokens/base.css');
    expect(withSwitch.length).toBeGreaterThan(10);
  });

  it('does not force the transition duration, so the token fade runs', () => {
    for (const file of withSwitch) {
      const body = readFileSync(file, 'utf8').match(KILL_SWITCH)[1];
      expect(body, file).not.toMatch(/transition-duration/);
    }
  });

  it('still stops loops: base.css zeroes the duration and the delays and runs a loop once; a starter stops the animation', () => {
    for (const file of withSwitch) {
      const body = readFileSync(file, 'utf8').match(KILL_SWITCH)[1];
      if (file === 'tokens/base.css') {
        expect(body).toMatch(/--ef-motion-guard:\.01ms/);
        expect(body).toMatch(/animation-duration:var\(--ef-motion-guard\)!important/);
        expect(body).toMatch(/animation-iteration-count:1!important/);
        expect(body).toMatch(/animation-delay:0s!important/);
        expect(body).toMatch(/transition-delay:0s!important/);
      } else {
        expect(body, file).toMatch(/animation:none!important/);
      }
    }
  });

  it('lists no starter kill-switch literal for transition-duration in the motion allowlist', () => {
    const allowlist = JSON.parse(readFileSync('scripts/motion_allowlist.json', 'utf8'));
    for (const file of Object.keys(allowlist).filter((f) => f.startsWith('starters/') && f.endsWith('.html'))) {
      expect(readFileSync(file, 'utf8')).not.toContain('transition-duration:.01ms');
    }
  });
});
