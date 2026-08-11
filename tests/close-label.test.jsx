import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dialog, DialogContent, DialogTitle } from '../components/feedback/Dialog.jsx';
import { Drawer, DrawerClose, DrawerContent, DrawerTitle } from '../components/overlay/Drawer.jsx';

// The ✕ on Dialog and Drawer had its accessible name written in English in the
// source. Every other visible string in these components comes from the caller,
// so an Indonesian app shipped an Indonesian dialog whose only unlabelled-by-
// sight control announced itself as "Close" — the one control a screen-reader
// user depends on to get out.
describe('closing controls can be named in the reader’s language', () => {
  it('Dialog uses the label it is given', () => {
    render(<Dialog open><DialogContent closeLabel="Tutup"><DialogTitle>Judul</DialogTitle></DialogContent></Dialog>);
    expect(screen.getByLabelText('Tutup')).toBeTruthy();
    expect(screen.queryByLabelText('Close')).toBeNull();
  });

  it('Drawer uses the label it is given', () => {
    render(<Drawer open><DrawerContent><DrawerTitle>Judul</DrawerTitle><DrawerClose aria-label="Tutup" /></DrawerContent></Drawer>);
    expect(screen.getByLabelText('Tutup')).toBeTruthy();
    expect(screen.queryByLabelText('Close')).toBeNull();
  });

  it('still says Close when nobody says otherwise', () => {
    render(<Dialog open><DialogContent><DialogTitle>Title</DialogTitle></DialogContent></Dialog>);
    expect(screen.getByLabelText('Close')).toBeTruthy();
  });

  it('can explicitly omit the closing control', () => {
    render(<Dialog open><DialogContent showCloseButton={false} closeLabel="Tutup"><DialogTitle>Judul</DialogTitle></DialogContent></Dialog>);
    expect(screen.queryByLabelText('Tutup')).toBeNull();
    expect(screen.queryByLabelText('Close')).toBeNull();
  });
});
