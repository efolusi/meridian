import { describe, expect, it } from 'vitest';
import { CAPTURE_CSS, settleForCapture } from '../scripts/capture_settle.mjs';

// A stand-in for a Playwright page: records what each evaluate() asks the browser to do.
function fakePage() {
  const calls = [];
  return {
    calls,
    evaluate: async fn => { calls.push(String(fn)); },
  };
}

describe('visual capture settling', () => {
  it('paints content-visibility:auto content so captures do not depend on scroll timing', () => {
    expect(CAPTURE_CSS).toMatch(/\*\s*\{\s*content-visibility:\s*visible\s*!important/);
  });

  it('captures glyphs and hides only the live summary', () => {
    expect(CAPTURE_CSS).not.toMatch(/data-slot="icon"/);
    expect(CAPTURE_CSS).toContain('#summary, body > h1, [data-live] { display: none !important; }');
    expect(CAPTURE_CSS).toMatch(/animation-duration:\s*0s\s*!important/);
    expect(CAPTURE_CSS).toMatch(/transition:\s*none\s*!important/);
  });

  it('waits for fonts, decoded images and a frame pair, in that order, before each group', async () => {
    const page = fakePage();
    await settleForCapture(page);
    expect(page.calls).toHaveLength(3);
    expect(page.calls[0]).toContain('document.fonts.ready');
    expect(page.calls[1]).toMatch(/document\.images[\s\S]*decode\(\)/);
    expect(page.calls[2]).toMatch(/requestAnimationFrame[\s\S]*requestAnimationFrame/);
  });
});
