import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia,
  AlertDialogOverlay, AlertDialogPortal, AlertDialogTitle, AlertDialogTrigger,
} from '../components/feedback/AlertDialog.jsx';

function Fixture({ onOpenChange, contentProps }) {
  return (
    <AlertDialog onOpenChange={onOpenChange}>
      <AlertDialogTrigger>Archive</AlertDialogTrigger>
      <AlertDialogContent {...contentProps}>
        <AlertDialogHeader>
          <AlertDialogMedia data-testid="media">!</AlertDialogMedia>
          <AlertDialogTitle>Archive project?</AlertDialogTitle>
          <AlertDialogDescription>Scheduled work will pause.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

describe('Alert Dialog compatibility contract', () => {
  it('opens the complete semantic composition in a portal', () => {
    render(<Fixture />);
    fireEvent.click(screen.getByRole('button', { name: 'Archive' }));
    const dialog = screen.getByRole('alertdialog', { name: 'Archive project?' });
    expect(dialog.parentElement.parentElement.parentElement).toBe(document.body);
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(screen.getByText('Scheduled work will pause.').id).toBe(dialog.getAttribute('aria-describedby'));
    expect(screen.getByTestId('media').getAttribute('data-slot')).toBe('alert-dialog-media');
  });

  it('supports controlled and uncontrolled state changes', () => {
    const changed = vi.fn();
    const { rerender } = render(<Fixture onOpenChange={changed} />);
    fireEvent.click(screen.getByRole('button', { name: 'Archive' }));
    expect(changed).toHaveBeenLastCalledWith(true);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(changed).toHaveBeenLastCalledWith(false);
    rerender(<AlertDialog open><AlertDialogContent><AlertDialogTitle>Controlled</AlertDialogTitle><AlertDialogDescription>Open</AlertDialogDescription></AlertDialogContent></AlertDialog>);
    expect(screen.getByRole('alertdialog', { name: 'Controlled' })).toBeTruthy();
  });

  it('composes triggers and actions with asChild without swallowing events', () => {
    const triggerClick = vi.fn();
    const actionClick = vi.fn(event => event.preventDefault());
    render(
      <AlertDialog>
        <AlertDialogTrigger asChild><a href="#archive" onClick={triggerClick}>Open</a></AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Decision</AlertDialogTitle><AlertDialogDescription>Choose.</AlertDialogDescription>
          <AlertDialogAction asChild><a href="#continue" onClick={actionClick}>Continue</a></AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>,
    );
    fireEvent.click(screen.getByRole('link', { name: 'Open' }));
    fireEvent.click(screen.getByRole('link', { name: 'Continue' }));
    expect(triggerClick).toHaveBeenCalledOnce();
    expect(actionClick).toHaveBeenCalledOnce();
    expect(screen.getByRole('alertdialog')).toBeTruthy();
  });

  it('prefers cancel focus, traps tab, closes on escape, and restores trigger focus', () => {
    render(<Fixture />);
    const trigger = screen.getByRole('button', { name: 'Archive' });
    fireEvent.click(trigger);
    const cancel = screen.getByRole('button', { name: 'Cancel' });
    const action = screen.getByRole('button', { name: 'Continue' });
    expect(document.activeElement).toBe(cancel);
    action.focus();
    fireEvent.keyDown(action, { key: 'Tab' });
    expect(document.activeElement).toBe(cancel);
    fireEvent.keyDown(cancel, { key: 'Escape' });
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('does not dismiss when the modal backdrop is clicked', () => {
    render(<Fixture />);
    fireEvent.click(screen.getByRole('button', { name: 'Archive' }));
    fireEvent.mouseDown(document.querySelector('[data-slot="alert-dialog-overlay"]'));
    expect(screen.getByRole('alertdialog')).toBeTruthy();
  });

  it('exports portal and overlay parts for custom composition', () => {
    const overlayRef = React.createRef();
    render(<AlertDialog open><AlertDialogPortal><AlertDialogOverlay ref={overlayRef} className="custom-overlay" /></AlertDialogPortal></AlertDialog>);
    expect(overlayRef.current.parentElement.parentElement).toBe(document.body);
    expect(overlayRef.current.className).toContain('custom-overlay');
    expect(overlayRef.current.getAttribute('data-state')).toBe('open');
  });

  it('forwards native content props, size, class, style, and refs across parts', () => {
    const contentRef = React.createRef();
    const headerRef = React.createRef();
    render(
      <AlertDialog open>
        <AlertDialogContent ref={contentRef} size="sm" className="consumer" style={{ opacity: 0.9 }} data-testid="content">
          <AlertDialogHeader ref={headerRef}><AlertDialogTitle>Details</AlertDialogTitle><AlertDialogDescription>Review.</AlertDialogDescription></AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>,
    );
    expect(contentRef.current).toBe(screen.getByTestId('content'));
    expect(headerRef.current instanceof HTMLDivElement).toBe(true);
    expect(contentRef.current.className).toContain('consumer');
    expect(contentRef.current.getAttribute('data-size')).toBe('sm');
    expect(contentRef.current.style.opacity).toBe('0.9');
  });
});
