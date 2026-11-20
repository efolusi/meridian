import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { PaymentCard } from '../components/finance/PaymentCard.jsx';
import { DonutChart } from '../components/data/DonutChart.jsx';
import { SideNav } from '../components/navigation/SideNav.jsx';
import { Progress } from '../components/feedback/Progress.jsx';
import { Icon } from '../components/icons/Icon.jsx';

// MD18 (#180): strict-CSP sites (style-src without 'unsafe-inline') drop style attributes,
// so components put fixed styles in their CSS and set runtime values through the CSSOM.
// A style prop the caller passes is the caller's choice and is allowed through.

// Files not fixed yet, with their count of style attributes. It only shrinks; #180
// closes when it is empty.
const REMAINING = {
    "ai/AgentRun.jsx": 1,
    "ai/ChatMessage.jsx": 1,
    "ai/Citation.jsx": 4,
    "ai/Conversation.jsx": 2,
    "ai/DocumentCard.jsx": 1,
    "ai/ModelSelector.jsx": 2,
    "ai/Player.jsx": 2,
    "ai/PromptComposer.jsx": 2,
    "ai/PromptSteps.jsx": 2,
    "ai/SelectionQuote.jsx": 1,
    "ai/Transcript.jsx": 1,
    "ai/UsageMeter.jsx": 1,
    "ai/WebPreview.jsx": 5,
    "code/CodeBlock.jsx": 3,
    "code/Console.jsx": 2,
    "code/Diff.jsx": 2,
    "code/Terminal.jsx": 1,
    "data/BarChart.jsx": 3,
    "data/Chart.jsx": 2,
    "data/KeyValueList.jsx": 1,
    "data/LineChart.jsx": 2,
    "data/Table.jsx": 4,
    "dates/TimePicker.jsx": 1,
    "display/AspectRatio.jsx": 2,
    "display/Resizable.jsx": 1,
    "display/ScrollArea.jsx": 2,
    "display/TreeList.jsx": 3,
    "feedback/ConfirmDialog.jsx": 1,
    "feedback/Dialog.jsx": 1,
    "feedback/Loader.jsx": 1,
    "feedback/Toast.jsx": 2,
    "feedback/Tooltip.jsx": 1,
    "files/FileDrop.jsx": 1,
    "files/FileTypeIcon.jsx": 2,
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
