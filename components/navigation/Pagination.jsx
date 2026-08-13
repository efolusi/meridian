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

export const Pagination = React.forwardRef(function Pagination({ className, ...props }, ref) {
  injectEfCss('ef-css-pagination', CSS);
  return <nav {...props} ref={ref} aria-label={props['aria-label'] || 'Pagination'} data-slot="pagination" className={`ef-pagination${className ? ' ' + className : ''}`} />;
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
export const PaginationPrevious = React.forwardRef(function PaginationPrevious({ text = 'Previous', className, ...props }, ref) {
  return <PaginationLink {...props} ref={ref} size="default" aria-label={props['aria-label'] || 'Go to previous page'} className={`ef-pagination__previous${className ? ' ' + className : ''}`}><Icon name="chevron-left" size={16} /><span>{text}</span></PaginationLink>;
});
export const PaginationNext = React.forwardRef(function PaginationNext({ text = 'Next', className, ...props }, ref) {
  return <PaginationLink {...props} ref={ref} size="default" aria-label={props['aria-label'] || 'Go to next page'} className={`ef-pagination__next${className ? ' ' + className : ''}`}><span>{text}</span><Icon name="chevron-right" size={16} /></PaginationLink>;
});
export const PaginationEllipsis = React.forwardRef(function PaginationEllipsis({ className, ...props }, ref) {
  return <span {...props} ref={ref} aria-hidden="true" data-slot="pagination-ellipsis" className={`ef-pagination__ellipsis${className ? ' ' + className : ''}`}><Icon name="ellipsis" size={16} /><span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>More pages</span></span>;
});
