import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/forms/Button.jsx';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '../components/overlay/Sheet.jsx';

describe('Sheet composition', () => {
  it('opens from an asChild trigger and exposes the requested side and slots', async () => {
    const user = userEvent.setup();
    render(<Sheet><SheetTrigger asChild><Button>Open settings</Button></SheetTrigger><SheetContent side="left"><SheetHeader><SheetTitle>Workspace</SheetTitle><SheetDescription>Edit workspace settings.</SheetDescription></SheetHeader><SheetFooter><SheetClose asChild><Button>Done</Button></SheetClose></SheetFooter></SheetContent></Sheet>);
    await user.click(screen.getByRole('button', { name: 'Open settings' }));
    const panel = screen.getByRole('dialog');
    expect(panel.dataset.slot).toBe('sheet-content');
    expect(panel.dataset.side).toBe('left');
    expect(panel.style.position).toBe('fixed');
    expect(panel.querySelector('[data-slot="sheet-header"]')).toBeTruthy();
    expect(panel.querySelector('[data-slot="sheet-title"]')).toBeTruthy();
    expect(panel.querySelector('[data-slot="sheet-description"]')).toBeTruthy();
    expect(panel.querySelector('[data-slot="sheet-footer"]')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('supports controlled state and cancellable Escape', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(<Sheet open onOpenChange={change}><SheetContent onEscapeKeyDown={event => event.preventDefault()}><SheetTitle>Persistent</SheetTitle></SheetContent></Sheet>);
    await user.keyboard('{Escape}');
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(change).not.toHaveBeenCalled();
  });
});
