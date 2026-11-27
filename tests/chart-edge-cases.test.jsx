import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { createRoot } from 'react-dom/client';
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

  it('server-rendered HTML of a ChartContainer has no style element and no style attribute on the chart', () => {
    const html = renderToString(<ChartContainer config={{ a: { color: 'red' }, b: { theme: { light: '#111', dark: '#eee' } } }}><div /></ChartContainer>);
    expect(html).toContain('data-chart=');
    expect(html).not.toMatch(/<style/i);
    // The chart element is Meridian's; the Recharts wrapper inside it sets its own size.
    expect(html.match(/<div data-slot="chart"[^>]*>/)[0]).not.toMatch(/\sstyle=/i);
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

  it('a hostile config value sets no extra property on the client', () => {
    const { container } = render(<ChartContainer config={{ a: { color: hostile } }}><div /></ChartContainer>);
    const chart = container.querySelector('[data-slot="chart"]');
    expect(chart.style.getPropertyValue('--evil')).toBe('');
    // The value is one inert custom-property value: no second declaration came out of the `;`.
    expect(chart.style.length).toBe(1);
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('style')).toBeNull();
  });

  it('sets the colour when the chart renders inside a shadow root', () => {
    const host = document.body.appendChild(document.createElement('div'));
    const shadow = host.attachShadow({ mode: 'open' });
    const mount = shadow.appendChild(document.createElement('div'));
    const root = createRoot(mount);
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    act(() => root.render(<ChartContainer config={{ a: { color: 'rgb(4, 5, 6)' } }}><div /></ChartContainer>));
    expect(mount.querySelector('[data-slot="chart"]').style.getPropertyValue('--color-a')).toBe('rgb(4, 5, 6)');
    act(() => root.unmount());
    host.remove();
  });
});

describe('a standalone ChartStyle (MD62)', () => {
  it('writes its colours on the element with its data-chart id', () => {
    const { container } = render(<><div data-chart="solo" /><ChartStyle id="solo" config={{ a: { color: 'red' } }} /></>);
    expect(container.querySelector('[data-chart="solo"]').style.getPropertyValue('--color-a')).toBe('red');
  });

  it('removes its colours on unmount', () => {
    const { container, unmount } = render(<><div data-chart="solo" /><ChartStyle id="solo" config={{ a: { color: 'red' } }} /></>);
    const target = container.querySelector('[data-chart="solo"]');
    unmount();
    expect(target.style.getPropertyValue('--color-a')).toBe('');
  });

  it('moves its colours when the id changes', () => {
    const { container, rerender } = render(<><div data-chart="one" /><div data-chart="two" /><ChartStyle id="one" config={{ a: { color: 'red' } }} /></>);
    rerender(<><div data-chart="one" /><div data-chart="two" /><ChartStyle id="two" config={{ a: { color: 'red' } }} /></>);
    expect(container.querySelector('[data-chart="one"]').style.getPropertyValue('--color-a')).toBe('');
    expect(container.querySelector('[data-chart="two"]').style.getPropertyValue('--color-a')).toBe('red');
  });
});
