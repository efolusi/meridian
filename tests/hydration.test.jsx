import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';

import { cssPct } from '../components/runtime/runtime.jsx';
import { UsageMeter } from '../components/ai/UsageMeter.jsx';

/**
 * Server-rendered markup must survive a round trip through the browser's CSS parser
 * unchanged. Components that set a percentage at runtime (UsageMeter, Resizable) now
 * write it through the CSSOM after mount, so the server HTML has no style attribute; these
 * tests cover cssPct, which caps the precision of what is written, and the hydration of
 * UsageMeter at a ratio that does not divide evenly. Resizable is covered in
 * no-inline-styles.test.jsx.
 */

describe('cssPct', () => {
  it('caps precision so the parser has nothing to truncate', () => {
    expect(cssPct(100 / 3)).toBe('33.333%');
    expect(cssPct(32.67021646156489)).toBe('32.67%');
  });

  it('emits no trailing zeros, which the parser would strip and remismatch', () => {
    expect(cssPct(33.3)).toBe('33.3%');
    expect(cssPct(50)).toBe('50%');
    expect(cssPct(80.06002337425701)).toBe('80.06%');
  });

  it('leaves whole numbers alone', () => {
    expect(cssPct(0)).toBe('0%');
    expect(cssPct(100)).toBe('100%');
  });
});

describe('UsageMeter, at a ratio that does not divide evenly', () => {
  // The fill width is set through the CSSOM after mount, so the server HTML carries no
  // style attribute for the parser to truncate; what is left to guard is that hydration
  // reports no mismatch and the width written is a short percentage.
  it('hydrates without a mismatch and writes a short percentage', async () => {
    const { hydrateRoot } = await import('react-dom/client');
    const { act } = await import('react');
    const html = renderToString(<UsageMeter used={1} limit={3} />);
    expect(html).not.toMatch(/\sstyle="/);
    const host = document.createElement('div');
    host.innerHTML = html;
    document.body.appendChild(host);
    const errors = [];
    await act(async () => { hydrateRoot(host, <UsageMeter used={1} limit={3} />, { onRecoverableError: (e) => errors.push(e) }); });
    expect(errors).toEqual([]);
    expect(host.querySelector('.ef-usage__fill').style.width).toBe('33.333%');
    host.remove();
  });
});
