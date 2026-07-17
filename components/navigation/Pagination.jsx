import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-pager{display:flex;align-items:center;gap:4px}
.ef-pager__btn{display:inline-flex;align-items:center;justify-content:center;min-width:28px;height:28px;padding:0 6px;border:1px solid transparent;border-radius:var(--radius-sm);background:none;cursor:pointer;font-family:var(--font-sans);font-size:var(--text-sm);color:var(--text-secondary);transition:background var(--dur-fast) var(--ease-out),color var(--dur-fast) var(--ease-out)}
.ef-pager__btn:hover:not(:disabled):not(.ef-pager__btn--active){background:var(--surface-sunken);color:var(--text-primary)}
.ef-pager__btn--active{background:var(--accent);color:var(--text-inverse);font-weight:var(--weight-semibold)}
.ef-pager__btn:disabled{opacity:.4;cursor:not-allowed}
.ef-pager__btn:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-pager__gap{min-width:28px;text-align:center;color:var(--text-muted);font-size:var(--text-sm)}
`;
function range(page, count) {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const set = new Set([1, count, page - 1, page, page + 1]);
  const out = [];
  for (let i = 1; i <= count; i++) {
    if (set.has(i)) { out.push(i); }
    else if (out[out.length - 1] !== '…') out.push('…');
  }
  return out;
}
export function Pagination({ page, pageCount, onChange, style, className }) {
  injectEfCss('ef-css-pager', CSS);
  const go = p => { if (p >= 1 && p <= pageCount && onChange) onChange(p); };
  return (
    <nav aria-label="Pagination" className={`ef-pager${className ? ' ' + className : ''}`} style={style}>
      <button className="ef-pager__btn" aria-label="Previous page" disabled={page <= 1} onClick={() => go(page - 1)}><Icon name="chevron-left" size={15} /></button>
      {range(page, pageCount).map((p, i) => p === '…'
        ? <span key={'g' + i} className="ef-pager__gap">…</span>
        : <button key={p} className={`ef-pager__btn${p === page ? ' ef-pager__btn--active' : ''}`} aria-current={p === page ? 'page' : undefined} onClick={() => go(p)}>{p}</button>)}
      <button className="ef-pager__btn" aria-label="Next page" disabled={page >= pageCount} onClick={() => go(page + 1)}><Icon name="chevron-right" size={15} /></button>
    </nav>
  );
}
