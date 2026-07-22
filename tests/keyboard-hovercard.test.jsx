import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { HoverCard } from '../components/overlay/HoverCard.jsx';
import { Button } from '../components/forms/Button.jsx';

// guidelines/accessibility.md: "HoverCard is a non-modal panel (no dialog role)
// and dismisses on Escape" — it opens from hover or focus.

describe('HoverCard', () => {
  it('opens on focus without moving focus, and the panel is not a dialog', async () => {
    const user = userEvent.setup();
    render(
      <HoverCard trigger={<Button variant="ghost">@ada</Button>}>
        <p>Ada Lovelace</p>
      </HoverCard>
    );
    await user.tab();
    const anchor = document.activeElement;
    expect(await screen.findByText('Ada Lovelace')).toBeTruthy();
    // non-modal: focus stays on the trigger, nothing claims role=dialog
    expect(document.activeElement).toBe(anchor);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens on hover and closes when the pointer leaves', async () => {
    const user = userEvent.setup();
    render(
      <HoverCard openDelay={0} closeDelay={0} trigger={<Button variant="ghost">@ada</Button>}>
        <p>Ada Lovelace</p>
      </HoverCard>
    );
    await user.hover(screen.getByRole('button', { name: '@ada' }));
    expect(await screen.findByText('Ada Lovelace')).toBeTruthy();
    await user.unhover(screen.getByRole('button', { name: '@ada' }));
    // close goes through a 0ms timer, so it is not synchronous
    await waitFor(() => expect(screen.queryByText('Ada Lovelace')).toBeNull());
  });

  it('Escape dismisses a focus-opened card and focus stays on the trigger', async () => {
    const user = userEvent.setup();
    render(
      <HoverCard trigger={<Button variant="ghost">@ada</Button>}>
        <p>Ada Lovelace</p>
      </HoverCard>
    );
    await user.tab();
    const anchor = document.activeElement;
    await screen.findByText('Ada Lovelace');
    await user.keyboard('{Escape}');
    expect(screen.queryByText('Ada Lovelace')).toBeNull();
    expect(document.activeElement).toBe(anchor);
  });
});
