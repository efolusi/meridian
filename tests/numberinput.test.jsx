import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { NumberInput } from '../components/forms/NumberInput.jsx';

// The APG spinbutton keyboard contract, on the native-adjacent shape this
// component uses: a text input with inputmode="decimal" plus two steppers.

describe('NumberInput', () => {
  it('steps with ArrowUp/ArrowDown, by 10× step with Shift', async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    render(<NumberInput label="Seats" defaultValue={4} onChange={spy} />);
    const input = screen.getByLabelText('Seats');
    await user.click(input);
    await user.keyboard('{ArrowUp}');
    expect(input.value).toBe('5');
    expect(spy).toHaveBeenLastCalledWith(5, expect.anything());
    await user.keyboard('{Shift>}{ArrowUp}{/Shift}');
    expect(input.value).toBe('15');
    await user.keyboard('{ArrowDown}');
    expect(input.value).toBe('14');
  });

  it('commits on blur: parses, snaps to the step grid, clamps to the rails', async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    render(
      <>
        <NumberInput label="Ratio" defaultValue={0} min={0} max={10} step={0.5} onChange={spy} />
        <button>away</button>
      </>
    );
    const input = screen.getByLabelText('Ratio');
    await user.clear(input);
    await user.type(input, '3.26');
    expect(input.value).toBe('3.26'); // draft: nothing committed while typing
    expect(spy).not.toHaveBeenCalled();
    await user.tab();
    expect(input.value).toBe('3.5'); // snapped, without float noise
    expect(spy).toHaveBeenLastCalledWith(3.5, expect.anything());
    await user.clear(input);
    await user.type(input, '99');
    await user.tab();
    expect(input.value).toBe('10'); // clamped to max
    expect(spy).toHaveBeenLastCalledWith(10, expect.anything());
  });

  it('commits null when emptied', async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    render(
      <>
        <NumberInput label="Seats" defaultValue={5} onChange={spy} />
        <button>away</button>
      </>
    );
    const input = screen.getByLabelText('Seats');
    await user.clear(input);
    await user.tab();
    expect(input.value).toBe('');
    expect(spy).toHaveBeenLastCalledWith(null, expect.anything());
  });

  it('Home and End jump to the rails when finite', async () => {
    const user = userEvent.setup();
    render(<NumberInput label="Level" defaultValue={5} min={1} max={9} />);
    const input = screen.getByLabelText('Level');
    await user.click(input);
    await user.keyboard('{End}');
    expect(input.value).toBe('9');
    await user.keyboard('{Home}');
    expect(input.value).toBe('1');
  });

  it('steppers step, carry Increase/Decrease labels, and disable at the rails', async () => {
    const user = userEvent.setup();
    render(<NumberInput label="Qty" defaultValue={9} min={0} max={10} />);
    const input = screen.getByLabelText('Qty');
    const up = screen.getByRole('button', { name: 'Increase' });
    const down = screen.getByRole('button', { name: 'Decrease' });
    expect(up.disabled).toBe(false);
    await user.click(up);
    expect(input.value).toBe('10');
    expect(up.disabled).toBe(true); // at the max rail
    await user.click(down);
    expect(input.value).toBe('9');
    expect(up.disabled).toBe(false);
    expect(down.disabled).toBe(false);
  });
});
