import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TreeList } from '../components/display/TreeList.jsx';
import { Suggestions } from '../components/ai/Suggestions.jsx';
import { WebPreview } from '../components/ai/WebPreview.jsx';
import { ModelSelector } from '../components/ai/ModelSelector.jsx';
import { BarChart } from '../components/data/BarChart.jsx';
import { Tooltip } from '../components/feedback/Tooltip.jsx';

// The 1.x vocabulary normalization: every renamed prop keeps its old name as a
// deprecated alias for one major (guidelines/governance.md), and the canonical
// name wins when both are passed. House rule under test: state-carrying
// selection fires onChange, command menus fire onSelect, placement is `side`.

const NODES = [
  { id: 'agents', label: 'Agents', children: [{ id: 'runs', label: 'Runs' }] },
  { id: 'billing', label: 'Billing' },
];

describe('TreeList onSelect -> onChange', () => {
  it('fires onChange (canonical) with the row id and node', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TreeList nodes={NODES} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Billing' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('billing', NODES[1]);
  });
  it('still fires the deprecated onSelect alias', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<TreeList nodes={NODES} onSelect={onSelect} />);
    await user.click(screen.getByRole('button', { name: 'Billing' }));
    expect(onSelect).toHaveBeenCalledWith('billing', NODES[1]);
  });
  it('lets onChange win when both are passed', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onSelect = vi.fn();
    render(<TreeList nodes={NODES} onChange={onChange} onSelect={onSelect} />);
    await user.click(screen.getByRole('button', { name: 'Billing' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe('Suggestions onPick -> onSelect', () => {
  it('fires onSelect (canonical) with the label and index', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Suggestions items={['Draft a reply', 'Summarize']} onSelect={onSelect} />);
    await user.click(screen.getByRole('button', { name: 'Summarize' }));
    expect(onSelect).toHaveBeenCalledWith('Summarize', 1);
  });
  it('still fires the deprecated onPick alias, and onSelect wins when both are passed', async () => {
    const user = userEvent.setup();
    const onPick = vi.fn();
    const { unmount } = render(<Suggestions items={['Draft a reply']} onPick={onPick} />);
    await user.click(screen.getByRole('button', { name: 'Draft a reply' }));
    expect(onPick).toHaveBeenCalledWith('Draft a reply', 0);
    unmount();
    const onSelect = vi.fn();
    const both = vi.fn();
    render(<Suggestions items={['Draft a reply']} onSelect={onSelect} onPick={both} />);
    await user.click(screen.getByRole('button', { name: 'Draft a reply' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(both).not.toHaveBeenCalled();
  });
});

describe('WebPreview controlled url + defaultConsoleOpen -> defaultOpen', () => {
  it('adopts a changed url prop (parent-driven navigation)', () => {
    const { rerender } = render(<WebPreview url="https://one.example" />);
    const addr = screen.getByPlaceholderText('Enter a URL to preview');
    expect(addr.value).toBe('https://one.example');
    expect(screen.getByTitle('Web preview').getAttribute('src')).toBe('https://one.example');
    rerender(<WebPreview url="https://two.example" />);
    expect(addr.value).toBe('https://two.example');
    expect(screen.getByTitle('Web preview').getAttribute('src')).toBe('https://two.example');
  });
  it('opens the console via defaultOpen (canonical) or the deprecated alias, canonical winning', () => {
    const { unmount } = render(<WebPreview data-testid="wp" defaultOpen />);
    expect(screen.getByTestId('wp').className).toContain('ef-webprev--console');
    unmount();
    const { unmount: u2 } = render(<WebPreview data-testid="wp2" defaultConsoleOpen />);
    expect(screen.getByTestId('wp2').className).toContain('ef-webprev--console');
    u2();
    render(<WebPreview data-testid="wp3" defaultOpen={false} defaultConsoleOpen />);
    expect(screen.getByTestId('wp3').className).not.toContain('ef-webprev--console');
  });
});

describe('BarChart formatValue -> format', () => {
  it('formats hover titles via format (canonical)', () => {
    const { container } = render(<BarChart data={[5]} format={v => v + ' runs'} />);
    expect(container.querySelector('.ef-bars__bar').getAttribute('title')).toBe('5 runs');
  });
  it('still honours the deprecated formatValue alias, and format wins when both are passed', () => {
    const { container, unmount } = render(<BarChart data={[5]} formatValue={v => v + ' old'} />);
    expect(container.querySelector('.ef-bars__bar').getAttribute('title')).toBe('5 old');
    unmount();
    const { container: c2 } = render(<BarChart data={[5]} format={v => v + ' new'} formatValue={v => v + ' old'} />);
    expect(c2.querySelector('.ef-bars__bar').getAttribute('title')).toBe('5 new');
  });
});

describe('Tooltip position -> side', () => {
  it('accepts side (canonical), including the new left/right placements', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Tooltip label="Tip" side="right"><button>Go</button></Tooltip>);
    await user.tab();
    expect((await screen.findByRole('tooltip')).className).toContain('ef-tooltip__bubble--right');
    rerender(<Tooltip label="Tip" side="left"><button>Go</button></Tooltip>);
    expect(screen.getByRole('tooltip').className).toContain('ef-tooltip__bubble--left');
    rerender(<Tooltip label="Tip" side="bottom"><button>Go</button></Tooltip>);
    expect(screen.getByRole('tooltip').className).toContain('ef-tooltip__bubble--bottom');
  });
  it('still honours the deprecated position alias, and side wins when both are passed', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Tooltip label="Tip" position="bottom"><button>Go</button></Tooltip>);
    await user.tab();
    expect((await screen.findByRole('tooltip')).className).toContain('ef-tooltip__bubble--bottom');
    rerender(<Tooltip label="Tip" side="top" position="bottom"><button>Go</button></Tooltip>);
    expect(screen.getByRole('tooltip').className).not.toContain('ef-tooltip__bubble--bottom');
  });
});

describe("ModelSelector side 'up'/'down' -> 'top'/'bottom'", () => {
  it("treats 'bottom' as canonical for the deprecated 'down', and defaults to 'top'", () => {
    const models = [{ id: 'm1', name: 'One' }];
    const { rerender } = render(<ModelSelector data-testid="ms" models={models} side="bottom" />);
    expect(screen.getByTestId('ms').className).toContain('ef-modelsel--down');
    rerender(<ModelSelector data-testid="ms" models={models} side="down" />);
    expect(screen.getByTestId('ms').className).toContain('ef-modelsel--down');
    rerender(<ModelSelector data-testid="ms" models={models} side="up" />);
    expect(screen.getByTestId('ms').className).not.toContain('ef-modelsel--down');
    rerender(<ModelSelector data-testid="ms" models={models} />);
    expect(screen.getByTestId('ms').className).not.toContain('ef-modelsel--down');
  });
});
