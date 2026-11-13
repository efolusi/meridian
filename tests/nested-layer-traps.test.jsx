import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogCancel } from '../components/feedback/AlertDialog.jsx';
import { Popover, PopoverTrigger, PopoverContent } from '../components/overlay/Popover.jsx';
import { Dialog, DialogContent, DialogTitle } from '../components/feedback/Dialog.jsx';
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger } from '../components/navigation/Sidebar.jsx';

// A Popover's panel is portaled outside the modal that opened it. Dialog's
// focus trap already leaves focus alone while a child layer holds it;
// AlertDialog's and the mobile Sidebar's traps did not, so Tab from a middle
// item of the popover (not first or last, which the Popover handles itself)
// was pulled back to the modal's first control. And the mobile Sidebar closed
// on any Escape, even one meant for a popover or dialog inside it.
function Picker() {
  return (
    <Popover>
      <PopoverTrigger>Filters</PopoverTrigger>
      <PopoverContent><button type="button">One</button><button type="button">Two</button><button type="button">Three</button></PopoverContent>
    </Popover>
  );
}

// the mobile Sidebar renders its children twice (the desktop copy is hidden by
// CSS jsdom does not apply), so the trigger is looked up inside the given scope
async function tabFromMiddle(user, scope = screen) {
  await user.click(scope.getByRole('button', { name: 'Filters' }));
  screen.getByRole('button', { name: 'Two' }).focus();
  await user.tab();
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Three' }));
}

describe('focus traps leave a nested popover alone', () => {
  it('AlertDialog', async () => {
    const user = userEvent.setup();
    render(<AlertDialog open onOpenChange={() => {}}><AlertDialogContent><AlertDialogTitle>Export</AlertDialogTitle><Picker /><AlertDialogCancel>Cancel</AlertDialogCancel></AlertDialogContent></AlertDialog>);
    await tabFromMiddle(user);
  });

  describe('mobile Sidebar', () => {
    let original;
    beforeEach(() => {
      original = window.matchMedia;
      window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
    });
    afterEach(() => { window.matchMedia = original; });

    function App({ children }) {
      return <SidebarProvider><Sidebar aria-label="Main navigation"><SidebarContent>{children}</SidebarContent></Sidebar><SidebarTrigger /></SidebarProvider>;
    }
    const open = async user => { await user.click(screen.getByRole('button', { name: 'Toggle sidebar' })); };

    it('Tab inside a popover in the sidebar', async () => {
      const user = userEvent.setup();
      render(<App><Picker /></App>);
      await open(user);
      await tabFromMiddle(user, within(screen.getByRole('dialog', { name: 'Main navigation' })));
    });

    it('Escape in a popover closes only the popover', async () => {
      const user = userEvent.setup();
      render(<App><Picker /></App>);
      await open(user);
      await user.click(within(screen.getByRole('dialog', { name: 'Main navigation' })).getByRole('button', { name: 'Filters' }));
      screen.getByRole('button', { name: 'Two' }).focus();
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('button', { name: 'Two' })).toBeNull();
      expect(screen.getByRole('dialog', { name: 'Main navigation' })).toBeTruthy();
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('dialog', { name: 'Main navigation' })).toBeNull();
    });

    it('Escape in a dialog opened from the sidebar closes only the dialog', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(<App><Dialog open onOpenChange={onOpenChange}><DialogContent><DialogTitle>Rename</DialogTitle></DialogContent></Dialog></App>);
      await open(user);
      await user.keyboard('{Escape}');
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(screen.getByRole('dialog', { name: 'Main navigation' })).toBeTruthy();
    });
  });
});
