import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot, createRoot } from 'react-dom/client';
import { act } from '@testing-library/react';
import { Portal } from '../components/overlay/Portal.jsx';
import { Toaster } from '../components/feedback/Toast.jsx';
import { Dialog, DialogContent, DialogTitle } from '../components/feedback/Dialog.jsx';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/forms/Select.jsx';
import { isElementOfType } from '../components/forms/Button.jsx';

// Found in a fresh Next.js app: the server rendered nothing for a Portal, the
// hydrating client rendered the portal, and React reported a mismatch on every
// page that mounts <Toaster />.
describe('Portal hydration', () => {
  let container;
  afterEach(() => {
    container?.remove();
    document.querySelectorAll('.ef-portal').forEach(n => n.remove());
  });

  function hydrate(element) {
    // A real server has no document; jsdom does, so hide it for the server pass.
    const doc = globalThis.document;
    vi.stubGlobal('document', undefined);
    let html;
    try { html = renderToString(element); } finally { vi.unstubAllGlobals(); }
    expect(globalThis.document).toBe(doc);
    container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    const recoverable = vi.fn();
    let root;
    act(() => {
      root = hydrateRoot(container, element, { onRecoverableError: recoverable });
    });
    return { root, recoverable };
  }

  it('hydrates a Toaster without a mismatch and then portals its stack', () => {
    const { root, recoverable } = hydrate(<main><Toaster /></main>);
    expect(recoverable).not.toHaveBeenCalled();
    expect(document.body.querySelector('.ef-portal [data-slot="toaster"]')).not.toBeNull();
    act(() => root.unmount());
  });

  it('hydrates a dialog that is open on first load without throwing, and focuses inside it', () => {
    // A deferred portal would leave DialogContent's focus effect without a panel
    // in the hydration commit. Portal keeps rendering on the first client render;
    // React recovers the server/client difference for an open overlay itself.
    const page = <Dialog defaultOpen><DialogContent><DialogTitle>Hi</DialogTitle><button>ok</button></DialogContent></Dialog>;
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const { root } = hydrate(page);
      expect(document.activeElement?.closest('[role="dialog"]')).not.toBeNull();
      act(() => root.unmount());
    } finally {
      errors.mockRestore();
    }
  });

  it('renders children on the first client render outside hydration', () => {
    // Anchored overlays measure their panel from the owner's layout effect in the
    // same commit, so the portal must not wait a render when nothing hydrates.
    container = document.createElement('div');
    document.body.appendChild(container);
    const seen = [];
    function Owner() {
      const ref = React.useRef(null);
      React.useLayoutEffect(() => { seen.push(ref.current?.isConnected); }, []);
      return <Portal><span ref={ref}>panel</span></Portal>;
    }
    const root = createRoot(container);
    act(() => root.render(<Owner />));
    expect(seen).toEqual([true]);
    act(() => root.unmount());
  });
});

describe('Portal under StrictMode', () => {
  it('keeps focus that a child set when StrictMode re-runs the attach effect', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    function Focuser() {
      const ref = React.useRef(null);
      const done = React.useRef(false);
      // Like DialogContent: focus once on open, guarded so the StrictMode replay
      // does not run it again.
      React.useEffect(() => {
        if (done.current) return;
        done.current = true;
        ref.current.focus();
      }, []);
      return <button ref={ref}>Close</button>;
    }
    // A browser blurs a focused element when it leaves the document; jsdom does
    // not, so emulate that focus fixup for the duration of the test.
    // (Assigned directly: vi.spyOn on Node.prototype does not intercept here.)
    const removeChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function (child) {
      if (child.contains?.(document.activeElement)) document.activeElement.blur();
      return removeChild.call(this, child);
    };
    try {
      const root = createRoot(container);
      act(() => root.render(<React.StrictMode><Portal><Focuser /></Portal></React.StrictMode>));
      // Compare the element: body.textContent is also "Close" here.
      expect(document.activeElement).toBe(container.ownerDocument.querySelector('.ef-portal button'));
      expect(document.activeElement).not.toBe(document.body);
      act(() => root.unmount());
    } finally {
      Node.prototype.removeChild = removeChild;
      container.remove();
    }
  });
});

describe('compound children composed in a Server Component', () => {
  // Server Component children arrive with a lazy client reference as their type.
  // React.lazy has the same shape ({ $$typeof: react.lazy, _payload, _init }).
  async function lazyOf(Component) {
    const Lazy = React.lazy(() => Promise.resolve({ default: Component }));
    // Resolve it once so _init returns the component instead of throwing.
    try { Lazy._init(Lazy._payload); } catch (pending) { await pending; }
    return Lazy;
  }

  it('isElementOfType sees through a resolved lazy type', async () => {
    const LazyItem = await lazyOf(SelectItem);
    expect(isElementOfType(<LazyItem value="a">A</LazyItem>, SelectItem)).toBe(true);
    expect(isElementOfType(<LazyItem value="a">A</LazyItem>, SelectTrigger)).toBe(false);
    expect(isElementOfType('text', SelectItem)).toBe(false);
  });

  it('Select shows the selected label when its items are lazy references', async () => {
    const LazyItem = await lazyOf(SelectItem);
    const html = renderToString(
      <Select defaultValue="one"><SelectTrigger><SelectValue placeholder="Pick one" /></SelectTrigger>
        <SelectContent><LazyItem value="one">One</LazyItem><LazyItem value="two">Two</LazyItem></SelectContent></Select>
    );
    expect(html).toContain('>One<');
    expect(html).not.toContain('Pick one');
  });
});
