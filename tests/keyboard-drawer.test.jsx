import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/forms/Button.jsx';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '../components/overlay/Drawer.jsx';

function DrawerHarness({ direction = 'bottom', dismissible = true }) {
  return <Drawer direction={direction} dismissible={dismissible}>
    <DrawerTrigger asChild><Button>Open order</Button></DrawerTrigger>
    <DrawerContent>
      <DrawerHeader><DrawerTitle>Order review</DrawerTitle><DrawerDescription>Confirm before dispatch.</DrawerDescription></DrawerHeader>
      <div style={{ padding: 24 }}><Button>Inspect</Button></div>
      <DrawerFooter><DrawerClose asChild><Button>Cancel</Button></DrawerClose><Button>Dispatch</Button></DrawerFooter>
    </DrawerContent>
  </Drawer>;
}

describe('Drawer composition', () => {
  it('opens from an asChild trigger, exposes slots, and closes explicitly', async () => {
    const user = userEvent.setup();
    render(<DrawerHarness direction="right" />);
    await user.click(screen.getByRole('button', { name: 'Open order' }));
    const dialog = screen.getByRole('dialog', { name: 'Order review' });
    expect(dialog.dataset.slot).toBe('drawer-content');
    expect(dialog.dataset.vaulDrawerDirection).toBe('right');
    expect(document.querySelector('[data-slot="drawer-overlay"]')).toBeTruthy();
    for (const slot of ['drawer-handle', 'drawer-header', 'drawer-title', 'drawer-description', 'drawer-footer', 'drawer-close']) expect(dialog.querySelector(`[data-slot="${slot}"]`), slot).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('traps focus, closes on Escape, and restores the trigger', async () => {
    const user = userEvent.setup();
    render(<DrawerHarness />);
    const trigger = screen.getByRole('button', { name: 'Open order' });
    await user.click(trigger);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Inspect' }));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Cancel' }));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Dispatch' }));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Inspect' }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('keeps a non-dismissible drawer open on Escape and overlay interaction', async () => {
    const user = userEvent.setup();
    render(<DrawerHarness dismissible={false} />);
    await user.click(screen.getByRole('button', { name: 'Open order' }));
    await user.keyboard('{Escape}');
    expect(screen.getByRole('dialog')).toBeTruthy();
    await user.click(document.querySelector('[data-slot="drawer-overlay"]'));
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('dismisses a bottom drawer after an outward drag', async () => {
    const user = userEvent.setup();
    render(<DrawerHarness />);
    await user.click(screen.getByRole('button', { name: 'Open order' }));
    const panel = screen.getByRole('dialog');
    const handle = panel.querySelector('[data-slot="drawer-handle"]');
    const pointer = (target, type, clientY) => {
      const event = new Event(type, { bubbles: true });
      Object.defineProperties(event, { pointerId: { value: 1 }, clientY: { value: clientY } });
      fireEvent(target, event);
    };
    pointer(handle, 'pointerdown', 100);
    pointer(panel, 'pointermove', 220);
    pointer(panel, 'pointerup', 220);
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
