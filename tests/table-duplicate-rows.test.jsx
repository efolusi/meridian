import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Table } from '../components/data/Table.jsx';

// The same object can appear twice in `rows` (a pinned row repeated, a cached
// reference reused). Without rowKey each occurrence still needs its own key.
const shared = { name: 'Alpha', n: 2 };
const rows = [shared, { name: 'Beta', n: 1 }, shared];
const columns = [{ key: 'name', label: 'Name', sortable: true }, { key: 'n', label: 'Count', sortable: true }];

describe('Table without rowKey', () => {
  it('gives repeated row references separate selection slots', () => {
    const onSelectionChange = vi.fn();
    render(<Table columns={columns} rows={rows} selectable onSelectionChange={onSelectionChange} />);
    const boxes = screen.getAllByRole('checkbox').slice(1);
    fireEvent.click(boxes[0]);
    expect(onSelectionChange).toHaveBeenLastCalledWith([0]);
    fireEvent.click(boxes[2]);
    expect(onSelectionChange).toHaveBeenLastCalledWith([0, 2]);
  });

  it('keeps each selection on its own occurrence across a sort', () => {
    render(<Table columns={columns} rows={rows} selectable defaultSelected={[2]} />);
    fireEvent.click(screen.getByRole('button', { name: /Count/ }));
    const checked = screen.getAllByRole('checkbox').slice(1).filter(b => b.checked || b.getAttribute('aria-checked') === 'true');
    expect(checked).toHaveLength(1);
  });

  it('renders duplicate references without React key warnings', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<Table columns={columns} rows={rows} />);
    expect(spy.mock.calls.some(c => String(c[0]).includes('same key'))).toBe(false);
    spy.mockRestore();
  });
});
