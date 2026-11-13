import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Dialog, DialogContent, DialogTitle } from '../components/feedback/Dialog.jsx';
import { AlertDialog, AlertDialogContent, AlertDialogTitle } from '../components/feedback/AlertDialog.jsx';
import { Sheet, SheetContent, SheetTitle } from '../components/overlay/Sheet.jsx';

// The page behind a modal must not scroll under it. AlertDialog locked the
// body; Dialog, and the Sheet, Drawer and CommandDialog built on it, did not,
// so a wheel or touch drag over the scrim scrolled the page away.
function DialogAt({ open, children }) {
  return <Dialog open={open} onOpenChange={() => {}}><DialogContent><DialogTitle>Edit</DialogTitle>{children}</DialogContent></Dialog>;
}

describe('modal scroll lock', () => {
  it('Dialog and Sheet lock the body and restore it', () => {
    document.body.style.overflow = 'scroll';
    const { rerender, unmount } = render(<DialogAt open />);
    expect(document.body.style.overflow).toBe('hidden');
    rerender(<DialogAt open={false} />);
    expect(document.body.style.overflow).toBe('scroll');
    unmount();
    const sheet = render(<Sheet open onOpenChange={() => {}}><SheetContent><SheetTitle>Filters</SheetTitle></SheetContent></Sheet>);
    expect(document.body.style.overflow).toBe('hidden');
    sheet.unmount();
    expect(document.body.style.overflow).toBe('scroll');
    document.body.style.overflow = '';
  });

  it('closing a nested modal keeps the outer one locked', () => {
    function Nested({ inner }) {
      return <DialogAt open><AlertDialog open={inner} onOpenChange={() => {}}><AlertDialogContent><AlertDialogTitle>Discard?</AlertDialogTitle></AlertDialogContent></AlertDialog></DialogAt>;
    }
    const { rerender, unmount } = render(<Nested inner />);
    expect(document.body.style.overflow).toBe('hidden');
    rerender(<Nested inner={false} />);
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
  });
});
