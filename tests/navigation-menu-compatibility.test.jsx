// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from '../components/navigation/NavigationMenu.jsx';

afterEach(cleanup);

function Fixture(props = {}) {
  return <NavigationMenu {...props}>
    <NavigationMenuList>
      <NavigationMenuItem value="platform">
        <NavigationMenuTrigger>Platform</NavigationMenuTrigger>
        <NavigationMenuContent>
          <NavigationMenuLink href="#automation">Automation</NavigationMenuLink>
        </NavigationMenuContent>
      </NavigationMenuItem>
      <NavigationMenuItem value="resources">
        <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
        <NavigationMenuContent>
          <NavigationMenuLink href="#guides">Guides</NavigationMenuLink>
        </NavigationMenuContent>
      </NavigationMenuItem>
      <NavigationMenuIndicator data-testid="indicator" />
    </NavigationMenuList>
  </NavigationMenu>;
}

describe('NavigationMenu compatibility', () => {
  it('exports every composition slot and its trigger style helper', () => {
    expect([NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink, NavigationMenuIndicator, NavigationMenuViewport]).toHaveLength(8);
    expect(navigationMenuTriggerStyle()).toBe('ef-navigation-menu__trigger');
  });

  it('opens content in the shared viewport and closes after link activation', () => {
    render(<Fixture />);
    fireEvent.click(screen.getByRole('button', { name: 'Platform' }));
    expect(screen.getByRole('link', { name: 'Automation' })).toBeTruthy();
    expect(document.querySelector('[data-slot="navigation-menu-viewport"]')).toBeTruthy();
    expect(screen.getByTestId('indicator').getAttribute('data-state')).toBe('visible');
    fireEvent.click(screen.getByRole('link', { name: 'Automation' }));
    expect(screen.queryByRole('link', { name: 'Automation' })).toBeNull();
  });

  it('supports direct content without a viewport', () => {
    render(<Fixture viewport={false} defaultValue="platform" />);
    const content = document.querySelector('[data-slot="navigation-menu-content"]');
    expect(content).toBeTruthy();
    expect(document.querySelector('[data-slot="navigation-menu-viewport"]')).toBeNull();
  });

  it('moves roving focus with LTR and RTL arrow keys', () => {
    const { rerender } = render(<Fixture />);
    const platform = screen.getByRole('button', { name: 'Platform' });
    const resources = screen.getByRole('button', { name: 'Resources' });
    platform.focus();
    fireEvent.keyDown(platform, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(resources);

    rerender(<div dir="rtl"><Fixture /></div>);
    const rtlPlatform = screen.getByRole('button', { name: 'Platform' });
    const rtlResources = screen.getByRole('button', { name: 'Resources' });
    rtlPlatform.focus();
    fireEvent.keyDown(rtlPlatform, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(rtlResources);
  });

  it('returns focus to its trigger on Escape', () => {
    render(<Fixture defaultValue="platform" />);
    const link = screen.getByRole('link', { name: 'Automation' });
    link.focus();
    fireEvent.keyDown(link, { key: 'Escape' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Platform' }));
  });

  it('reports controlled value changes without owning state', () => {
    const onValueChange = vi.fn();
    render(<Fixture value="" onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Platform' }));
    expect(onValueChange).toHaveBeenCalledWith('platform');
    expect(screen.queryByRole('link', { name: 'Automation' })).toBeNull();
  });

  it('composes a custom anchor with asChild', () => {
    render(<NavigationMenu viewport={false} defaultValue="one"><NavigationMenuList><NavigationMenuItem value="one"><NavigationMenuContent><NavigationMenuLink asChild active><a href="#custom" className="custom">Custom</a></NavigationMenuLink></NavigationMenuContent></NavigationMenuItem></NavigationMenuList></NavigationMenu>);
    const link = screen.getByRole('link', { name: 'Custom' });
    expect(link.className.split(' ')).toEqual(expect.arrayContaining(['ef-navigation-menu__link', 'custom']));
    expect(link.getAttribute('data-active')).toBe('true');
  });
});
