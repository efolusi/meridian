import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { LineChart } from '../components/data/LineChart.jsx';
import { ChartContainer, ChartStyle } from '../components/data/Chart.jsx';

// Display-area review, 2026-11-12. Each block failed before its fix.

describe('LineChart with no data', () => {
  it('renders and survives a hover', () => {
    const { container } = render(<LineChart data={[]} />);
    const root = container.firstChild;
    root.getBoundingClientRect = () => ({ left: 0, width: 100, top: 0, height: 100 });
    expect(() => fireEvent.mouseMove(root, { clientX: 50 })).not.toThrow();
    expect(container.innerHTML).not.toContain('NaN');
  });
});

describe('ChartStyle under a strict CSP (MD62)', () => {
  const hostile = 'red;}</style><script>alert(1)</script><style>';

  it('server-rendered HTML of a ChartContainer has no style element and no style attribute', () => {
    const html = renderToString(<ChartContainer config={{ a: { color: 'red' }, b: { theme: { light: '#111', dark: '#eee' } } }}><div /></ChartContainer>);
    expect(html).toContain('data-chart=');
    expect(html).not.toMatch(/<style/i);
    expect(html).not.toMatch(/\sstyle=/i);
  });

  it('a config value cannot open markup during SSR', () => {
    const html = renderToString(<ChartContainer config={{ a: { color: hostile } }}><div /></ChartContainer>);
    expect(html).not.toMatch(/<script/i);
    expect(html).not.toMatch(/<style/i);
  });

  it('sets the colour as a custom property on the chart element, not in a style element', () => {
    const { container } = render(<ChartContainer config={{ a: { color: 'rgb(1, 2, 3)' } }}><div /></ChartContainer>);
    const chart = container.querySelector('[data-slot="chart"]');
    expect(chart.style.getPropertyValue('--color-a')).toBe('rgb(1, 2, 3)');
    const sheets = [...document.querySelectorAll('style')].map(node => node.textContent).join('');
    expect(sheets).not.toContain('--color-a');
  });

  it('sets a theme colour with light-dark(), so the page theme picks the value', () => {
    const { container } = render(<ChartContainer config={{ b: { theme: { light: '#111111', dark: '#eeeeee' } } }}><div /></ChartContainer>);
    expect(container.querySelector('[data-slot="chart"]').style.getPropertyValue('--color-b')).toBe('light-dark(#111111, #eeeeee)');
  });

  it('removes the property when the config no longer sets it', () => {
    const { container, rerender } = render(<ChartContainer config={{ a: { color: 'red' }, c: { color: 'blue' } }}><div /></ChartContainer>);
    rerender(<ChartContainer config={{ a: { color: 'green' } }}><div /></ChartContainer>);
    const chart = container.querySelector('[data-slot="chart"]');
    expect(chart.style.getPropertyValue('--color-a')).toBe('green');
    expect(chart.style.getPropertyValue('--color-c')).toBe('');
  });

  it('keeps a caller id on data-chart so ChartStyle finds its chart', () => {
    const { container } = render(<ChartContainer id="sales" config={{ a: { color: 'red' } }}><div /></ChartContainer>);
    expect(container.querySelector('[data-chart="chart-sales"]').style.getPropertyValue('--color-a')).toBe('red');
  });
});
