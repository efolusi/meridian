import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../components/feedback/Dialog.jsx';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogCancel } from '../components/feedback/AlertDialog.jsx';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '../components/overlay/Sheet.jsx';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '../components/overlay/Drawer.jsx';

// Ported from PR #66 (DS-11). aria-describedby always pointed at the
// generated description id, so a modal without a Description referenced an
// element that does not exist, a custom Description id was ignored, and the
// caller's own aria-describedby was overwritten.
const kinds = [
  ['Dialog', (props, desc) => <Dialog open onOpenChange={() => {}}><DialogContent {...props}><DialogTitle>Title</DialogTitle>{desc && <DialogDescription id={desc.id}>Details.</DialogDescription>}</DialogContent></Dialog>, 'dialog'],
  ['AlertDialog', (props, desc) => <AlertDialog open onOpenChange={() => {}}><AlertDialogContent {...props}><AlertDialogTitle>Title</AlertDialogTitle>{desc && <AlertDialogDescription id={desc.id}>Details.</AlertDialogDescription>}<AlertDialogCancel>Cancel</AlertDialogCancel></AlertDialogContent></AlertDialog>, 'alertdialog'],
  ['Sheet', (props, desc) => <Sheet open onOpenChange={() => {}}><SheetContent {...props}><SheetTitle>Title</SheetTitle>{desc && <SheetDescription id={desc.id}>Details.</SheetDescription>}</SheetContent></Sheet>, 'dialog'],
  ['Drawer', (props, desc) => <Drawer open onOpenChange={() => {}}><DrawerContent {...props}><DrawerTitle>Title</DrawerTitle>{desc && <DrawerDescription id={desc.id}>Details.</DrawerDescription>}</DrawerContent></Drawer>, 'dialog'],
];

describe.each(kinds)('%s aria-describedby', (_name, ui, role) => {
  it('is omitted when no description renders', () => {
    render(ui({}, null));
    expect(screen.getByRole(role).hasAttribute('aria-describedby')).toBe(false);
  });

  it('points at the rendered description', () => {
    render(ui({}, {}));
    const id = screen.getByRole(role).getAttribute('aria-describedby');
    expect(id).toBeTruthy();
    expect(document.getElementById(id).textContent).toBe('Details.');
  });

  it('follows a custom description id', () => {
    render(ui({}, { id: 'custom-desc' }));
    expect(screen.getByRole(role).getAttribute('aria-describedby')).toBe('custom-desc');
  });

  it("keeps the caller's own aria-describedby", () => {
    render(<>{ui({ 'aria-describedby': 'outside' }, {})}<p id="outside">Elsewhere</p></>);
    expect(screen.getByRole(role).getAttribute('aria-describedby')).toBe('outside');
  });
});
