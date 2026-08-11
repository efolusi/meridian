import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyState, EmptyTitle } from '../components/data/EmptyState.jsx';
describe('Empty compatibility contract', () => {
  it('renders every composition slot and forwards refs', () => {
    const ref=React.createRef(); render(<Empty ref={ref} aria-label="Empty projects"><EmptyHeader><EmptyMedia variant="icon">!</EmptyMedia><EmptyTitle>Nothing here</EmptyTitle><EmptyDescription>Create the first item.</EmptyDescription></EmptyHeader><EmptyContent>Action</EmptyContent></Empty>);
    expect(ref.current.getAttribute('data-slot')).toBe('empty');
    expect(screen.getByText('Nothing here').getAttribute('data-slot')).toBe('empty-title');
    expect(screen.getByText('Create the first item.').getAttribute('data-slot')).toBe('empty-description');
    expect(screen.getByText('!').getAttribute('data-variant')).toBe('icon');
    expect(screen.getByText('Action').getAttribute('data-slot')).toBe('empty-content');
  });
  it('retains the shorthand adapter', () => {
    render(<EmptyState bordered title="No runs" description="Start one." action="Create" />);
    expect(screen.getByText('No runs')).toBeTruthy(); expect(screen.getByText('Start one.')).toBeTruthy(); expect(screen.getByText('Create')).toBeTruthy();
  });
});
