import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';

import { ScrollArea, ScrollBar } from '../components/display/ScrollArea.jsx';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '../components/display/Resizable.jsx';

describe('Scroll Area compatibility', () => {
  it('composes content inside a viewport and exposes oriented scrollbars', () => {
    const rootRef = React.createRef();
    const barRef = React.createRef();
    const { getByTestId } = render(
      <ScrollArea ref={rootRef} maxHeight={120} data-testid="root">
        <div data-testid="content">Activity</div>
        <ScrollBar ref={barRef} orientation="horizontal" data-testid="bar" />
      </ScrollArea>,
    );

    const root = getByTestId('root');
    const viewport = root.querySelector('[data-slot="scroll-area-viewport"]');
    expect(rootRef.current).toBe(root);
    expect(viewport.contains(getByTestId('content'))).toBe(true);
    expect(viewport.contains(getByTestId('bar'))).toBe(false);
    expect(barRef.current).toBe(getByTestId('bar'));
    expect(getByTestId('bar').getAttribute('data-orientation')).toBe('horizontal');
    expect(root.style.maxHeight).toBe('120px');
  });
});

describe('Resizable compatibility', () => {
  it('renders the composition contract, forwards refs, and resizes by keyboard', () => {
    const groupRef = React.createRef();
    const panelRef = React.createRef();
    const handleRef = React.createRef();
    const onLayoutChange = vi.fn();
    const { getByRole, getByTestId } = render(
      <ResizablePanelGroup ref={groupRef} orientation="horizontal" onLayoutChange={onLayoutChange} data-testid="group">
        <ResizablePanel ref={panelRef} defaultSize={40} minSize={30} data-testid="first">Explorer</ResizablePanel>
        <ResizableHandle ref={handleRef} withHandle />
        <ResizablePanel minSize={30} data-testid="second">Editor</ResizablePanel>
      </ResizablePanelGroup>,
    );

    const separator = getByRole('separator');
    expect(groupRef.current).toBe(getByTestId('group'));
    expect(panelRef.current).toBe(getByTestId('first'));
    expect(handleRef.current).toBe(separator);
    expect(separator.getAttribute('aria-orientation')).toBe('vertical');
    expect(separator.querySelector('.ef-resizable__grip')).toBeTruthy();
    expect(getByTestId('first').style.flexBasis).toBe('40%');
    fireEvent.keyDown(separator, { key: 'ArrowRight' });
    expect(getByTestId('first').style.flexBasis).toBe('42%');
    expect(onLayoutChange).toHaveBeenLastCalledWith([42, 58]);
  });

  it('honors vertical orientation and disabled handles', () => {
    const { getByRole } = render(
      <ResizablePanelGroup orientation="vertical">
        <ResizablePanel>Top</ResizablePanel>
        <ResizableHandle disabled />
        <ResizablePanel>Bottom</ResizablePanel>
      </ResizablePanelGroup>,
    );

    const vertical = getByRole('separator');
    expect(vertical.getAttribute('aria-orientation')).toBe('horizontal');
    expect(vertical.getAttribute('aria-disabled')).toBe('true');
    expect(vertical.hasAttribute('tabindex')).toBe(false);
    fireEvent.keyDown(vertical, { key: 'ArrowDown' });
  });

  it('resizes adjacent panels through pointer movement', () => {
    const { getByRole, getByTestId } = render(
      <ResizablePanelGroup data-testid="pointer-group">
        <ResizablePanel data-testid="pointer-first">First</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>Second</ResizablePanel>
      </ResizablePanelGroup>,
    );
    Object.defineProperty(getByTestId('pointer-group'), 'clientWidth', { configurable: true, value: 200 });

    fireEvent(getByRole('separator'), new MouseEvent('pointerdown', { bubbles: true, clientX: 100 }));
    fireEvent(window, new MouseEvent('pointermove', { bubbles: true, clientX: 120 }));
    fireEvent(window, new MouseEvent('pointerup', { bubbles: true }));

    expect(getByTestId('pointer-first').style.flexBasis).toBe('60%');
  });
});
