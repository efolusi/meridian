import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Sparkline } from '../components/data/Sparkline.jsx';
import { LineChart } from '../components/data/LineChart.jsx';

// A trend that has recorded exactly one reading (a brand-new metric, or a range
// filtered down to a single sample) must still draw finite coordinates. The
// x-position divided by (data.length - 1), which is 0/0 = NaN for one point,
// leaving `NaN` in every SVG coordinate and rendering nothing.
describe('charts with a single data point', () => {
  it('Sparkline draws a finite flat line, no NaN', () => {
    const { container } = render(<Sparkline data={[42]} />);
    expect(container.innerHTML).not.toContain('NaN');
    const line = container.querySelector('polyline');
    expect(line).not.toBeNull();
    const nums = line.getAttribute('points').split(/[ ,]/).map(Number);
    expect(nums.every(Number.isFinite)).toBe(true);
    // two endpoints -> a visible span, not a zero-length point
    expect(nums.length).toBe(4);
  });

  it('Sparkline still renders the area polygon without NaN', () => {
    const { container } = render(<Sparkline data={[7]} area />);
    const poly = container.querySelector('polygon');
    expect(poly).not.toBeNull();
    expect(poly.getAttribute('points')).not.toContain('NaN');
  });

  it('LineChart draws a finite path, no NaN', () => {
    const { container } = render(<LineChart data={[{ label: 'a', value: 42 }]} showDots />);
    expect(container.innerHTML).not.toContain('NaN');
    container.querySelectorAll('path').forEach(p => {
      const nums = p.getAttribute('d').replace(/[MLZ]/g, ' ').trim().split(/[ ,]+/).map(Number);
      expect(nums.every(Number.isFinite)).toBe(true);
    });
    // the dot has to sit on the line, not at NaN
    const dot = container.querySelector('circle');
    expect(dot).not.toBeNull();
    expect(Number.isFinite(Number(dot.getAttribute('cx')))).toBe(true);
    expect(Number.isFinite(Number(dot.getAttribute('cy')))).toBe(true);
  });

  // Guard the common cases still work.
  it('Sparkline keeps working for multi-point data', () => {
    const { container } = render(<Sparkline data={[3, 5, 4, 7]} />);
    expect(container.querySelector('polyline').getAttribute('points')).not.toContain('NaN');
  });
});
