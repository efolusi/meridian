import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { LineChart } from '../components/data/LineChart.jsx';
import { ChartStyle } from '../components/data/Chart.jsx';

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

describe('ChartStyle', () => {
  it('cannot close its <style> element from a config value during SSR', () => {
    const html = renderToString(<ChartStyle id="x" config={{ a: { color: 'red;}</style><script>alert(1)</script><style>' } }} />);
    expect(html).not.toMatch(/<script/i);
    expect(html.match(/<\/style>/gi)).toHaveLength(1);
  });
});

