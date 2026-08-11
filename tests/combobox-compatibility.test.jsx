import { describe, it, expect, beforeAll, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Combobox, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem,
  ComboboxEmpty, ComboboxGroup, ComboboxLabel, ComboboxSeparator,
  ComboboxChips, ComboboxValue, ComboboxChip, ComboboxChipsInput,
} from '../components/forms/Combobox.jsx';

beforeAll(() => { Element.prototype.scrollIntoView = vi.fn(); });

describe('Combobox compatibility contract', () => {
  const regions = ['Asia', 'Europe', 'Americas'];

  function Basic({ onValueChange = () => {} }) {
    return <Combobox items={regions} onValueChange={onValueChange}><ComboboxInput placeholder="Select region" /><ComboboxContent><ComboboxEmpty>No regions found.</ComboboxEmpty><ComboboxList>{region => <ComboboxItem value={region}>{region}</ComboboxItem>}</ComboboxList></ComboboxContent></Combobox>;
  }

  it('filters render-function items and exposes complete combobox ARIA wiring', async () => {
    const user = userEvent.setup();
    render(<Basic />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    const list = screen.getByRole('listbox');
    expect(input.getAttribute('aria-controls')).toBe(list.id);
    await user.type(input, 'euro');
    expect(screen.getByRole('option', { name: 'Europe' }).hidden).toBe(false);
    expect(screen.queryByRole('option', { name: 'Asia' })).toBeNull();
    expect(input.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Europe' }).id);
  });

  it('selects with the keyboard and closes the popup', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(<Basic onValueChange={change} />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.keyboard('{ArrowDown}{Enter}');
    expect(change).toHaveBeenCalledWith('Europe');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('composes groups, labels, separators, and an empty state', async () => {
    const user = userEvent.setup();
    render(<Combobox><ComboboxInput /><ComboboxContent><ComboboxEmpty>Nothing found.</ComboboxEmpty><ComboboxList><ComboboxGroup><ComboboxLabel>Regions</ComboboxLabel><ComboboxItem value="Asia">Asia</ComboboxItem></ComboboxGroup><ComboboxSeparator /></ComboboxList></ComboboxContent></Combobox>);
    const input = screen.getByRole('combobox');
    await user.click(input);
    expect(screen.getByText('Regions').getAttribute('data-slot')).toBe('combobox-label');
    expect(document.querySelector('[data-slot="combobox-separator"]')).toBeTruthy();
    await user.type(input, 'missing');
    expect(screen.getByText('Nothing found.')).toBeTruthy();
  });

  it('supports multiple values, removable chips, and Backspace removal', async () => {
    const user = userEvent.setup();
    function Multiple() {
      const [value, setValue] = React.useState(['Asia', 'Europe']);
      return <><output>{value.join('|')}</output><Combobox items={regions} multiple value={value} onValueChange={setValue}><ComboboxChips><ComboboxValue>{value.map(region => <ComboboxChip key={region} value={region}>{region}</ComboboxChip>)}</ComboboxValue><ComboboxChipsInput aria-label="Regions" /></ComboboxChips><ComboboxContent><ComboboxList>{region => <ComboboxItem value={region}>{region}</ComboboxItem>}</ComboboxList></ComboboxContent></Combobox></>;
    }
    render(<Multiple />);
    await user.click(screen.getByRole('button', { name: 'Remove Asia' }));
    expect(screen.getByRole('status').textContent).toBe('Europe');
    const input = screen.getByRole('combobox', { name: 'Regions' });
    await user.click(input);
    await user.keyboard('{Backspace}');
    expect(screen.getByRole('status').textContent).toBe('');
  });
});
