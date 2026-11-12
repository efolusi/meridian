import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from '../components/navigation/Sidebar.jsx';

// Below 768px the sidebar opens off-canvas over a backdrop. It was a bare
// <aside>: focus stayed on the trigger behind the backdrop, Tab walked the
// covered page, and closing it left focus wherever it fell.
let original;
beforeEach(() => {
  original = window.matchMedia;
  window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
});
afterEach(() => { window.matchMedia = original; });

function App() {
  return (
    <SidebarProvider>
      <Sidebar aria-label="Main navigation">
        <SidebarContent><SidebarMenu>
          <SidebarMenuItem><SidebarMenuButton href="/inbox">Inbox</SidebarMenuButton></SidebarMenuItem>
          <SidebarMenuItem><SidebarMenuButton href="/runs">Runs</SidebarMenuButton></SidebarMenuItem>
        </SidebarMenu></SidebarContent>
      </Sidebar>
      <main><SidebarTrigger /><button type="button">Page action</button></main>
    </SidebarProvider>
  );
}

describe('mobile sidebar is a modal dialog', () => {
  it('is labelled, takes focus, traps Tab and returns focus on close', async () => {
    const user = userEvent.setup();
    render(<App />);
    const trigger = screen.getByRole('button', { name: 'Toggle sidebar' });
    trigger.focus();
    await user.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Main navigation' });
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');
    await user.tab();
    await user.tab();
    expect(dialog.contains(document.activeElement)).toBe(true);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(document.body.style.overflow).toBe('');
  });

  it('ignores a keydown without a key (browser autofill)', () => {
    render(<App />);
    const errors = [];
    const onError = e => { errors.push(e.error); e.preventDefault(); };
    window.addEventListener('error', onError);
    window.dispatchEvent(new Event('keydown'));
    window.removeEventListener('error', onError);
    expect(errors).toEqual([]);
  });
});
