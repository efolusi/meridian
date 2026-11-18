import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { DonutChart } from '../components/data/DonutChart.jsx';
import { BarChart } from '../components/data/BarChart.jsx';
import { FileDrop } from '../components/files/FileDrop.jsx';

const css = id => document.getElementById(id).textContent;

describe('DonutChart', () => {
  it('reads segment colours from the --chart-N tokens, in order', () => {
    const { container } = render(<DonutChart data={[1, 2, 3, 4, 5].map(v => ({ label: 'S' + v, value: v }))} />);
    const strokes = [...container.querySelectorAll('circle')].map(c => c.getAttribute('stroke'));
    strokes.forEach((s, i) => expect(s).toBe(`var(--chart-${i + 1})`));
  });
  it.each([140, 280])('leaves a 2px surface gap between segments at size %i', size => {
    const { container } = render(<DonutChart size={size} thickness={16} data={[{ label: 'a', value: 1 }, { label: 'b', value: 1 }]} />);
    const c = container.querySelector('circle');
    const R = Number(c.getAttribute('r'));
    const dash = Number(c.getAttribute('stroke-dasharray').split(' ')[0]);
    const gapUnits = Math.PI * R - dash; // half the circle minus the drawn part
    expect(gapUnits * size / 100).toBeCloseTo(2, 1);
  });
});

describe('BarChart resting bars', () => {
  it('use a fill that clears 3:1 on card in both themes (--text-muted)', () => {
    render(<BarChart data={[1, 2]} />);
    expect(css('ef-css-bars')).toMatch(/\.ef-bars__bar\{[^}]*background:var\(--text-muted\)/);
  });
});

describe('FileDrop edges', () => {
  it('border uses --border-control and the icon --text-muted', () => {
    render(<FileDrop />);
    const s = css('ef-css-filedrop');
    expect(s).toMatch(/\.ef-filedrop\{[^}]*border:1px dashed var\(--border-control/);
    expect(s).toMatch(/\.ef-filedrop__icon\{color:var\(--text-muted\)\}/);
  });
});
