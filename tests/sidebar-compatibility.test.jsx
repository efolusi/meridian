import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarInput, SidebarInset, SidebarMenu, SidebarMenuAction, SidebarMenuBadge, SidebarMenuButton,
  SidebarMenuItem, SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider,
  SidebarRail, SidebarSeparator, SidebarTrigger, useSidebar,
} from '../components/navigation/Sidebar.jsx';

function Probe() {
  const value = useSidebar();
  return <output data-testid="state">{value.state}:{String(value.open)}:{String(value.openMobile)}:{String(value.isMobile)}</output>;
}

describe('Sidebar compatibility', () => {
  it('exports the complete composition and renders stable slots', () => {
    const view = render(<SidebarProvider><Sidebar collapsible="icon"><SidebarHeader><SidebarInput aria-label="Search" /></SidebarHeader><SidebarContent><SidebarGroup><SidebarGroupLabel>Workspace</SidebarGroupLabel><SidebarGroupAction aria-label="Add">+</SidebarGroupAction><SidebarGroupContent><SidebarMenu><SidebarMenuItem><SidebarMenuButton isActive><span>Overview</span></SidebarMenuButton><SidebarMenuAction aria-label="More">…</SidebarMenuAction><SidebarMenuBadge>4</SidebarMenuBadge><SidebarMenuSub><SidebarMenuSubItem><SidebarMenuSubButton>Runs</SidebarMenuSubButton></SidebarMenuSubItem></SidebarMenuSub></SidebarMenuItem></SidebarMenu><SidebarMenuSkeleton showIcon /></SidebarGroupContent></SidebarGroup></SidebarContent><SidebarSeparator /><SidebarFooter>Account</SidebarFooter><SidebarRail /></Sidebar><SidebarInset>Content</SidebarInset></SidebarProvider>);
    for (const slot of ['sidebar', 'sidebar-header', 'sidebar-input', 'sidebar-content', 'sidebar-group', 'sidebar-group-label', 'sidebar-group-action', 'sidebar-group-content', 'sidebar-menu', 'sidebar-menu-item', 'sidebar-menu-button', 'sidebar-menu-action', 'sidebar-menu-badge', 'sidebar-menu-sub', 'sidebar-menu-sub-item', 'sidebar-menu-sub-button', 'sidebar-menu-skeleton', 'sidebar-separator', 'sidebar-footer', 'sidebar-rail', 'sidebar-inset']) expect(view.container.querySelector(`[data-slot="${slot}"]`)).toBeTruthy();
    expect(view.container.querySelector('[data-slot="sidebar-menu-button"]').getAttribute('data-active')).toBe('true');
  });

  it('supports uncontrolled and controlled desktop state', () => {
    const uncontrolled = render(<SidebarProvider defaultOpen={false}><Probe /><SidebarTrigger /></SidebarProvider>);
    expect(screen.getByTestId('state').textContent).toContain('collapsed:false');
    fireEvent.click(screen.getByRole('button', { name: 'Toggle sidebar' }));
    expect(screen.getByTestId('state').textContent).toContain('expanded:true');
    uncontrolled.unmount();
    const change = vi.fn();
    render(<SidebarProvider open={false} onOpenChange={change}><SidebarTrigger /></SidebarProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Toggle sidebar' }));
    expect(change).toHaveBeenCalledWith(true);
  });

  it('toggles with the documented keyboard shortcut', () => {
    render(<SidebarProvider><Probe /></SidebarProvider>);
    fireEvent.keyDown(window, { key: 'b', ctrlKey: true });
    expect(screen.getByTestId('state').textContent).toContain('collapsed:false');
  });

  it('uses independent mobile open state at the compact breakpoint', () => {
    const original = window.matchMedia;
    window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
    const view = render(<SidebarProvider><Probe /><Sidebar><SidebarContent>Mobile navigation</SidebarContent></Sidebar><SidebarTrigger /></SidebarProvider>);
    expect(screen.getByTestId('state').textContent).toContain('false:true');
    fireEvent.click(screen.getByRole('button', { name: 'Toggle sidebar' }));
    expect(screen.getByTestId('state').textContent).toContain('true:true');
    expect(view.container.querySelector('[data-mobile="true"]')).toBeTruthy();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(view.container.querySelector('[data-mobile="true"]')).toBeFalsy();
    window.matchMedia = original;
  });

  it('supports link and render composition without nested interactive elements', () => {
    render(<SidebarProvider><SidebarMenuButton href="/runs">Runs</SidebarMenuButton><SidebarTrigger render={<a href="#toggle" />}>Toggle</SidebarTrigger></SidebarProvider>);
    expect(screen.getByRole('link', { name: 'Runs' }).getAttribute('href')).toBe('/runs');
    expect(screen.getByRole('link', { name: 'Toggle sidebar' }).getAttribute('data-slot')).toBe('sidebar-trigger');
  });

  it('requires a provider for the hook', () => {
    expect(() => render(<Probe />)).toThrow(/SidebarProvider/);
  });
});
