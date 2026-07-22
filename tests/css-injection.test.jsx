import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';

import { injectEfCss, Button } from '../components/forms/Button.jsx';
import { Card } from '../components/display/Card.jsx';

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
    expect(tags[0].textContent).toBe('.x{color:red}'); // first write wins, second is a no-op
  });

  it('never leaks a <style> tag into rendered markup', () => {
    const html = renderToString(
      <Card title="T"><Button iconLeft="plus">Add</Button></Card>,
    );
    expect(html).not.toContain('<style');
    expect(html).toContain('ef-btn');
  });
});
