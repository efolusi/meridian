import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog } from '../components/feedback/Dialog.jsx';
import { Drawer } from '../components/overlay/Drawer.jsx';

// Escape is the keyboard user's way out of a modal, and a focus trap makes it
// the ONLY way out. So the rule has to cut both ways:
//
//   - a dialog with onClose must close on Escape, or a keyboard user is stuck
//     inside it with no route back to the page;
//   - a dialog WITHOUT onClose must not, because omitting onClose is how a
//     caller says "this decision cannot be waved away" — a session that ended,
//     a confirmation that must be answered.
//
// Consumers depend on the second half: Efolusi's session-expired dialog leaves
// onClose off precisely so nobody can dismiss it back onto a page whose every
// control will now fail.
describe('Escape and the modals', () => {
  it('closes a dialog that has a way out', async () => {
    const onClose = vi.fn();
    render(<Dialog open onClose={onClose} title="Ganti kata sandi" />);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close one that deliberately has none', async () => {
    // No onClose, no ✕, and Escape must not conjure an exit either.
    render(<Dialog open title="You have been signed out" />);
    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.queryByLabelText('Close')).toBeNull();
  });

  it('closes a drawer on Escape', async () => {
    const onClose = vi.fn();
    render(<Drawer open onClose={onClose} title="Menu" />);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('keeps Tab inside the dialog', async () => {
    render(
      <Dialog open onClose={() => {}} title="Trapped">
        <button type="button">first</button>
        <button type="button">second</button>
      </Dialog>,
    );
    const outside = document.createElement('button');
    outside.textContent = 'outside';
    document.body.appendChild(outside);

    screen.getByText('second').focus();
    await userEvent.tab();
    // Wherever focus landed, it must not be the button behind the modal.
    expect(document.activeElement).not.toBe(outside);
    expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true);
    outside.remove();
  });
});
