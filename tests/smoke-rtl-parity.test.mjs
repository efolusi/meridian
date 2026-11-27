// MD84: the baselines workflow ran the smoke in LTR only while checks.yml also runs an RTL pass, so a case that fails in RTL
// (the Table fade, PR 284) showed up one run after the baselines run. Both workflows now call the same entry point
// (scripts/smoke_headless.mjs) for the RTL pass; the baselines one takes no screenshots there.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const smokeLines = (file) => readFileSync(`.github/workflows/${file}`, 'utf8')
  .split('\n')
  .map((text, index) => ({ text, index }))
  .filter(({ text }) => /scripts\/smoke_headless\.mjs/.test(text) && !text.trim().startsWith('#'));

describe('the RTL smoke pass runs in both workflows that run the smoke (MD84)', () => {
  for (const file of ['checks.yml', 'update-visual-baselines.yml']) {
    it(`${file} calls scripts/smoke_headless.mjs with DIRECTION=rtl`, () => {
      expect(smokeLines(file).some(({ text }) => /DIRECTION=rtl\b/.test(text))).toBe(true);
    });
  }

  it('takes no screenshots in the RTL pass: the baselines are the LTR ones', () => {
    const rtl = smokeLines('update-visual-baselines.yml').filter(({ text }) => /DIRECTION=rtl\b/.test(text));
    expect(rtl).toHaveLength(1);
    expect(rtl[0].text).not.toMatch(/\bSHOTS=/);
  });

  it('runs the RTL pass in the capture step, before the step that commits the images', () => {
    const src = readFileSync('.github/workflows/update-visual-baselines.yml', 'utf8');
    const rtl = src.search(/DIRECTION=rtl[^\n]*smoke_headless\.mjs/);
    const commit = src.indexOf('- name: Open the baseline PR');
    expect(rtl).toBeGreaterThan(-1);
    expect(commit).toBeGreaterThan(rtl);
  });

  it('passes DIRECTION into the Playwright container', () => {
    const src = readFileSync('.github/workflows/update-visual-baselines.yml', 'utf8');
    expect(src).toMatch(/-e DIRECTION\b/);
  });

  it('stops when the LTR pass fails, as in checks.yml, and still stops the server', () => {
    const src = readFileSync('.github/workflows/update-visual-baselines.yml', 'utf8');
    const step = src.slice(src.indexOf('- name: Capture group screenshots'), src.indexOf('- name: Open the baseline PR'));
    expect(step).toMatch(/if \[ "\$CODE" -eq 0 \]; then[\s\S]*DIRECTION=rtl[\s\S]*fi/);
    expect(step).toMatch(/kill \$SERVER[\s\S]*exit \$CODE/);
  });
});
