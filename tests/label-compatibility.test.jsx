import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Label } from '../components/forms/Label.jsx';

describe('Label compatibility contract', () => {
  it('associates with and focuses its native control', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Label htmlFor="email">Email address</Label>
        <input id="email" />
      </div>,
    );
    await user.click(screen.getByText('Email address'));
    expect(document.activeElement).toBe(screen.getByRole('textbox'));
  });

  it('forwards ref and all native label attributes', () => {
    const ref = React.createRef();
    render(
      <Label
        ref={ref}
        htmlFor="name"
        aria-label="Name label"
        data-kind="field"
        className="consumer-label"
        style={{ marginTop: 4 }}
      >
        Name
      </Label>,
    );
    const label = screen.getByLabelText('Name label');
    expect(ref.current).toBe(label);
    expect(label.htmlFor).toBe('name');
    expect(label.dataset.kind).toBe('field');
    expect(label.classList.contains('consumer-label')).toBe(true);
    expect(label.style.marginTop).toBe('4px');
  });

  it('keeps Meridian required and hint content accessible without announcing the decorative asterisk', () => {
    render(<Label required hint="Used for receipts">Email</Label>);
    const label = screen.getByText('Email').closest('label');
    expect(label.textContent).toBe('Email*Used for receipts');
    expect(label.querySelector('.ef-label__req').getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByText('Used for receipts')).toBeTruthy();
  });
});
