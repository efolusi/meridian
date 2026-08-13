import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea } from '../components/forms/InputGroup.jsx';
describe('Input Group compatibility contract', () => {
  it('composes input, addons, text, and buttons with stable slots', () => {
    render(<InputGroup aria-label="Search"><InputGroupInput aria-label="Query" /><InputGroupAddon><InputGroupText>Search</InputGroupText></InputGroupAddon><InputGroupAddon align="inline-end"><InputGroupButton>Clear</InputGroupButton></InputGroupAddon></InputGroup>);
    expect(screen.getByLabelText('Search').getAttribute('data-slot')).toBe('input-group'); expect(screen.getByLabelText('Query').getAttribute('data-slot')).toBe('input-group-control');
    expect(screen.getByText('Search').getAttribute('data-slot')).toBe('input-group-text'); expect(screen.getByText('Clear').getAttribute('data-slot')).toBe('input-group-button');
  });
  it('supports textarea block addons and native events', () => {
    const changed=vi.fn(); render(<InputGroup><InputGroupTextarea aria-label="Message" onChange={changed}/><InputGroupAddon align="block-end">Footer</InputGroupAddon></InputGroup>);
    fireEvent.change(screen.getByLabelText('Message'), {target:{value:'Hello'}}); expect(changed).toHaveBeenCalledOnce(); expect(screen.getByText('Footer').getAttribute('data-align')).toBe('block-end');
  });
  it('forwards its root ref and native attributes', () => {
    const ref=React.createRef(); render(<InputGroup ref={ref} aria-label="Site" data-surface="url"><InputGroupInput defaultValue="acme" /></InputGroup>);
    expect(ref.current instanceof HTMLDivElement).toBe(true); expect(ref.current.dataset.surface).toBe('url'); expect(screen.getByDisplayValue('acme')).toBeTruthy();
  });
});
