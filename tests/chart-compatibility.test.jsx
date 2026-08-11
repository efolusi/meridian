import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children, initialDimension }) => <div data-testid="responsive" data-size={`${initialDimension.width}x${initialDimension.height}`}>{children}</div>,
  Tooltip: (props) => <div data-testid="tooltip-primitive" data-active={String(props.active)} />,
  Legend: () => <div data-testid="legend-primitive" />,
}));

import { ChartContainer, ChartLegend, ChartLegendContent, ChartStyle, ChartTooltip, ChartTooltipContent, useChart } from '../components/data/Chart.jsx';

const config = { desktop: { label: 'Desktop', color: 'var(--chart-1)' }, mobile: { label: 'Mobile', theme: { light: '#123', dark: '#abc' } } };

describe('Chart compatibility contract', () => {
  it('provides config, responsive dimensions, data slots, refs, and scoped colors', () => {
    const ref = React.createRef();
    function Probe() { return <span>{useChart().config.desktop.label}</span>; }
    const { container } = render(<ChartContainer ref={ref} id="usage" config={config}><Probe /></ChartContainer>);
    expect(ref.current.dataset.slot).toBe('chart');
    expect(ref.current.dataset.chart).toBe('chart-usage');
    expect(screen.getByTestId('responsive').dataset.size).toBe('320x200');
    expect(screen.getByText('Desktop')).toBeTruthy();
    expect(container.querySelector('style').textContent).toContain('--color-mobile:#abc');
  });

  it('throws when useChart is called outside the container', () => {
    function Invalid() { useChart(); return null; }
    expect(() => render(<Invalid />)).toThrow('useChart must be used within a <ChartContainer />');
  });

  it('delegates tooltip and legend primitives to Recharts', () => {
    render(<><ChartTooltip active /><ChartLegend /></>);
    expect(screen.getByTestId('tooltip-primitive').dataset.active).toBe('true');
    expect(screen.getByTestId('legend-primitive')).toBeTruthy();
  });

  it('renders configured tooltip labels, indicators, values, and legend items', () => {
    const payload = [{ name: 'desktop', dataKey: 'desktop', value: 1286, color: '#123', payload: { fill: '#123' } }];
    render(<ChartContainer config={config}><div><ChartTooltipContent active label="desktop" payload={payload} /><ChartLegendContent payload={payload} /></div></ChartContainer>);
    expect(screen.getAllByText('Desktop').length).toBeGreaterThan(1);
    expect(screen.getByText('1,286')).toBeTruthy();
    expect(document.querySelector('.ef-chart-tooltip__indicator')).toBeTruthy();
    expect(document.querySelector('.ef-chart-legend__mark')).toBeTruthy();
  });

  it('does not emit a style node when config has no colors', () => {
    const { container } = render(<ChartStyle id="empty" config={{ value: { label: 'Value' } }} />);
    expect(container.firstChild).toBeNull();
  });
});
