import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';

import { cssPct } from '../components/runtime/runtime.jsx';
import { UsageMeter } from '../components/ai/UsageMeter.jsx';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../components/display/Resizable.jsx';

/**
 * Server-rendered markup must survive a round trip through the browser's CSS
 * parser unchanged.
 *
 * When it does not, React's hydration check compares the string it rendered
 * against the value the DOM read back and reports a mismatch. That is the
 * failure these tests exist to catch, and it is worth testing the round trip
 * itself rather than asserting a particular number of decimal places: the
 * parser's precision is the browser's business, and pinning our guess about it
 * would pass while the real behaviour drifted.
 */

/**
 * The obvious test here is a round trip: write the style into a node, read it
 * back, assert it is unchanged. That does not work under jsdom, whose CSS
 * parser preserves full float precision where Chrome keeps about six
 * significant figures. Written that way the suite passes even with the fix
 * reverted, which was confirmed by trying it.
 *
 * So the assertion is made against the property we actually control: no number
 * we serialise carries more decimals than every engine keeps. Chrome's exact
 * threshold is the browser's business and not ours to pin.
 */
const MAX_DECIMALS = 3;

/** Every inline style attribute in a server-rendered tree. */
function inlineStyles(html) {
  const host = document.createElement('div');
  host.innerHTML = html;
  return [...host.querySelectorAll('[style]')].map((n) => n.getAttribute('style'));
}

function expectStylesSurviveParsing(html) {
  const styles = inlineStyles(html);
  expect(styles.length).toBeGreaterThan(0);
  for (const style of styles) {
    for (const [, digits] of style.matchAll(/\d+\.(\d+)/g)) {
      expect(
        digits.length,
        `style "${style}" carries ${digits.length} decimals; more than ${MAX_DECIMALS} is truncated by the CSS parser and mismatches on hydration`,
      ).toBeLessThanOrEqual(MAX_DECIMALS);
    }
  }
}

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

describe('server-rendered styles survive the CSS parser', () => {

  it('ResizablePanel, at a percentage that does not divide evenly', () => {
    expectStylesSurviveParsing(
      renderToString(
        <ResizablePanelGroup>
          <ResizablePanel defaultSize={100 / 3}><div>left</div></ResizablePanel>
          <ResizableHandle />
          <ResizablePanel><div>right</div></ResizablePanel>
        </ResizablePanelGroup>,
      ),
    );
  });
});
