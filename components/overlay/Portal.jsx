import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-portal{position:fixed;top:0;left:0;width:0;height:0}
`;

/**
 * Renders children into document.body (or `container`).
 *
 * Every floating surface needs this. An overlay positioned inside its trigger's
 * subtree is clipped by the first ancestor with overflow:auto|hidden — which in
 * practice is the scrolling table, drawer, or card it was opened from.
 */
export function Portal({ children, container }) {
  injectEfCss('ef-css-portal', CSS);
  const hostRef = React.useRef(null);
  if (hostRef.current === null && typeof document !== 'undefined') {
    hostRef.current = document.createElement('div');
    hostRef.current.className = 'ef-portal';
  }
  // Children mount into the host on the first render, while it is still detached,
  // and this layout effect attaches it before paint. Gating the render on a
  // "mounted" state instead would leave the panel absent when the parent measures
  // it for placement, which puts every anchored overlay at the viewport origin.
  React.useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const parent = container || document.body;
    parent.appendChild(host);
    return () => { if (host.parentNode) host.parentNode.removeChild(host); };
  }, [container]);
  if (!hostRef.current) return null;
  return ReactDOM.createPortal(children, hostRef.current);
}

/**
 * Position a portaled panel against its anchor, in viewport coordinates.
 *
 * Flips to the opposite side when the preferred one would overflow, then shifts
 * along the cross axis to stay on screen. Returns { style, side } — the panel is
 * hidden for the first frame so the measurement never flashes, and `side` is the
 * placement actually resolved, which a caller drawing an arrow has to know.
 *
 * Not exported on the namespace — it is a building block for the overlay
 * components, and is only useful with a panel ref you already control.
 */
export function useAnchoredStyle(anchorRef, panelRef, { open, placement = 'bottom', align = 'start', offset = 6, matchWidth = false } = {}) {
  const [state, setState] = React.useState({
    style: { position: 'fixed', top: 0, left: 0, visibility: 'hidden' },
    side: placement,
  });
  React.useLayoutEffect(() => {
    if (!open) {
      setState(s => (s.style.visibility === 'hidden' ? s : { ...s, style: { ...s.style, visibility: 'hidden' } }));
      return;
    }
    const place = () => {
      const anchor = anchorRef.current;
      const panel = panelRef.current;
      if (!anchor || !panel) return;
      const a = anchor.getBoundingClientRect();
      const p = panel.getBoundingClientRect();
      const vw = document.documentElement.clientWidth;
      const vh = document.documentElement.clientHeight;
      const edge = 8;

      const roomBelow = vh - a.bottom - offset;
      const roomAbove = a.top - offset;
      const wantsTop = placement === 'top';
      const side = wantsTop
        ? (roomAbove >= p.height || roomAbove >= roomBelow ? 'top' : 'bottom')
        : (roomBelow >= p.height || roomBelow >= roomAbove ? 'bottom' : 'top');

      // a width-matched panel (a listbox under its input) is measured at the
      // anchor's width, not its own, or the clamp below uses the wrong number
      const width = matchWidth ? a.width : p.width;
      let top = side === 'bottom' ? a.bottom + offset : a.top - offset - p.height;
      let left = align === 'end' ? a.right - width
        : align === 'center' ? a.left + a.width / 2 - width / 2
        : a.left;

      left = Math.max(edge, Math.min(left, vw - width - edge));
      top = Math.max(edge, Math.min(top, vh - p.height - edge));

      const next = { position: 'fixed', top: Math.round(top), left: Math.round(left), right: 'auto', bottom: 'auto', visibility: 'visible' };
      if (matchWidth) next.width = Math.round(a.width);
      setState({ style: next, side });
    };
    place();
    // capture phase: any scrolling ancestor moves the anchor, not just the window
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [open, placement, align, offset, matchWidth, anchorRef, panelRef]);
  return state;
}
