import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '../components/feedback/Dialog.jsx';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogTitle, AlertDialogTrigger } from '../components/feedback/AlertDialog.jsx';

afterEach(() => { cleanup(); document.body.style.overflow = ''; });

describe('Dialog accessibility (DS-11)', () => {
  it('locks body scroll while open and restores the previous value on close', () => {
    document.body.style.overflow = 'scroll';
    render(<Dialog><DialogTrigger>Open</DialogTrigger><DialogContent><DialogTitle>Title</DialogTitle></DialogContent></Dialog>);
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.body.style.overflow).toBe('scroll');
  });

  it('omits aria-describedby when no description is rendered', () => {
    render(<Dialog defaultOpen><DialogContent><DialogTitle>Title only</DialogTitle></DialogContent></Dialog>);
    expect(screen.getByRole('dialog').hasAttribute('aria-describedby')).toBe(false);
  });

  it('points aria-describedby at the rendered description, including a custom id', () => {
    render(<Dialog defaultOpen><DialogContent><DialogTitle>Title</DialogTitle><DialogDescription id="custom-desc">Details.</DialogDescription></DialogContent></Dialog>);
    expect(screen.getByRole('dialog').getAttribute('aria-describedby')).toBe('custom-desc');
  });

  it('keeps an explicit aria-describedby from the caller', () => {
    render(<Dialog defaultOpen><DialogContent aria-describedby="outside"><DialogTitle>Title</DialogTitle><DialogDescription>Details.</DialogDescription></DialogContent></Dialog>);
    expect(screen.getByRole('dialog').getAttribute('aria-describedby')).toBe('outside');
  });

  it('shares one lock with AlertDialog, so closing a nested alert keeps the page locked', () => {
    function Nested() {
      return (
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Outer</DialogTitle>
            <AlertDialog>
              <AlertDialogTrigger>Delete</AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogTitle>Sure?</AlertDialogTitle>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Confirm</AlertDialogAction>
              </AlertDialogContent>
            </AlertDialog>
          </DialogContent>
        </Dialog>
      );
    }
    render(<Nested />);
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('dialog', { name: 'Outer' })).toBeTruthy();
    expect(document.body.style.overflow).toBe('hidden');
  });
});
