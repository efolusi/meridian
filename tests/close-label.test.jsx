import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dialog } from '../components/feedback/Dialog.jsx';
import { Drawer, DrawerClose, DrawerContent, DrawerTitle } from '../components/overlay/Drawer.jsx';

// The ✕ on Dialog and Drawer had its accessible name written in English in the
// source. Every other visible string in these components comes from the caller,
// so an Indonesian app shipped an Indonesian dialog whose only unlabelled-by-
// sight control announced itself as "Close" — the one control a screen-reader
// user depends on to get out.
describe('closing controls can be named in the reader’s language', () => {
  it('Dialog uses the label it is given', () => {
    render(<Dialog open onClose={() => {}} closeLabel="Tutup" title="Judul" />);
    expect(screen.getByLabelText('Tutup')).toBeTruthy();
    expect(screen.queryByLabelText('Close')).toBeNull();
  });

  it('Drawer uses the label it is given', () => {
    render(<Drawer open><DrawerContent><DrawerTitle>Judul</DrawerTitle><DrawerClose aria-label="Tutup" /></DrawerContent></Drawer>);
    expect(screen.getByLabelText('Tutup')).toBeTruthy();
    expect(screen.queryByLabelText('Close')).toBeNull();
  });

  it('still says Close when nobody says otherwise', () => {
    render(<Dialog open onClose={() => {}} title="Title" />);
    expect(screen.getByLabelText('Close')).toBeTruthy();
  });

  it('has no closing control at all without onClose, whatever the label says', () => {
    // A dialog with no way out is a deliberate choice (a session that ended,
    // a decision that must be made); passing a label must not conjure one.
    render(<Dialog open closeLabel="Tutup" title="Judul" />);
    expect(screen.queryByLabelText('Tutup')).toBeNull();
    expect(screen.queryByLabelText('Close')).toBeNull();
  });
});
