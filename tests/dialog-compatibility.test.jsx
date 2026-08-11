import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/feedback/Dialog.jsx';
function Fixture({ onOpenChange }) { return <Dialog onOpenChange={onOpenChange}><DialogTrigger>Open dialog</DialogTrigger><DialogContent><DialogHeader><DialogTitle>Edit profile</DialogTitle><DialogDescription>Update account details.</DialogDescription></DialogHeader><DialogFooter><DialogClose>Save</DialogClose></DialogFooter></DialogContent></Dialog>; }
describe('Dialog compatibility contract', () => {
  it('opens an accessible composition and closes through DialogClose', () => {
    render(<Fixture />); fireEvent.click(screen.getByRole('button',{name:'Open dialog'})); const dialog=screen.getByRole('dialog',{name:'Edit profile'}); expect(dialog.getAttribute('aria-modal')).toBe('true'); expect(dialog.parentElement.parentElement.parentElement).toBe(document.body); expect(screen.getByText('Update account details.').id).toBe(dialog.getAttribute('aria-describedby')); fireEvent.click(screen.getByRole('button',{name:'Save'})); expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('supports controlled state notifications and asChild composition', () => {
    const changed=vi.fn(); render(<Dialog onOpenChange={changed}><DialogTrigger asChild><a href="#open">Open</a></DialogTrigger><DialogContent><DialogTitle>Title</DialogTitle><DialogClose asChild><a href="#close">Close</a></DialogClose></DialogContent></Dialog>); fireEvent.click(screen.getByRole('link',{name:'Open'})); expect(changed).toHaveBeenCalledWith(true); fireEvent.click(screen.getByRole('link',{name:'Close'})); expect(changed).toHaveBeenCalledWith(false);
  });
  it('closes on escape and restores trigger focus', () => {
    render(<Fixture />); const trigger=screen.getByRole('button',{name:'Open dialog'}); trigger.focus(); fireEvent.click(trigger); fireEvent.keyDown(screen.getByRole('dialog'),{key:'Escape'}); expect(screen.queryByRole('dialog')).toBeNull(); expect(document.activeElement).toBe(trigger);
  });
});
