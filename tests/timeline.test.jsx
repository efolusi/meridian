import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Timeline } from '../components/display/Timeline.jsx';

describe('Timeline', () => {
  const items = [
    { id: 'a', title: 'Review requested', description: 'Assigned to security.', time: '09:42', dateTime: '2026-08-10T09:42:00Z', actor: 'Ada', tone: 'warning' },
    { id: 'b', title: 'Approved', time: 'Yesterday', dateTime: '2026-08-09', tone: 'success' },
  ];

  it('renders a semantic ordered event list and machine-readable times', () => {
    const { container } = render(<Timeline items={items} aria-label="Audit history" />);
    expect(screen.getByRole('list', { name: 'Audit history' })).toBeTruthy();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(container.querySelector('time').getAttribute('datetime')).toBe('2026-08-10T09:42:00Z');
  });

  it('forwards root props and renders actor attribution', () => {
    render(<Timeline items={items} compact className="mine" data-testid="timeline" />);
    const root = screen.getByTestId('timeline');
    expect(root.className).toContain('ef-timeline--compact');
    expect(root.className).toContain('mine');
    expect(screen.getByText('Ada')).toBeTruthy();
  });
});

