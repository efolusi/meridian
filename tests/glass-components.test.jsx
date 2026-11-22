import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TopNav } from '../components/navigation/TopNav.jsx';
import { TabBar } from '../components/navigation/TabBar.jsx';
import { SegmentedControl } from '../components/navigation/SegmentedControl.jsx';
import { ThemeToggle } from '../components/marketing/ThemeToggle.jsx';
import { Input } from '../components/forms/Input.jsx';

// Warm glass (design-tokens docs/glass.md): bars are chrome glass that content scrolls under (MD52);
// the theme switch, the segmented control and the search field are clear glass (MD53).
const glass = (el, kind, blur) => {
  expect(el.className).toContain('ef-glass');
  expect(el.className).toContain(`ef-glass--${kind}`);
  if (blur) expect(el.className).toContain('ef-glass--blur');
  else expect(el.className).not.toContain('ef-glass--blur');
};

describe('MD52: bars', () => {
  it('TopNav is a floating chrome-glass bar by default', () => {
    render(<TopNav title="Efolusi" />);
    const bar = screen.getByRole('banner');
    glass(bar, 'chrome', true);
    expect(bar.className).toContain('ef-topnav--floating');
  });

  it('TopNav can stay a full-width bar, still glass', () => {
    render(<TopNav title="Docs" floating={false} />);
    const bar = screen.getByRole('banner');
    glass(bar, 'chrome', true);
    expect(bar.className).not.toContain('ef-topnav--floating');
  });

  it('TopNav no longer paints its own blur or page background', () => {
    const src = readFileSync('components/navigation/TopNav.jsx', 'utf8');
    expect(src).not.toMatch(/\.ef-topnav\{[^}]*backdrop-filter/);
    expect(src).not.toMatch(/\.ef-topnav\{[^}]*background/);
  });

  it('TabBar is a floating chrome-glass nav for phones, marking the current item', () => {
    render(<TabBar aria-label="Screens" value="docs" items={[{ id: 'home', label: 'Products', href: '#home' }, { id: 'docs', label: 'Docs', href: '#docs' }]} />);
    const nav = screen.getByRole('navigation', { name: 'Screens' });
    glass(nav, 'chrome', true);
    expect(screen.getByRole('link', { name: 'Docs' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: 'Products' }).getAttribute('aria-current')).toBeNull();
    const src = readFileSync('components/navigation/TabBar.jsx', 'utf8');
    expect(src).toContain('env(safe-area-inset-bottom)');
    expect(src).toMatch(/min-height:var\(--tap-min\)/);
  });
});

describe('MD53: controls on clear glass', () => {
  it('SegmentedControl track is clear glass and the chosen option is thick glass', () => {
    render(<SegmentedControl aria-label="Scope" value="you" options={[{ id: 'you', label: 'You' }, { id: 'team', label: 'Team' }]} />);
    glass(screen.getByRole('group', { name: 'Scope' }), 'clear', false);
    const src = readFileSync('components/navigation/SegmentedControl.jsx', 'utf8');
    expect(src).toMatch(/\.ef-seg__opt--active\{[^}]*calc\(var\(--material-thick\) \* 100%\)/);
  });

  it('ThemeToggle is clear glass', () => {
    render(<ThemeToggle />);
    glass(screen.getByRole('button'), 'clear', false);
  });

  it('a search field can be clear glass', () => {
    render(<Input type="search" glass aria-label="Search settings" />);
    glass(screen.getByRole('searchbox', { name: 'Search settings' }), 'clear', false);
  });

  it('an Input without glass stays a plain field', () => {
    render(<Input aria-label="Name" />);
    expect(screen.getByRole('textbox', { name: 'Name' }).className).not.toContain('ef-glass');
  });
});
