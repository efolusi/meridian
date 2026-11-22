import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TopNav } from '../components/navigation/TopNav.jsx';
import { TabBar } from '../components/navigation/TabBar.jsx';

// Audit of meridian#258 (warm glass): two mediums and three lows.
const items = [{ id: 'home', label: 'Products', href: '#home' }, { id: 'docs', label: 'Docs', href: '#docs' }];

describe('MEDIUM 1: TopNav keeps its old layout unless asked', () => {
  it('is static and full width by default, still glass, with no blur', () => {
    render(<TopNav title="Docs" />);
    const bar = screen.getByRole('banner');
    expect(bar.className).not.toMatch(/ef-topnav--floating|ef-topnav--sticky|ef-glass--blur/);
    expect(bar.className).toContain('ef-glass--chrome');
    const src = readFileSync('components/navigation/TopNav.jsx', 'utf8');
    expect(src).not.toMatch(/\.ef-topnav\{[^}]*position:sticky/);
  });
  it('floats and sticks only when asked, each on its own, and blurs only when sticky', () => {
    render(<TopNav title="A" floating />);
    expect(screen.getByRole('banner').className).toMatch(/ef-topnav--floating/);
    expect(screen.getByRole('banner').className).not.toMatch(/ef-topnav--sticky|ef-glass--blur/);
  });
  it('sticky adds the blur', () => {
    render(<TopNav title="B" sticky />);
    expect(screen.getByRole('banner').className).toMatch(/ef-topnav--sticky.*ef-glass--blur|ef-glass--blur.*ef-topnav--sticky/);
  });
});

describe('MEDIUM 2: nothing focused hides under a bar (WCAG 2.2 2.4.11)', () => {
  it('exports the bar heights and pads the scroll port while a bar is sticky or fixed', () => {
    const top = readFileSync('components/navigation/TopNav.jsx', 'utf8');
    const tab = readFileSync('components/navigation/TabBar.jsx', 'utf8');
    expect(top).toMatch(/--ef-topnav-space:/);
    expect(top).toMatch(/:root:has\(\.ef-topnav--sticky\)\{scroll-padding-block-start:var\(--ef-topnav-space\)\}/);
    expect(tab).toMatch(/--ef-tabbar-space:calc\([^;]*env\(safe-area-inset-bottom\)/);
    expect(tab).toMatch(/:root:has\(\.ef-tabbar\)\{scroll-padding-block-end:var\(--ef-tabbar-space\)\}/);
    expect(readFileSync('components/navigation/TabBar.prompt.md', 'utf8')).toMatch(/padding-block-end:\s*var\(--ef-tabbar-space\)/);
  });
});

describe('LOW 1: the changelog names the vendored tag', () => {
  it('matches tokens/design-tokens.lock.json', () => {
    const lock = JSON.parse(readFileSync('tokens/design-tokens.lock.json', 'utf8'));
    const log = readFileSync('CHANGELOG.md', 'utf8');
    const unreleased = log.slice(log.indexOf('## Unreleased'), log.indexOf('\n## v'));
    expect(unreleased).toContain(`vendored at ${lock.ref}`);
  });
});

describe('LOW 2: the bars are named landmarks, in English and Indonesian', () => {
  it('TabBar has a default name and an Indonesian one', () => {
    const { unmount } = render(<TabBar items={items} />);
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeTruthy();
    unmount();
    render(<TabBar items={items} lang="id" />);
    expect(screen.getByRole('navigation', { name: 'Navigasi utama' })).toBeTruthy();
  });
  it('TopNav names its banner, and labels can override', () => {
    const { unmount } = render(<TopNav title="A" />);
    expect(screen.getByRole('banner', { name: 'Top bar' })).toBeTruthy();
    unmount();
    render(<TopNav title="A" lang="id" labels={{ header: 'Bilah situs' }} />);
    expect(screen.getByRole('banner', { name: 'Bilah situs' })).toBeTruthy();
  });
});

describe('LOW 3: no focus rule in a glass component removes the outline', () => {
  const files = ['TopNav', 'TabBar', 'SegmentedControl'].map((n) => `components/navigation/${n}.jsx`)
    .concat(['components/marketing/ThemeToggle.jsx', 'components/forms/Input.jsx'])
    .concat(['Sheet', 'Drawer', 'Popover', 'DropdownMenu', 'ContextMenu', 'HoverCard'].map((n) => `components/overlay/${n}.jsx`));
  for (const f of files) {
    it(f, () => {
      expect(readFileSync(f, 'utf8')).not.toMatch(/:focus(-visible)?\)?\{[^}]*outline:none/);
    });
  }
});
