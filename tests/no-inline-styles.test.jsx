import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { PaymentCard } from '../components/finance/PaymentCard.jsx';
import { DonutChart } from '../components/data/DonutChart.jsx';
import { SideNav } from '../components/navigation/SideNav.jsx';
import { Progress } from '../components/feedback/Progress.jsx';
import { Icon } from '../components/icons/Icon.jsx';
import { Citation } from '../components/ai/Citation.jsx';
import { WebPreview } from '../components/ai/WebPreview.jsx';
import { BarChart } from '../components/data/BarChart.jsx';
import { Table } from '../components/data/Table.jsx';
import { TreeList } from '../components/display/TreeList.jsx';
import { CodeBlock } from '../components/code/CodeBlock.jsx';
import { Console } from '../components/code/Console.jsx';
import { ScrollArea } from '../components/display/ScrollArea.jsx';
import { AspectRatio } from '../components/display/AspectRatio.jsx';
import { Conversation } from '../components/ai/Conversation.jsx';
import { Player } from '../components/ai/Player.jsx';
import { PromptComposer } from '../components/ai/PromptComposer.jsx';
import { PromptSteps } from '../components/ai/PromptSteps.jsx';
import { ChatMessage } from '../components/ai/ChatMessage.jsx';
import { Diff } from '../components/code/Diff.jsx';
import { Terminal } from '../components/code/Terminal.jsx';
import { KeyValueList } from '../components/data/KeyValueList.jsx';
import { LineChart } from '../components/data/LineChart.jsx';
import { Loader } from '../components/feedback/Loader.jsx';
import { FileTypeIcon } from '../components/files/FileTypeIcon.jsx';
import { AgentRun } from '../components/ai/AgentRun.jsx';
import { DocumentCard } from '../components/ai/DocumentCard.jsx';
import { Transcript } from '../components/ai/Transcript.jsx';
import { UsageMeter } from '../components/ai/UsageMeter.jsx';
import { FileDrop } from '../components/files/FileDrop.jsx';
import { Button } from '../components/forms/Button.jsx';
import { ButtonTileGroup } from '../components/forms/ButtonTile.jsx';
import { ToggleGroup } from '../components/forms/Toggle.jsx';
import { Reveal } from '../components/marketing/Reveal.jsx';
import { PaginationEllipsis } from '../components/navigation/Pagination.jsx';
import { SidebarMenuSkeleton } from '../components/navigation/Sidebar.jsx';
import { Dialog, DialogContent, DialogTitle } from '../components/feedback/Dialog.jsx';
import { Sheet, SheetContent, SheetTitle } from '../components/overlay/Sheet.jsx';
import { Popover, PopoverContent, PopoverTrigger } from '../components/overlay/Popover.jsx';
import { Slider } from '../components/forms/Slider.jsx';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../components/display/Resizable.jsx';
import { SelectionQuote } from '../components/ai/SelectionQuote.jsx';

// MD18 (#180): strict-CSP sites (style-src without 'unsafe-inline') drop style attributes,
// so components put fixed styles in their CSS and set runtime values through the CSSOM.
// A style prop the caller passes is the caller's choice and is allowed through.

// Files not fixed yet, with their count of style attributes. It only shrinks; #180
// closes when it is empty, and it is empty now. A new file with a style attribute fails the
// first test below.
const REMAINING = {};

describe('no style attributes in server-rendered HTML', () => {
  const cases = {
    PaymentCard: <PaymentCard name="ADA OBI" number="•••• 4412" expiry="09/29" />,
    'PaymentCard frozen': <PaymentCard name="ADA OBI" number="•••• 4412" expiry="09/29" frozen />,
    DonutChart: <DonutChart data={[{ label: 'A', value: 3 }, { label: 'B', value: 1 }]} centerLabel="Total" />,
    SideNav: <SideNav brand="Komando" brandBadge="Beta" logoSrc="/logo.svg" groups={[{ label: 'Main', items: [{ id: 'a', label: 'Hosts', icon: 'server', badge: 2 }] }]} value="a" />,
    'SideNav foot': <SideNav groups={[{ items: [{ id: 'a', label: 'Hosts', icon: 'server' }] }]} value="a" account={{ name: 'Ada Obi', email: 'ada@example.com' }} onSignOut={() => {}} />,
    'SideNav collapsed': <SideNav collapsed groups={[{ items: [{ id: 'a', label: 'Hosts', icon: 'server' }] }]} value="a" account={{ email: 'ada@example.com' }} onSignOut={() => {}} />,
    Progress: <Progress value={40} />,
    Icon: <Icon name="check" size={20} />,
    Citation: <Citation index={1} href="https://efolusi.com" title="Efolusi" description="Home" />,
    WebPreview: <WebPreview url="https://efolusi.com" height={240} width={360} logs={[]} />,
    BarChart: <BarChart data={[3, 5, 2]} labels={['a', 'b', 'c']} height={120} />,
    Table: <Table columns={[{ key: 'n', label: 'Name', width: 120 }, { key: 'v', label: 'Value', align: 'end', numeric: true }]} rows={[{ n: 'a', v: 1 }]} maxHeight={200} />,
    'Table loading': <Table columns={[{ key: 'n', label: 'Name' }, { key: 'v', label: 'Value' }]} rows={[]} loading />,
    TreeList: <TreeList nodes={[{ id: 'a', label: 'Root', children: [{ id: 'b', label: 'Leaf' }] }]} defaultOpen={['a']} />,
    CodeBlock: <CodeBlock code={'line\n'.repeat(30)} lang="txt" />,
    'CodeBlock maxHeight': <CodeBlock code="x" lang="txt" maxHeight={120} />,
    Console: <Console entries={[{ level: 'info', text: 'Ready' }]} height={160} />,
    ScrollArea: <ScrollArea maxHeight={120}>text</ScrollArea>,
    AspectRatio: <AspectRatio ratio={16 / 9}>media</AspectRatio>,
    Conversation: <Conversation><p>hi</p></Conversation>,
    Player: <Player src="x.mp3" title="T" />,
    PromptComposer: <PromptComposer attachments={<span>file</span>} />,
    PromptSteps: <PromptSteps steps={[{ question: 'Q', options: ['A', 'B'], other: true }]} />,
    ChatMessage: <ChatMessage name="Ada">hi</ChatMessage>,
    Diff: <Diff title="a" from={'a\nb'} to={'a\nc'} maxHeight={200} />,
    Terminal: <Terminal lines={['ok']} />,
    KeyValueList: <KeyValueList items={[{ label: 'A', value: '1' }]} />,
    LineChart: <LineChart data={[{ label: 'a', value: 1 }, { label: 'b', value: 3 }]} />,
    Loader: <Loader duration={2} />,
    FileTypeIcon: <FileTypeIcon ext="pdf" />,
    'AgentRun pending step': <AgentRun steps={[{ title: 'Plan', status: 'pending' }, { title: 'Run', status: 'active' }]} />,
    DocumentCard: <DocumentCard title="Doc" collapsedHeight={120}>text</DocumentCard>,
    Transcript: <Transcript items={[{ start: 0, text: 'hi' }]} height={200} />,
    UsageMeter: <UsageMeter used={30} limit={100} />,
    'UsageMeter animated': <UsageMeter used={30} limit={100} animated />,
    FileDrop: <FileDrop />,
    'Button fullWidth': <Button fullWidth>Save</Button>,
    ButtonTileGroup: <ButtonTileGroup columns={2}>x</ButtonTileGroup>,
    ToggleGroup: <ToggleGroup spacing={3}>x</ToggleGroup>,
    Reveal: <Reveal>x</Reveal>,
    PaginationEllipsis: <PaginationEllipsis />,
    'SidebarMenuSkeleton showIcon': <SidebarMenuSkeleton showIcon />,
    SidebarMenuSkeleton: <SidebarMenuSkeleton />,
    Slider: <Slider defaultValue={[20, 70]} aria-label="Range" />,
    'Slider vertical': <Slider defaultValue={[30]} orientation="vertical" aria-label="Level" />,
    ResizablePanelGroup: <ResizablePanelGroup><ResizablePanel defaultSize={30}>a</ResizablePanel><ResizableHandle /><ResizablePanel>b</ResizablePanel></ResizablePanelGroup>,
    SelectionQuote: <SelectionQuote actions={[{ id: 'q', label: 'Quote' }]}>text</SelectionQuote>,
  };
  it.each(Object.keys(cases))('%s', (name) => {
    expect(renderToString(cases[name])).not.toMatch(/\sstyle="/);
  });
});

describe('style attributes in component sources', () => {
  const files = readdirSync('components').flatMap((group) => {
    try { return readdirSync(`components/${group}`).filter((f) => f.endsWith('.jsx')).map((f) => `${group}/${f}`); } catch { return []; }
  });
  const count = (file) => (readFileSync(`components/${file}`, 'utf8').match(/\bstyle=\{(?!style\})/g) || []).length;

  it('appear only in the files still listed, and never more often', () => {
    const over = files.map((f) => [f, count(f), REMAINING[f] || 0]).filter(([, n, max]) => n > max);
    expect(over).toEqual([]);
  });

  it('lists no file that is already clean or has fewer left (shrink the list)', () => {
    const stale = Object.entries(REMAINING).filter(([f, max]) => count(f) < max);
    expect(stale).toEqual([]);
  });
});

describe('BarChart sizes its bars through the CSSOM', () => {
  const data = [{ label: 'a', value: 1 }, { label: 'b', value: 3 }, { label: 'c', value: 7 }];

  it('server HTML has no style attribute, and hydration reports no mismatch', async () => {
    const { hydrateRoot } = await import('react-dom/client');
    const { act } = await import('react');
    const html = renderToString(<BarChart data={data} />);
    expect(html).not.toMatch(/\sstyle="/);
    const host = document.createElement('div');
    host.innerHTML = html;
    document.body.appendChild(host);
    const errors = [];
    await act(async () => { hydrateRoot(host, <BarChart data={data} />, { onRecoverableError: (e) => errors.push(e) }); });
    expect(errors).toEqual([]);
    host.remove();
  });

  it('sets the chart height and each bar height after mount, rounded so values that do not divide evenly survive', async () => {
    const { render } = await import('@testing-library/react');
    const { container, unmount } = render(<BarChart data={data} height={80} />);
    expect(container.querySelector('.ef-bars').style.height).toBe('80px');
    const heights = [...container.querySelectorAll('.ef-bars__bar')].map((b) => b.style.height);
    expect(heights).toEqual(['14.286%', '42.857%', '100%']);
    unmount();
  });
});

describe('Player sizes its bars through the CSSOM', () => {
  // The old hydration tests guarded the sixteen-digit peak precision: pseudoPeaks makes
  // irrational-looking floats, and each bar must carry a short percentage, not all of them.
  const rounded = (p) => `${Math.round(Math.max(8, p * 100) * 1000) / 1000}%`;
  const heights = (container) => [...container.querySelectorAll('.ef-player__bar')].map((b) => b.style.height);

  async function hydrate(element) {
    const { hydrateRoot } = await import('react-dom/client');
    const { act } = await import('react');
    const host = document.createElement('div');
    host.innerHTML = renderToString(element);
    expect(host.innerHTML).not.toMatch(/\sstyle="/);
    document.body.appendChild(host);
    const errors = [];
    await act(async () => { hydrateRoot(host, element, { onRecoverableError: (e) => errors.push(e) }); });
    return { host, errors };
  }

  it('generated peaks: every bar gets a short percentage, and hydration reports no mismatch', async () => {
    const { host, errors } = await hydrate(<Player src="some-track.mp3" title="T" />);
    expect(errors).toEqual([]);
    const values = heights(host);
    expect(values).toHaveLength(72);
    for (const v of values) {
      expect(v).toMatch(/^\d+(\.\d{1,3})?%$/);
      expect(parseFloat(v)).toBeGreaterThanOrEqual(8);
      expect(parseFloat(v)).toBeLessThanOrEqual(100);
    }
    host.remove();
  });

  it('caller-supplied peaks: each bar height equals its peak, rounded to three decimals', async () => {
    const peaks = Array.from({ length: 12 }, (_, i) => (i + 1) / 7);
    const { host, errors } = await hydrate(<Player src="x" peaks={peaks} />);
    expect(errors).toEqual([]);
    expect(heights(host)).toEqual(peaks.map(rounded));
    host.remove();
  });

  it('peaks [0.2, 0.9] give 20% and 90%, and a peak under 8% is raised to 8%', async () => {
    const { render } = await import('@testing-library/react');
    const a = render(<Player src="x" peaks={[0.2, 0.9]} />);
    expect(heights(a.container)).toEqual(['20%', '90%']);
    a.unmount();
    const b = render(<Player src="x" peaks={[0.01, 1]} />);
    expect(heights(b.container)).toEqual(['8%', '100%']);
    b.unmount();
  });
});

describe('batch 4 sets runtime values through the CSSOM', () => {
  it('Button fullWidth is a class, and a caller width still wins', async () => {
    const { render } = await import('@testing-library/react');
    const a = render(<Button fullWidth>Save</Button>);
    expect(a.container.querySelector('button').className).toContain('ef-btn--full');
    expect(a.container.querySelector('button').style.width).toBe('');
    a.unmount();
    const b = render(<Button fullWidth style={{ width: 120 }}>Save</Button>);
    expect(b.container.querySelector('button').style.width).toBe('120px');
    b.unmount();
  });

  it('ButtonTileGroup writes its column count as a custom property', async () => {
    const { render } = await import('@testing-library/react');
    const { container, unmount } = render(<ButtonTileGroup columns={4}>x</ButtonTileGroup>);
    expect(container.querySelector('.ef-tilegroup').style.getPropertyValue('--ef-tile-columns')).toBe('4');
    unmount();
  });

  it('ToggleGroup writes its gap as a custom property', async () => {
    const { render } = await import('@testing-library/react');
    const { container, unmount } = render(<ToggleGroup spacing={3}>x</ToggleGroup>);
    expect(container.querySelector('.ef-toggle-group').style.getPropertyValue('--ef-toggle-gap')).toBe('12px');
    unmount();
  });

  it('Transcript and DocumentCard set their heights after mount', async () => {
    const { render } = await import('@testing-library/react');
    const t = render(<Transcript items={[{ start: 5, text: 'hi' }]} height={200} />);
    expect(t.container.querySelector('.ef-transcript__scroll').style.getPropertyValue('--ef-transcript-h')).toBe('200px');
    t.unmount();
    // jsdom measures nothing, so give the card a 500px body and a ResizeObserver to watch it.
    const { vi } = await import('vitest');
    vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
    const height = vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(500);
    const d = render(<DocumentCard title="Doc" collapsedHeight={120}>text</DocumentCard>);
    expect(d.container.querySelector('.ef-doccard__win').style.getPropertyValue('--ef-doccard-h')).toBe('120px');
    d.unmount();
    height.mockRestore();
    vi.unstubAllGlobals();
  });

  it('ToggleGroup: a caller --ef-toggle-gap wins over the spacing prop', async () => {
    const { render } = await import('@testing-library/react');
    const { container, unmount } = render(<ToggleGroup spacing={3} style={{ '--ef-toggle-gap': '2px' }}>x</ToggleGroup>);
    expect(container.querySelector('.ef-toggle-group').style.getPropertyValue('--ef-toggle-gap')).toBe('2px');
    unmount();
  });

  it('first paint: the Transcript default height and the DocumentCard collapsed height are in the CSS, not only set after mount', () => {
    const transcript = readFileSync('components/ai/Transcript.jsx', 'utf8');
    expect(transcript).toMatch(/\.ef-transcript__scroll\{[^}]*height:var\(--ef-transcript-h,280px\)/);
    const card = readFileSync('components/ai/DocumentCard.jsx', 'utf8');
    expect(card).toMatch(/\.ef-doccard__win\{[^}]*height:var\(--ef-doccard-h,200px\)/);
    const html = renderToString(<Transcript items={[{ start: 5, text: 'hi' }]} />);
    expect(html).toContain('ef-transcript__scroll');
    expect(html).not.toMatch(/\sstyle="/);
  });

  it('Button: .ef-btn--full comes after the touch block, so fullWidth wins over the icon sizes on touch', () => {
    const src = readFileSync('components/forms/Button.jsx', 'utf8');
    expect(src.indexOf('.ef-btn--full{')).toBeGreaterThan(src.indexOf('@media (pointer:coarse)'));
  });

  it('UsageMeter sets the fill width after mount, rounded to three decimals', async () => {
    const { render } = await import('@testing-library/react');
    const { container, unmount } = render(<UsageMeter used={1} limit={3} />);
    expect(container.querySelector('.ef-usage__fill').style.width).toBe('33.333%');
    unmount();
  });

  it('SidebarMenuSkeleton takes its width from a class, and a caller width wins', async () => {
    const { render } = await import('@testing-library/react');
    const a = render(<SidebarMenuSkeleton showIcon />);
    expect(a.container.querySelector('.ef-sidebar-skeleton').className).toContain('ef-sidebar-skeleton--icon');
    expect(a.container.querySelector('.ef-sidebar-skeleton').style.width).toBe('');
    a.unmount();
    const b = render(<SidebarMenuSkeleton style={{ width: '50%' }} />);
    expect(b.container.querySelector('.ef-sidebar-skeleton').style.width).toBe('50%');
    b.unmount();
  });

  it('Reveal delays later siblings through the CSSOM', async () => {
    const { render } = await import('@testing-library/react');
    const { container, unmount } = render(<div><Reveal>a</Reveal><Reveal>b</Reveal></div>);
    const nodes = container.querySelectorAll('[data-slot="reveal"]');
    expect(nodes[1].style.transitionDelay).toBe('70ms');
    unmount();
  });
});

describe('batch 5 overlays: fixed styles in CSS, placement through the CSSOM', () => {
  it('Dialog takes position from CSS and sets max-width from width; a caller maxWidth wins', async () => {
    const { render } = await import('@testing-library/react');
    const a = render(<Dialog open><DialogContent width={600}><DialogTitle>T</DialogTitle></DialogContent></Dialog>);
    const panel = document.querySelector('[data-slot="dialog-content"]');
    expect(panel.style.position).toBe('');
    expect(panel.style.maxWidth).toBe('600px');
    a.unmount();
    const b = render(<Dialog open><DialogContent width={600} style={{ maxWidth: 320 }}><DialogTitle>T</DialogTitle></DialogContent></Dialog>);
    expect(document.querySelector('[data-slot="dialog-content"]').style.maxWidth).toBe('320px');
    b.unmount();
  });

  it('Sheet takes position: fixed from its class, not from a style attribute', async () => {
    const { render } = await import('@testing-library/react');
    const { unmount } = render(<Sheet open><SheetContent><SheetTitle>T</SheetTitle></SheetContent></Sheet>);
    const panel = document.querySelector('[data-slot="sheet-content"]');
    expect(panel.style.position).toBe('');
    expect(panel.className).toContain('ef-sheet');
    unmount();
  });

  it('Popover is placed through the CSSOM: fixed, with a width from the prop, and a caller style wins', async () => {
    const { render, screen } = await import('@testing-library/react');
    const userEvent = (await import('@testing-library/user-event')).default;
    const { unmount } = render(<Popover><PopoverTrigger>Open</PopoverTrigger><PopoverContent width={280} style={{ top: 5 }}>x</PopoverContent></Popover>);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    const panel = document.querySelector('[data-slot="popover-content"]');
    expect(panel.style.position).toBe('fixed');
    expect(panel.style.width).toBe('280px');
    expect(panel.style.top).toBe('5px');
    unmount();
  });
});

describe('batch 6 sets the last runtime values through the CSSOM', () => {
  it('Slider sizes its range after mount, for both orientations', async () => {
    const { render } = await import('@testing-library/react');
    const h = render(<Slider defaultValue={[20, 70]} aria-label="Range" />);
    const range = h.container.querySelector('.ef-slider__range');
    expect(range.style.width).toBe('50%');
    expect(range.style.getPropertyValue('inset-inline-start')).toBe('20%');
    h.unmount();
    const v = render(<Slider defaultValue={[30]} orientation="vertical" aria-label="Level" />);
    const vr = v.container.querySelector('.ef-slider__range');
    expect(vr.style.height).toBe('30%');
    expect(vr.style.bottom).toBe('0%');
    v.unmount();
  });

  it('ResizablePanel gets its flex-basis after mount and its no-grow, no-shrink from the class', async () => {
    const { render } = await import('@testing-library/react');
    const { container, unmount } = render(<ResizablePanelGroup><ResizablePanel defaultSize={100 / 3}>a</ResizablePanel><ResizableHandle /><ResizablePanel>b</ResizablePanel></ResizablePanelGroup>);
    const panes = container.querySelectorAll('[data-slot="resizable-panel"]');
    expect(panes[0].style.flexBasis).toBe('33.333%');
    expect(panes[0].style.flexGrow).toBe('');
    expect(panes[0].style.flexShrink).toBe('');
    unmount();
  });

  it('Resizable hydrates without a mismatch and writes a short percentage', async () => {
    const { hydrateRoot } = await import('react-dom/client');
    const { act } = await import('react');
    const tree = <ResizablePanelGroup><ResizablePanel defaultSize={100 / 3}><div>left</div></ResizablePanel><ResizableHandle /><ResizablePanel><div>right</div></ResizablePanel></ResizablePanelGroup>;
    const html = renderToString(tree);
    expect(html).not.toMatch(/\sstyle="/);
    const host = document.createElement('div');
    host.innerHTML = html;
    document.body.appendChild(host);
    const errors = [];
    await act(async () => { hydrateRoot(host, tree, { onRecoverableError: (e) => errors.push(e) }); });
    expect(errors).toEqual([]);
    expect(host.querySelector('[data-slot="resizable-panel"]').style.flexBasis).toBe('33.333%');
    host.remove();
  });
});

describe('review of batch 6: first paint, rerender and behaviour', () => {
  it('Resizable: before hydration a pane has an equal-split fallback, and data-sized swaps it for the written flex-basis', async () => {
    const src = readFileSync('components/display/Resizable.jsx', 'utf8');
    expect(src).toMatch(/\.ef-resizable__pane\{[^}]*flex:1 1 0/);
    expect(src).toMatch(/\.ef-resizable__pane\[data-sized\]\{[^}]*flex-grow:0;flex-shrink:0/);
    const html = renderToString(<ResizablePanelGroup><ResizablePanel defaultSize={30}>a</ResizablePanel><ResizableHandle /><ResizablePanel>b</ResizablePanel></ResizablePanelGroup>);
    expect(html).toContain('ef-resizable__pane');
    expect(html).not.toContain('data-sized');
    expect(html).not.toMatch(/\sstyle="/);
    const { render } = await import('@testing-library/react');
    const { container, unmount } = render(<ResizablePanelGroup><ResizablePanel defaultSize={30}>a</ResizablePanel><ResizableHandle /><ResizablePanel>b</ResizablePanel></ResizablePanelGroup>);
    const pane = container.querySelector('[data-slot="resizable-panel"]');
    expect(pane.hasAttribute('data-sized')).toBe(true);
    expect(pane.style.flexBasis).toBe('30%');
    unmount();
  });

  it('Resizable: a caller flex shorthand wins over the computed flex-basis', async () => {
    const { render } = await import('@testing-library/react');
    const { container, unmount } = render(<ResizablePanelGroup><ResizablePanel defaultSize={30} style={{ flex: '2 2 0' }}>a</ResizablePanel><ResizableHandle /><ResizablePanel>b</ResizablePanel></ResizablePanelGroup>);
    const pane = container.querySelector('[data-slot="resizable-panel"]');
    expect(pane.style.flexBasis).toBe('0px');
    unmount();
  });

  it('Slider: the range follows a value change, and an orientation switch clears the other orientation\'s properties', async () => {
    const { render } = await import('@testing-library/react');
    const { container, rerender, unmount } = render(<Slider value={[20, 70]} onValueChange={() => {}} aria-label="Range" />);
    const range = () => container.querySelector('.ef-slider__range');
    expect(range().style.width).toBe('50%');
    rerender(<Slider value={[10, 40]} onValueChange={() => {}} aria-label="Range" />);
    expect(range().style.width).toBe('30%');
    expect(range().style.getPropertyValue('inset-inline-start')).toBe('10%');
    rerender(<Slider value={[10, 40]} orientation="vertical" onValueChange={() => {}} aria-label="Range" />);
    expect(range().style.getPropertyValue('inset-inline-start')).toBe('');
    expect(range().style.bottom).toBe('10%');
    expect(range().style.height).toBe('30%');
    rerender(<Slider value={[10, 40]} onValueChange={() => {}} aria-label="Range" />);
    expect(range().style.bottom).toBe('');
    expect(range().style.height).toBe('');
    expect(range().style.getPropertyValue('inset-inline-start')).toBe('10%');
    unmount();
  });

  it('SelectionQuote: selecting text places the bar (top, left, data-placed)', async () => {
    const { render, screen, waitFor } = await import('@testing-library/react');
    const rect = HTMLElement.prototype.getBoundingClientRect;
    HTMLElement.prototype.getBoundingClientRect = function () {
      const bar = this.classList?.contains('ef-selq__bar');
      const w = bar ? 100 : 500;
      const h = bar ? 30 : 200;
      return { x: 0, y: 0, top: 0, left: 0, right: w, bottom: h, width: w, height: h, toJSON() {} };
    };
    // jsdom has no layout, and may not define Range.getClientRects at all.
    const hadRects = Object.prototype.hasOwnProperty.call(Range.prototype, 'getClientRects');
    const savedRects = Range.prototype.getClientRects;
    Range.prototype.getClientRects = () => [{ top: 100, bottom: 120, left: 50, right: 90, width: 40, height: 20 }];
    try {
      const { container, unmount } = render(<SelectionQuote actions={[{ id: 'q', label: 'Quote' }]}><p>Quotable words</p></SelectionQuote>);
      expect(container.querySelector('.ef-selq__bar')).toBeNull();
      const text = container.querySelector('p').firstChild;
      const range = document.createRange();
      range.setStart(text, 0);
      range.setEnd(text, 8);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      document.dispatchEvent(new Event('pointerup', { bubbles: true }));
      await waitFor(() => expect(container.querySelector('.ef-selq__bar')).not.toBeNull());
      const bar = container.querySelector('.ef-selq__bar');
      await waitFor(() => expect(bar.hasAttribute('data-placed')).toBe(true));
      expect(bar.style.top).toBe('62px');
      expect(bar.style.left).toBe('50px');
      expect(screen.getByRole('toolbar')).toBe(bar);
      selection.removeAllRanges();
      unmount();
    } finally {
      if (hadRects) Range.prototype.getClientRects = savedRects; else delete Range.prototype.getClientRects;
      HTMLElement.prototype.getBoundingClientRect = rect;
    }
  });
});
