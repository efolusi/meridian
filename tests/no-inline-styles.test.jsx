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

// MD18 (#180): strict-CSP sites (style-src without 'unsafe-inline') drop style attributes,
// so components put fixed styles in their CSS and set runtime values through the CSSOM.
// A style prop the caller passes is the caller's choice and is allowed through.

// Files not fixed yet, with their count of style attributes. It only shrinks; #180
// closes when it is empty.
const REMAINING = {
    "ai/AgentRun.jsx": 1,
    "ai/DocumentCard.jsx": 1,
    "ai/ModelSelector.jsx": 2,
    "ai/SelectionQuote.jsx": 1,
    "ai/Transcript.jsx": 1,
    "ai/UsageMeter.jsx": 1,
    "dates/TimePicker.jsx": 1,
    "display/Resizable.jsx": 1,
    "feedback/ConfirmDialog.jsx": 1,
    "feedback/Dialog.jsx": 1,
    "feedback/Tooltip.jsx": 1,
    "files/FileDrop.jsx": 1,
    "forms/Button.jsx": 1,
    "forms/ButtonTile.jsx": 1,
    "forms/Input.jsx": 1,
    "forms/Select.jsx": 1,
    "forms/Slider.jsx": 1,
    "forms/Toggle.jsx": 1,
    "marketing/Reveal.jsx": 1,
    "navigation/NavigationMenu.jsx": 1,
    "navigation/Pagination.jsx": 1,
    "navigation/Sidebar.jsx": 1,
    "overlay/ContextMenu.jsx": 2,
    "overlay/Drawer.jsx": 1,
    "overlay/DropdownMenu.jsx": 2,
    "overlay/HoverCard.jsx": 1,
    "overlay/Popover.jsx": 1,
    "overlay/Sheet.jsx": 1
  };

describe('no style attributes in server-rendered HTML', () => {
  const cases = {
    PaymentCard: <PaymentCard name="ADA OBI" number="•••• 4412" expiry="09/29" />,
    'PaymentCard frozen': <PaymentCard name="ADA OBI" number="•••• 4412" expiry="09/29" frozen />,
    DonutChart: <DonutChart data={[{ label: 'A', value: 3 }, { label: 'B', value: 1 }]} centerLabel="Total" />,
    SideNav: <SideNav brand="Komando" brandBadge="Beta" logoSrc="/logo.svg" groups={[{ label: 'Main', items: [{ id: 'a', label: 'Hosts', icon: 'server', badge: 2 }] }]} value="a" />,
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
