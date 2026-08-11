import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../components/data/Table.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/navigation/Tabs.jsx';
import { Switch } from '../components/forms/Switch.jsx';
import { Slider } from '../components/forms/Slider.jsx';
import { RadioGroup, RadioGroupItem } from '../components/forms/Radio.jsx';

describe('Table compatibility contract', () => {
  it('supports the complete semantic composition and forwards refs', () => {
    const ref = React.createRef();
    render(<Table ref={ref}><TableCaption>Runs</TableCaption><TableHeader><TableRow><TableHead>Agent</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>Inbox</TableCell></TableRow></TableBody></Table>);
    expect(ref.current.getAttribute('data-slot')).toBe('table');
    expect(ref.current.tagName).toBe('TABLE');
    expect(screen.getByRole('table')).toBeTruthy();
    expect(screen.getByText('Runs').tagName).toBe('CAPTION');
    expect(screen.getByRole('columnheader').getAttribute('data-slot')).toBe('table-head');
  });
});

describe('Tabs compatibility contract', () => {
  it('supports uncontrolled composition and keyboard activation', () => {
    render(<Tabs defaultValue="one"><TabsList><TabsTrigger value="one">One</TabsTrigger><TabsTrigger value="two">Two</TabsTrigger></TabsList><TabsContent value="one">First</TabsContent><TabsContent value="two">Second</TabsContent></Tabs>);
    expect(screen.getByText('First')).toBeTruthy();
    fireEvent.keyDown(screen.getByRole('tab', { name: 'One' }), { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Two' }).getAttribute('data-state')).toBe('active');
    expect(screen.getByText('Second')).toBeTruthy();
  });
});

describe('Switch compatibility contract', () => {
  it('reports checked state using the migration callback', () => {
    const change = vi.fn(); render(<Switch aria-label="Retry" onCheckedChange={change} />);
    fireEvent.click(screen.getByRole('switch', { name: 'Retry' }));
    expect(change).toHaveBeenCalledWith(true);
    expect(screen.getByRole('switch').getAttribute('data-state')).toBe('checked');
  });
});

describe('Slider compatibility contract', () => {
  it('accepts array values and emits arrays', () => {
    const change = vi.fn(); render(<Slider aria-label="Memory" defaultValue={[40]} onValueChange={change} />);
    fireEvent.change(screen.getByRole('slider'), { target: { value: '56' } });
    expect(change).toHaveBeenCalledWith([56]);
  });
});

describe('Radio Group compatibility contract', () => {
  it('owns selection and exposes item states', () => {
    const change = vi.fn(); render(<RadioGroup defaultValue="one" onValueChange={change} aria-label="Plan"><RadioGroupItem value="one" aria-label="One" /><RadioGroupItem value="two" aria-label="Two" /></RadioGroup>);
    fireEvent.click(screen.getByRole('radio', { name: 'Two' }));
    expect(change).toHaveBeenCalledWith('two');
    expect(screen.getByRole('radio', { name: 'Two' }).checked).toBe(true);
  });
});
