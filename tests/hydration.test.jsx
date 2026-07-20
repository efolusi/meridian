import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';

import { cssPct } from '../components/forms/Button.jsx';
import { Player } from '../components/ai/Player.jsx';
import { UsageMeter } from '../components/ai/UsageMeter.jsx';
import { BarChart } from '../components/data/BarChart.jsx';
import { Resizable } from '../components/display/Resizable.jsx';

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

describe('server-rendered styles survive the CSS parser', () => {
  it('Player, with generated placeholder peaks', () => {
    // The original defect: pseudoPeaks produces irrational-looking floats and
    // every bar carried all sixteen digits into the style attribute.
    expectStylesSurviveParsing(renderToString(<Player src="some-track.mp3" title="T" />));
  });

  it('Player, with caller-supplied peaks', () => {
    const peaks = Array.from({ length: 12 }, (_, i) => (i + 1) / 7);
    expectStylesSurviveParsing(renderToString(<Player src="x" peaks={peaks} />));
  });

  it('UsageMeter, at a ratio that does not divide evenly', () => {
    expectStylesSurviveParsing(renderToString(<UsageMeter used={1} limit={3} />));
  });

  it('BarChart, with values that do not divide evenly', () => {
    expectStylesSurviveParsing(
      renderToString(<BarChart data={[{ label: 'a', value: 1 }, { label: 'b', value: 3 }, { label: 'c', value: 7 }]} />),
    );
  });

  it('Resizable, at a ratio that does not divide evenly', () => {
    expectStylesSurviveParsing(
      renderToString(
        <Resizable ratio={1 / 3}>
          <div>left</div>
          <div>right</div>
        </Resizable>,
      ),
    );
  });
});
