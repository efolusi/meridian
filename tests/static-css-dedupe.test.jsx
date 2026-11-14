import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';

// The registry's meridian-ssr-css sheet lists `<id>_<hash>` in --ef-css-static.
// injectEfCss may skip only CSS that hashes the same as what the sheet carries;
// anything else injects as it did before the sheet existed.
const SHEET = readFileSync(join(process.cwd(), 'registry', 'components.css'), 'utf8');
const LISTED = SHEET.match(/--ef-css-static:([^}]*)}/)[1];

async function load(listed) {
  vi.resetModules();
  vi.spyOn(window, 'getComputedStyle').mockImplementation(() => ({
    getPropertyValue: name => (name === '--ef-css-static' ? listed : ''),
  }));
  return import('../components/forms/Button.jsx');
}

const injected = id => document.head.querySelector(`style#${id}`);

beforeEach(() => document.head.querySelectorAll('style[id^="ef-css"]').forEach(s => s.remove()));
afterEach(() => vi.restoreAllMocks());

describe('injectEfCss with a static component sheet', () => {
  it('skips CSS the sheet carries with the same hash', async () => {
    const { Button } = await load(LISTED);
    render(<Button>Save</Button>);
    expect(injected('ef-css-btn')).toBeNull();
  });

  it('injects an edited CSS literal even though its id is listed', async () => {
    const { injectEfCss } = await load(LISTED);
    injectEfCss('ef-css-btn', '.ef-btn{color:red}');
    expect(injected('ef-css-btn').textContent).toBe('@layer meridian{.ef-btn{color:red}}');
  });

  it('injects an id the sheet does not list', async () => {
    const { injectEfCss } = await load(LISTED);
    injectEfCss('ef-css-not-in-sheet', '.x{}');
    expect(injected('ef-css-not-in-sheet')).not.toBeNull();
  });

  it('injects everything when there is no static sheet', async () => {
    const { Button } = await load('');
    render(<Button>Save</Button>);
    expect(injected('ef-css-btn').textContent).toContain('.ef-btn');
  });

  it('reads the list once per page, not once per call', async () => {
    const { injectEfCss } = await load(LISTED);
    injectEfCss('ef-css-a', '.a{}');
    injectEfCss('ef-css-b', '.b{}');
    expect(window.getComputedStyle).toHaveBeenCalledTimes(1);
  });
});
