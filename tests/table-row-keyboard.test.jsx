import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Table } from '../components/data/Table.jsx';

const columns = [{ key: 'name', label: 'Name', sortable: true }];
const rows = [{ name: 'Charlie' }, { name: 'Alpha' }];

describe('Table rows with onRowClick are keyboard operable', () => {
  it('are focusable and fire on Enter and Space', () => {
    const onRowClick = vi.fn();
    render(<Table columns={columns} rows={rows} onRowClick={onRowClick} />);
    const tr = screen.getByText('Charlie').closest('tr');
    expect(tr.getAttribute('tabindex')).toBe('0');
    fireEvent.keyDown(tr, { key: 'Enter' });
    fireEvent.keyDown(tr, { key: ' ' });
    expect(onRowClick).toHaveBeenCalledTimes(2);
    expect(onRowClick).toHaveBeenCalledWith(rows[0]);
  });
  it('ignores keys that come from a control inside the row', () => {
    const onRowClick = vi.fn();
    render(<Table columns={[{ key: 'name', label: 'Name', render: v => <button type="button">{v}</button> }]} rows={rows} onRowClick={onRowClick} />);
    fireEvent.keyDown(screen.getByRole('button', { name: 'Charlie' }), { key: 'Enter' });
    expect(onRowClick).not.toHaveBeenCalled();
  });
  it('rows without onRowClick stay out of the tab order', () => {
    render(<Table columns={columns} rows={rows} />);
    expect(screen.getByText('Charlie').closest('tr').hasAttribute('tabindex')).toBe(false);
  });
  it('ships a visible focus style for clickable rows', () => {
    render(<Table columns={columns} rows={rows} onRowClick={() => {}} />);
    const css = document.getElementById('ef-css-table').textContent;
    expect(css).toMatch(/\.ef-table__row--click:focus-visible\{[^}]*(outline|box-shadow)[^}]*var\(--focus-ring(-color)?\)/);
  });
});

describe('Table hooks run before the composition early return', () => {
  it('keeps its sort state across a pass through composition mode', () => {
    const { rerender, container } = render(<Table columns={columns} rows={rows} />);
    fireEvent.click(screen.getByRole('button', { name: /Name/ }));
    const first = () => container.querySelector('tbody tr td').textContent;
    expect(first()).toBe('Alpha');
    rerender(<Table><tbody><tr><td>x</td></tr></tbody></Table>);
    rerender(<Table columns={columns} rows={rows} />);
    expect(first()).toBe('Alpha');
  });
});
