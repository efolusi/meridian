// @vitest-environment node
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';

// Under jsdom `document` exists, so the suite next door never executes the
// server guard. This file runs in a bare node environment — the same world a
// Next.js server render lives in — where `typeof document === 'undefined'`
// and injection must be a silent no-op rather than a crash.
import { injectEfCss, Button } from '../components/forms/Button.jsx';

describe('injection on the server', () => {
  it('is a no-op without a document, not a crash', () => {
    expect(() => injectEfCss('ef-ssr-test', '.x{}')).not.toThrow();
  });

  it('components render to markup in a document-less environment', () => {
    const html = renderToString(React.createElement(Button, null, 'Save'));
    expect(html).toContain('ef-btn');
    expect(html).not.toContain('<style');
  });
});
