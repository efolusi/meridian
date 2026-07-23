import { readFileSync } from 'node:fs';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';

import { CopyField } from '../components/code/CopyField.jsx';
import { Icon } from '../components/icons/Icon.jsx';

// Three regressions, all of which look like styling or naming mistakes at the
// call site rather than component bugs, which is what made them expensive.

describe('CopyField', () => {
  it('constrains the value so a long string ellipsizes instead of widening its parent', () => {
    // flex children default to min-width:auto, so without the override an
    // overflow:hidden + ellipsis value still forces the row wider than the page
    render(<CopyField label="Contract" value="0xb61a09e93b4f14585e9afbac3adaea626f25fb07" />);
    const css = document.getElementById('ef-css-copyfield').textContent;
    const value = css.match(/\.ef-copyfield__value\{([^}]*)\}/)[1];
    const box = css.match(/\.ef-copyfield__box\{([^}]*)\}/)[1];
    expect(value).toContain('min-width:0');
    expect(box).toContain('min-width:0');
    expect(box).toContain('max-width:100%');
  });

  it('forwards extra props when rendered without a label', () => {
    render(<CopyField value="0xabc" data-testid="ca" />);
    expect(screen.getByTestId('ca')).toBeTruthy();
  });
});

describe('Icon', () => {
  let warn;
  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    warn.mockRestore();
    vi.unstubAllGlobals();
  });

  it('warns by name when a glyph is missing instead of rendering an empty box in silence', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false, status: 404 })));
    await act(async () => {
      render(<Icon name="briefcase" />);
    });
    expect(warn).toHaveBeenCalled();
    expect(warn.mock.calls[0][0]).toContain('briefcase');
  });

  it('stays quiet when the fetch itself fails, which is the environment and not a bad name', async () => {
    // jsdom test runs have no base URL, so every valid icon rejects here; a
    // warning would be pure noise in every consumer's suite
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('Failed to parse URL'))));
    await act(async () => {
      render(<Icon name="check" />);
    });
    expect(warn).not.toHaveBeenCalled();
  });

  it('warns from the npm build too, which ships its own inlined-SVG implementation', () => {
    // The bundle and the npm package have separate Icon implementations, so a
    // fix applied only to the .jsx source leaves every `npm install` consumer
    // failing in silence. That is exactly how 1.9.1 shipped incomplete.
    const gen = readFileSync('scripts/build_npm.mjs', 'utf8');
    const template = gen.slice(gen.indexOf("files.set('icons/Icon.js'"));
    expect(template).toContain('console.warn');
    expect(template).toContain('SVGS[name]');
  });

  it('remembers a missing glyph so later mounts do not refetch it', async () => {
    const fetchMock = vi.fn(() => Promise.resolve({ ok: false, status: 404 }));
    vi.stubGlobal('fetch', fetchMock);
    await act(async () => {
      render(<Icon name="not-a-real-glyph" />);
    });
    const afterFirst = fetchMock.mock.calls.length;
    await act(async () => {
      render(<Icon name="not-a-real-glyph" />);
    });
    expect(fetchMock.mock.calls.length).toBe(afterFirst);
  });
});
