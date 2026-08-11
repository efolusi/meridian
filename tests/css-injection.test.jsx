import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';

import { injectEfCss, Button } from '../components/forms/Button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/display/Card.jsx';

// The npm build extracts every CSS literal into a static components.css and
// strips injection; the CDN bundle keeps injecting. Both worlds only coexist
// because injection obeys two rules, pinned here.

describe('injectEfCss contract', () => {
  it('dedupes by id — a page loading both the CDN bundle and the npm build gets one tag', () => {
    // module-scope injection has already run for imported components, so the
    // dedupe branch is only exercised by calling again explicitly
    injectEfCss('ef-test-dedupe', '.x{color:red}');
    injectEfCss('ef-test-dedupe', '.x{color:blue}');
    const tags = document.querySelectorAll('style#ef-test-dedupe');
    expect(tags.length).toBe(1);
    // First write wins, second is a no-op — and the content sits inside the
    // `meridian` cascade layer, which is the contract that lets an app's own
    // unlayered CSS win a specificity tie without doubling its selectors.
    expect(tags[0].textContent).toBe('@layer meridian{.x{color:red}}');
  });

  it('never leaks a <style> tag into rendered markup', () => {
    const html = renderToString(
      <Card><CardHeader><CardTitle>T</CardTitle></CardHeader><CardContent><Button iconLeft="plus">Add</Button></CardContent></Card>,
    );
    expect(html).not.toContain('<style');
    expect(html).toContain('ef-btn');
  });
});
