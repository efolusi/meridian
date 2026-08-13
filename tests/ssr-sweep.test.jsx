// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import React from 'react';

/**
 * Every public export renders on the server without throwing, and nothing it
 * serialises carries more decimal places than a browser CSS parser keeps.
 *
 * The hydration-precision class of bug (fixed for four hand-picked components
 * in 731de38) reappeared immediately in AspectRatio, because only the four were
 * guarded. A sweep guards the class: a new component is covered the moment its
 * file exists, and a new float leaking into an inline style fails here before
 * a consumer's hydration warning finds it.
 */

const MAX_DECIMALS = 3;

const modules = import.meta.glob('../components/*/[A-Z]*.jsx', { eager: true });

// Minimal props for components whose render needs data to reach its interesting
// branches. Everything absent from this table renders with no props at all.
const PROPS = {
  AspectRatio: { ratio: 16 / 9, children: React.createElement('img') },
  Avatar: { name: 'Ada Obi' },
  BarChart: { data: [{ label: 'a', value: 1 }, { label: 'b', value: 3 }] },
  Breadcrumbs: { items: [{ label: 'Home', href: '#' }, { label: 'Here' }] },
  Calendar: { mode: 'single', selected: new Date(2026, 6, 1) },
  Carousel: { children: [React.createElement('div', { key: 1 }, 'x')] },
  ChatMessage: { role: 'assistant', children: 'Hi' },
  Citation: { n: 1 },
  CommandDialog: { open: true, title: 'Commands' },
  ConfirmDialog: { open: true, title: 'T' },
  ContextMenu: { children: React.createElement('div') },
  Dialog: { open: true, title: 'T' },
  DonutChart: { data: [{ label: 'a', value: 1 }, { label: 'b', value: 2 }] },
  Drawer: { children: React.createElement('span', null, 'Drawer') },
  HoverCard: { children: React.createElement('span', null, 'x') },
  KeyValueList: { items: [{ key: 'k', value: 'v' }] },
  LineChart: { data: [{ label: 'a', value: 1 }, { label: 'b', value: 2 }] },
  DropdownMenu: { children: React.createElement('span', null, 'Menu') },
  Sheet: { children: React.createElement('span', null, 'Sheet') },
  Menubar: { children: React.createElement('span', null, 'Menu') },
  Message: { children: React.createElement('span', null, 'Message') },
  MessageScrollerProvider: { children: React.createElement('span', null, 'Scroller') },
  SidebarProvider: { children: React.createElement('span', null, 'Sidebar') },
  NavigationMenu: { children: React.createElement('span', null, 'Navigation') },
  PageControl: { count: 3 },
  Pagination: { children: React.createElement('span', null, 'Pagination') },
  Player: { src: 'x.mp3', title: 'T' },
  Popover: { content: 'body', children: React.createElement('button', null, 'Open') },
  SegmentedControl: { options: ['a', 'b'] },
  Select: { options: ['a', 'b'] },
  SideNav: { groups: [{ items: [{ id: 'a', label: 'A' }] }] },
  Sparkline: { data: [1, 3, 2] },
  Steps: { items: [{ label: 'One' }, { label: 'Two' }] },
  Accordion: { items: [{ id: 'a', title: 'A', content: 'x' }] },
  Toolbar: { items: [{ id: 'a', label: 'A' }] },
  Table: { columns: [{ key: 'a', header: 'A' }], rows: [{ a: 1 }] },
  Tabs: { items: [{ id: 'a', label: 'A', content: 'x' }] },
  Toggle: { children: 'x' },
  Tooltip: { content: 'tip', children: React.createElement('button', null, 'x') },
  TreeList: { nodes: [{ id: 'a', label: 'A' }] },
  NumberInput: { label: 'Seats', defaultValue: 5 },
  TimePicker: { value: '09:00' },
  UsageMeter: { used: 1, limit: 3 },
};

const renderable = v =>
  (typeof v === 'function' && /^[A-Z]/.test(v.name || '')) ||
  (v && typeof v === 'object' && v.$$typeof);

const cases = [];
for (const [file, mod] of Object.entries(modules)) {
  for (const [name, exp] of Object.entries(mod)) {
    if (/^[A-Z]/.test(name) && renderable(exp)) cases.push([name, exp, file]);
  }
}

function decimalsOk(html, name) {
  // node environment: no DOM to parse with, so read style attributes textually.
  for (const [, style] of html.matchAll(/style="([^"]*)"/g)) {
    for (const [, digits] of style.matchAll(/\d+\.(\d+)/g)) {
      expect(
        digits.length,
        `${name}: style "${style}" carries ${digits.length} decimals; a CSS parser truncates past ${MAX_DECIMALS} and hydration mismatches`,
      ).toBeLessThanOrEqual(MAX_DECIMALS);
    }
  }
}

describe(`SSR sweep over ${cases.length} public exports`, () => {
  it('found the whole surface', () => {
    // The public surface is broad; a broken glob silently sweeping nothing must fail.
    expect(cases.length).toBeGreaterThanOrEqual(100);
  });
  for (const [name, Comp, file] of cases) {
    it(`${name} server-renders with parser-safe styles`, () => {
      const component = React.createElement(Comp, PROPS[name] || {});
      let element = component;
      if (name === 'CollapsibleTrigger' || name === 'CollapsibleContent') {
        element = React.createElement(modules[file].Collapsible, { defaultOpen: true }, component);
      } else if (name.startsWith('AlertDialog') && name !== 'AlertDialog') {
        element = React.createElement(modules[file].AlertDialog, { defaultOpen: true }, component);
      } else if (name === 'AccordionItem') {
        element = React.createElement(modules[file].Accordion, { type: 'single' }, React.cloneElement(component, { value: 'item' }));
      } else if (name === 'AccordionTrigger' || name === 'AccordionContent') {
        element = React.createElement(
          modules[file].Accordion,
          { type: 'single', defaultValue: 'item' },
          React.createElement(modules[file].AccordionItem, { value: 'item' }, component),
        );
      } else if (name.startsWith('MessageScroller') && name !== 'MessageScrollerProvider') {
        element = React.createElement(modules[file].MessageScrollerProvider, null, component);
      } else if (name.startsWith('Sidebar') && name !== 'SidebarProvider') {
        element = React.createElement(modules[file].SidebarProvider, null, component);
      } else if (name === 'ChartTooltipContent' || name === 'ChartLegendContent') {
        element = React.createElement(modules[file].ChartContainer, { config: {} }, component);
      }
      const html = renderToString(element);
      decimalsOk(html, name);
    });
  }
});
