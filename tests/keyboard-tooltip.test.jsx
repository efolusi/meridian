import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Tooltip } from '../components/feedback/Tooltip.jsx';
import { Button } from '../components/forms/Button.jsx';

// The contract guidelines/accessibility.md claims for Tooltip: linked to its
// trigger via aria-describedby while visible, shown on focus (not only hover),
// dismissed on Escape.

describe('Tooltip', () => {
  it('shows on keyboard focus alone, without hover', async () => {
    const user = userEvent.setup();
    render(<Tooltip label="Save"><Button>Save file</Button></Tooltip>);
    expect(screen.queryByRole('tooltip')).toBeNull();
    await user.tab(); // keyboard only — no pointer event ever fires
    const tip = await screen.findByRole('tooltip');
    expect(tip.textContent).toBe('Save');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Save file' }));
  });

  it('links the trigger to the tip via aria-describedby only while visible', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Tooltip label="Save"><Button>Save file</Button></Tooltip>
        <Button>Elsewhere</Button>
      </>
    );
    const trigger = screen.getByRole('button', { name: 'Save file' });
    expect(trigger.getAttribute('aria-describedby')).toBeNull();
    await user.tab();
    const tip = await screen.findByRole('tooltip');
    expect(tip.id).toBeTruthy();
    expect(trigger.getAttribute('aria-describedby')).toBe(tip.id);
    await user.tab(); // blur hides the tip; the reference must not dangle
    expect(screen.queryByRole('tooltip')).toBeNull();
    expect(trigger.getAttribute('aria-describedby')).toBeNull();
  });

  it('dismisses on Escape and leaves focus on the trigger', async () => {
    const user = userEvent.setup();
    render(<Tooltip label="Save"><Button>Save file</Button></Tooltip>);
    const trigger = screen.getByRole('button', { name: 'Save file' });
    await user.tab();
    await screen.findByRole('tooltip');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('tooltip')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
