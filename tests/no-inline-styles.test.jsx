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
