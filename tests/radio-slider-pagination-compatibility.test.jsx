import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RadioGroup, RadioGroupItem } from '../components/forms/Radio.jsx';
import { Slider } from '../components/forms/Slider.jsx';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../components/navigation/Pagination.jsx';

describe('Radio Group compatibility contract', () => {
  it('composes a named native group with controlled state and refs', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const ref = React.createRef();
    function Harness() {
      const [value, setValue] = React.useState('standard');
      return <RadioGroup ref={ref} value={value} onValueChange={next => { setValue(next); change(next); }} required aria-label="Density"><RadioGroupItem value="standard" aria-label="Standard" /><RadioGroupItem value="compact" aria-label="Compact" /></RadioGroup>;
    }
    render(<Harness />);
    const items = screen.getAllByRole('radio');
    expect(ref.current?.getAttribute('data-slot')).toBe('radio-group');
    expect(items[0].name).toBeTruthy();
    expect(items[0].name).toBe(items[1].name);
    expect(items[0].required).toBe(true);
    await user.click(items[1]);
    expect(change).toHaveBeenCalledWith('compact');
    expect(items[1].checked).toBe(true);
    expect(items[1].getAttribute('data-state')).toBe('checked');
  });

  it('propagates disabled state and invalid semantics', () => {
    render(<RadioGroup disabled><RadioGroupItem value="one" aria-label="One" aria-invalid="true" /></RadioGroup>);
    const item = screen.getByRole('radio');
    expect(item.disabled).toBe(true);
    expect(item.getAttribute('aria-invalid')).toBe('true');
  });
});

describe('Slider compatibility contract', () => {
  it('supports range and multiple thumbs with canonical array callbacks', () => {
    const change = vi.fn();
    render(<Slider aria-label="Price range" defaultValue={[20, 80]} min={0} max={100} step={5} minStepsBetweenThumbs={2} onValueChange={change} />);
    const thumbs = screen.getAllByRole('slider');
    expect(thumbs).toHaveLength(2);
    expect(thumbs[0].max).toBe('70');
    fireEvent.change(thumbs[0], { target: { value: '35' } });
    expect(change).toHaveBeenCalledWith([35, 80]);
  });

  it('supports vertical orientation, disabled state, and first-thumb refs', () => {
    const ref = React.createRef();
    const { container } = render(<Slider ref={ref} orientation="vertical" defaultValue={[25, 75]} disabled aria-label="Window" />);
    expect(container.firstChild.getAttribute('data-orientation')).toBe('vertical');
    expect(ref.current).toBe(screen.getAllByRole('slider')[0]);
    expect(screen.getAllByRole('slider').every(input => input.disabled)).toBe(true);
  });
});

describe('Pagination compatibility contract', () => {
  it('renders the complete semantic composition with active state and refs', () => {
    const ref = React.createRef();
    render(<Pagination ref={ref}><PaginationContent><PaginationItem><PaginationPrevious href="/page/1" /></PaginationItem><PaginationItem><PaginationLink href="/page/2" isActive>2</PaginationLink></PaginationItem><PaginationItem><PaginationEllipsis /></PaginationItem><PaginationItem><PaginationNext href="/page/3" /></PaginationItem></PaginationContent></Pagination>);
    expect(ref.current?.tagName).toBe('NAV');
    expect(screen.getByRole('navigation').getAttribute('data-slot')).toBe('pagination');
    expect(screen.getByRole('link', { name: '2' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: 'Go to previous page' }).getAttribute('href')).toBe('/page/1');
  });

  it('preserves the legacy controlled page adapter', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(<Pagination page={2} pageCount={4} onChange={change} />);
    await user.click(screen.getByRole('link', { name: 'Go to next page' }));
    expect(change).toHaveBeenCalledWith(3);
  });
});
