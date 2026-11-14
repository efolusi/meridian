import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot, createRoot } from 'react-dom/client';
import { act } from '@testing-library/react';
import { Portal } from '../components/overlay/Portal.jsx';
import { Toaster } from '../components/feedback/Toast.jsx';

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
    container = document.createElement('div');
    container.innerHTML = renderToString(element);
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
