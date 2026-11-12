import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog, DialogContent, DialogTitle } from '../components/feedback/Dialog.jsx';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogCancel } from '../components/feedback/AlertDialog.jsx';
import { Tooltip, TooltipTrigger, TooltipContent } from '../components/feedback/Tooltip.jsx';
import { Popover, PopoverTrigger, PopoverContent } from '../components/overlay/Popover.jsx';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '../components/overlay/HoverCard.jsx';

// One Escape press closes the innermost open layer and nothing else. Each
// overlay used to listen on document for itself, so a popover, hover card or
// tooltip inside a dialog took the dialog down with it, and so did a dialog
// opened from a dialog.
describe('Escape closes only the innermost layer', () => {
  it('popover inside a dialog', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Dialog open onOpenChange={onOpenChange}><DialogContent><DialogTitle>Edit</DialogTitle>
        <Popover defaultOpen><PopoverTrigger>Pick</PopoverTrigger><PopoverContent><button type="button">inside</button></PopoverContent></Popover>
      </DialogContent></Dialog>,
    );
    screen.getByText('inside').focus();
    await user.keyboard('{Escape}');
    expect(screen.queryByText('inside')).toBeNull();
    expect(onOpenChange).not.toHaveBeenCalled();
    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('hover card inside a dialog', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Dialog open onOpenChange={onOpenChange}><DialogContent><DialogTitle>Edit</DialogTitle>
        <HoverCard defaultOpen><HoverCardTrigger>@ana</HoverCardTrigger><HoverCardContent>profile</HoverCardContent></HoverCard>
      </DialogContent></Dialog>,
    );
    await user.keyboard('{Escape}');
    expect(screen.queryByText('profile')).toBeNull();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('tooltip on a control inside a dialog', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Dialog open onOpenChange={onOpenChange}><DialogContent showCloseButton={false}><DialogTitle>Edit</DialogTitle>
        <Tooltip><TooltipTrigger>Bold</TooltipTrigger><TooltipContent>Ctrl+B</TooltipContent></Tooltip>
      </DialogContent></Dialog>,
    );
    screen.getByText('Bold').focus();
    expect(screen.getByRole('tooltip')).toBeTruthy();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('tooltip')).toBeNull();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('dialog opened from a dialog', async () => {
    const user = userEvent.setup();
    const outer = vi.fn();
    const inner = vi.fn();
    render(
      <Dialog open onOpenChange={outer}><DialogContent><DialogTitle>Outer</DialogTitle>
        <Dialog open onOpenChange={inner}><DialogContent><DialogTitle>Inner</DialogTitle></DialogContent></Dialog>
      </DialogContent></Dialog>,
    );
    await user.keyboard('{Escape}');
    expect(inner).toHaveBeenCalledWith(false);
    expect(outer).not.toHaveBeenCalled();
  });

  it('alert dialog opened from a dialog', async () => {
    const user = userEvent.setup();
    const outer = vi.fn();
    const inner = vi.fn();
    render(
      <Dialog open onOpenChange={outer}><DialogContent><DialogTitle>Outer</DialogTitle>
        <AlertDialog open onOpenChange={inner}><AlertDialogContent><AlertDialogTitle>Discard?</AlertDialogTitle><AlertDialogCancel>Keep</AlertDialogCancel></AlertDialogContent></AlertDialog>
      </DialogContent></Dialog>,
    );
    await user.keyboard('{Escape}');
    expect(inner).toHaveBeenCalledWith(false);
    expect(outer).not.toHaveBeenCalled();
  });

  it('a dialog with no way out still swallows Escape for the one behind it', async () => {
    const user = userEvent.setup();
    const outer = vi.fn();
    render(
      <Dialog open onOpenChange={outer}><DialogContent><DialogTitle>Outer</DialogTitle>
        <Dialog open><DialogContent showCloseButton={false}><DialogTitle>Signed out</DialogTitle></DialogContent></Dialog>
      </DialogContent></Dialog>,
    );
    await user.keyboard('{Escape}');
    expect(outer).not.toHaveBeenCalled();
    expect(screen.getByText('Signed out')).toBeTruthy();
  });

  it('alert dialog still honours a cancelled Escape', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <AlertDialog open onOpenChange={onOpenChange}><AlertDialogContent onKeyDown={e => { if (e.key === 'Escape') e.preventDefault(); }}><AlertDialogTitle>Discard?</AlertDialogTitle><AlertDialogCancel>Keep</AlertDialogCancel></AlertDialogContent></AlertDialog>,
    );
    await user.keyboard('{Escape}');
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
