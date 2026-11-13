import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { LineChart } from '../components/data/LineChart.jsx';
import { BarChart } from '../components/data/BarChart.jsx';
import { DonutChart } from '../components/data/DonutChart.jsx';
import { UsageMeter } from '../components/ai/UsageMeter.jsx';
import { ChartContainer, ChartTooltipContent } from '../components/data/Chart.jsx';

const line = [{ label: 'Mon', value: 1200 }, { label: 'Tue', value: 3400.5 }];
const bars = [{ label: 'Q1', value: 1500 }, { label: 'Q2', value: 2500 }];
const donut = [{ label: 'Cards', value: 3 }, { label: 'Transfers', value: 1 }];

// Charts had no text alternative: LineChart's svg had no role or name, the
// donut detail and line tooltip were hover-only, and BarChart relied on title.
describe('charts expose a name and their values without a mouse', () => {
  it.each([
    ['LineChart', <LineChart data={line} />, /2 points/],
    ['BarChart', <BarChart data={bars} />, /2 bars/],
    ['DonutChart', <DonutChart data={donut} />, /Cards 75%/],
  ])('%s has role=img with a default summary', (_, el, re) => {
    render(el);
    expect(screen.getByRole('img').getAttribute('aria-label')).toMatch(re);
  });
  it('aria-label overrides the default summary', () => {
    render(<LineChart data={line} aria-label="Weekly signups" />);
    expect(screen.getByRole('img', { name: 'Weekly signups' })).toBeTruthy();
  });
  it.each([
    ['LineChart', <LineChart data={line} />, ['Mon', '1,200']],
    ['BarChart', <BarChart data={bars} />, ['Q2', '2,500']],
    ['DonutChart', <DonutChart data={donut} />, ['Transfers', '1', '25%']],
  ])('%s carries a data table for assistive tech', (_, el, cells) => {
    render(el);
    const table = screen.getByRole('table');
    cells.forEach(c => expect(within(table).getByText(c)).toBeTruthy());
  });
});

describe('locale', () => {
  afterEach(() => vi.restoreAllMocks());
  it('formats with the given locale', () => {
    render(<><LineChart data={line} locale="id" /><BarChart data={bars} locale="id" /><UsageMeter used={1500} limit={2000} locale="id" /></>);
    expect(screen.getAllByText('1.200').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2.500').length).toBeGreaterThan(0);
    expect(screen.getByText(/1\.500 \/ 2\.000/)).toBeTruthy();
  });
  it('never formats with the runtime default locale (hydration safe)', () => {
    const spy = vi.spyOn(Number.prototype, 'toLocaleString');
    renderToString(<><LineChart data={line} /><BarChart data={bars} /><DonutChart data={donut} /><UsageMeter used={5} limit={10} /></>);
    expect(spy.mock.calls.filter(c => c[0] === undefined)).toHaveLength(0);
  });
  it('ChartTooltipContent takes a locale', () => {
    render(<ChartContainer config={{ a: { label: 'A' } }}><ChartTooltipContent active locale="id" payload={[{ name: 'a', dataKey: 'a', value: 1234, color: '#000' }]} /></ChartContainer>);
    expect(screen.getByText('1.234')).toBeTruthy();
  });
});
