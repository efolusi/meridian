import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from '../forms/Button.jsx';

const CSS = `
.ef-pagination{display:flex;width:100%;justify-content:center}
.ef-pagination__content{display:flex;align-items:center;gap:4px;margin:0;padding:0;list-style:none}
.ef-pagination__item{display:inline-flex}
.ef-pagination__link{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-width:36px;height:36px;padding:0 10px;border:1px solid transparent;border-radius:var(--radius-sm);background:none;cursor:pointer;font-family:var(--font-sans);font-size:var(--text-sm);color:var(--text-secondary);text-decoration:none;transition:background var(--dur-fast) var(--ease-out),color var(--dur-fast) var(--ease-out),border-color var(--dur-fast) var(--ease-out)}
.ef-pagination__link:hover{background:var(--surface-sunken);color:var(--text-primary);text-decoration:none}
.ef-pagination__link[aria-current="page"]{border-color:var(--border-strong);background:var(--surface-card);color:var(--text-primary);font-weight:var(--weight-semibold)}
.ef-pagination__link[aria-disabled="true"]{opacity:.4;pointer-events:none}
.ef-pagination__link:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-pagination__previous svg,.ef-pagination__next svg{transition:transform var(--dur-fast) var(--ease-out)}
[dir="rtl"] .ef-pagination__previous svg,[dir="rtl"] .ef-pagination__next svg{transform:scaleX(-1)}
.ef-pagination__ellipsis{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;color:var(--text-muted)}
`;

function pageRange(page, count) {
  if (count <= 7) return Array.from({ length: count }, (_, index) => index + 1);
  const selected = new Set([1, count, page - 1, page, page + 1]);
  const output = [];
  for (let value = 1; value <= count; value++) {
    if (selected.has(value)) output.push(value);
    else if (output.at(-1) !== 'ellipsis') output.push('ellipsis');
  }
  return output;
}

export const Pagination = React.forwardRef(function Pagination({ page, pageCount, onChange, children, className, ...props }, ref) {
  injectEfCss('ef-css-pagination', CSS);
  if (page !== undefined && pageCount !== undefined) {
    const go = next => { if (next >= 1 && next <= pageCount) onChange?.(next); };
    return (
      <nav {...props} ref={ref} aria-label={props['aria-label'] || 'Pagination'} data-slot="pagination" className={`ef-pagination${className ? ' ' + className : ''}`}>
        <PaginationContent>
          <PaginationItem><PaginationPrevious href="#" aria-disabled={page <= 1} onClick={event => { event.preventDefault(); go(page - 1); }} /></PaginationItem>
          {pageRange(page, pageCount).map((value, index) => value === 'ellipsis'
            ? <PaginationItem key={`ellipsis-${index}`}><PaginationEllipsis /></PaginationItem>
            : <PaginationItem key={value}><PaginationLink href="#" isActive={value === page} onClick={event => { event.preventDefault(); go(value); }}>{value}</PaginationLink></PaginationItem>)}
          <PaginationItem><PaginationNext href="#" aria-disabled={page >= pageCount} onClick={event => { event.preventDefault(); go(page + 1); }} /></PaginationItem>
        </PaginationContent>
      </nav>
    );
  }
  return <nav {...props} ref={ref} aria-label={props['aria-label'] || 'Pagination'} data-slot="pagination" className={`ef-pagination${className ? ' ' + className : ''}`}>{children}</nav>;
});

export const PaginationContent = React.forwardRef(function PaginationContent({ className, ...props }, ref) {
  injectEfCss('ef-css-pagination', CSS);
  return <ul {...props} ref={ref} data-slot="pagination-content" className={`ef-pagination__content${className ? ' ' + className : ''}`} />;
});
export const PaginationItem = React.forwardRef(function PaginationItem({ className, ...props }, ref) {
  return <li {...props} ref={ref} data-slot="pagination-item" className={`ef-pagination__item${className ? ' ' + className : ''}`} />;
});
export const PaginationLink = React.forwardRef(function PaginationLink({ isActive, size = 'icon', className, ...props }, ref) {
  return <a {...props} ref={ref} data-slot="pagination-link" data-size={size} aria-current={isActive ? 'page' : props['aria-current']} className={`ef-pagination__link${className ? ' ' + className : ''}`} />;
});
export const PaginationPrevious = React.forwardRef(function PaginationPrevious({ children = 'Previous', className, ...props }, ref) {
  return <PaginationLink {...props} ref={ref} size="default" aria-label={props['aria-label'] || 'Go to previous page'} className={`ef-pagination__previous${className ? ' ' + className : ''}`}><Icon name="chevron-left" size={16} /><span>{children}</span></PaginationLink>;
});
export const PaginationNext = React.forwardRef(function PaginationNext({ children = 'Next', className, ...props }, ref) {
  return <PaginationLink {...props} ref={ref} size="default" aria-label={props['aria-label'] || 'Go to next page'} className={`ef-pagination__next${className ? ' ' + className : ''}`}><span>{children}</span><Icon name="chevron-right" size={16} /></PaginationLink>;
});
export const PaginationEllipsis = React.forwardRef(function PaginationEllipsis({ className, ...props }, ref) {
  return <span {...props} ref={ref} aria-hidden="true" data-slot="pagination-ellipsis" className={`ef-pagination__ellipsis${className ? ' ' + className : ''}`}><Icon name="ellipsis" size={16} /><span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>More pages</span></span>;
});
