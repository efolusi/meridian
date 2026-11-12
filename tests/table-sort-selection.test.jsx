import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Table } from '../components/data/Table.jsx';

// Display-area review, 2026-11-12. Each block failed before its fix.

describe('Table', () => {
  const columns = [{ key: 'name', label: 'Name', sortable: true }, { key: 'n', label: 'N', sortable: true }];
  const rows = [{ name: 'Charlie', n: 3 }, { name: 'Alpha', n: 1 }, { name: 'Bravo', n: 2 }];
  const checkFor = name => screen.getByText(name).closest('tr').querySelector('[role="checkbox"], input[type="checkbox"]');
  it('selection without rowKey stays on the same row after sorting', () => {
    const onSel = vi.fn();
    render(<Table columns={columns} rows={rows} selectable onSelectionChange={onSel} />);
    fireEvent.click(checkFor('Charlie'));
    expect(onSel).toHaveBeenLastCalledWith([0]);
    fireEvent.click(screen.getByRole('button', { name: /Name/ }));
    // Charlie is now the last row; it must still be the selected one
    const selRows = [...document.querySelectorAll('tr.ef-table__row--sel')].map(r => r.textContent);
    expect(selRows).toEqual(['Charlie3']);
  });
  it('descending sort keeps equal keys in their original order', () => {
    const tied = [{ id: 'a', g: 1 }, { id: 'b', g: 1 }, { id: 'c', g: 2 }];
    const { container } = render(<Table columns={[{ key: 'id', label: 'Id' }, { key: 'g', label: 'G', sortable: true }]} rows={tied} rowKey="id" defaultSort={{ key: 'g', direction: 'desc' }} />);
    const order = [...container.querySelectorAll('tbody tr')].map(r => r.firstChild.textContent);
    expect(order).toEqual(['c', 'a', 'b']);
  });
});

