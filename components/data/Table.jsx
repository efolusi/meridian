'use client';
import React from 'react';
import { injectEfCss, mergeRefs, styleRef } from '../runtime/runtime.jsx';
import { Checkbox } from '../forms/Checkbox.jsx';
import { Icon } from '../icons/Icon.jsx';
const CSS = `
.ef-table-wrap{max-width:100%;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch}
.ef-table-wrap--sticky{overflow-y:auto}
.ef-table-wrap:focus-visible{outline:2px solid var(--focus-ring-color);outline-offset:-2px}
/* More columns than fit: the end edge fades while content is hidden there (WCAG 1.3.1 gives no cue otherwise). A scroll-driven
   animation shrinks a mask's fade layer from 28px to 0 over the last 40px of the scroll; a table that fits has no timeline and
   stays opaque, and a browser without scroll timelines shows no fade. The focus ring is not masked. */
@keyframes ef-table-fade{from{mask-size:calc(100% - 28px) 100%,28px 100%}to{mask-size:100% 100%,0 100%}}
@supports (animation-timeline:scroll(self inline)){
.ef-table-wrap{animation-name:ef-table-fade;animation-fill-mode:both;animation-timeline:scroll(self inline);animation-range:calc(100% - 40px) 100%;mask-image:linear-gradient(#000,#000),linear-gradient(to right,#000,transparent);mask-repeat:no-repeat;mask-position:left,right;mask-size:100% 100%,0 100%}
.ef-table-wrap:dir(rtl){mask-image:linear-gradient(#000,#000),linear-gradient(to left,#000,transparent);mask-position:right,left}
.ef-table-wrap:focus-visible{mask-image:none;animation-name:none}
}
.ef-table{width:100%;border-collapse:collapse}
.ef-table th{text-align:start;padding:var(--space-3) var(--table-pad-x);font-size:var(--text-2xs);font-weight:var(--weight-semibold);letter-spacing:0.06em;text-transform:uppercase;color:var(--text-muted);border-bottom:1px solid var(--border-default);white-space:nowrap}
.ef-table--sticky thead th{position:sticky;top:0;z-index:1;background:var(--surface-card)}
.ef-table td{padding:var(--table-pad-y) var(--table-pad-x);font-size:var(--text-md);border-bottom:1px solid var(--border-default);vertical-align:middle}
.ef-table tr:last-child td{border-bottom:none}
.ef-table tfoot{border-top:1px solid var(--border-default);font-weight:var(--weight-medium)}
.ef-table caption{caption-side:bottom;padding-block:var(--space-3);color:var(--text-muted);font-size:var(--text-sm);text-align:start}
.ef-table--dense td{padding:var(--space-2) var(--table-pad-x);font-size:var(--text-sm)}
.ef-table__row--click{cursor:pointer;transition:background var(--dur-fast) var(--ease-enter)}
.ef-table__row--click:hover{background:var(--surface-subtle)}
.ef-table__row--click:focus-visible{outline:2px solid var(--focus-ring-color);outline-offset:-2px}
.ef-table__row--sel{background:var(--accent-subtle)}
.ef-table .ef-num{font-family:var(--font-mono);font-size:var(--text-sm)}
.ef-table [data-align="start"]{text-align:start}.ef-table [data-align="end"]{text-align:end}.ef-table [data-align="center"]{text-align:center}
.ef-table__skel{width:75%}.ef-table__skel--first{width:55%}
.ef-table__sort{display:inline-flex;align-items:center;gap:var(--space-1);border:none;background:none;padding:0;margin:0;font:inherit;letter-spacing:inherit;text-transform:inherit;color:inherit;cursor:pointer}
.ef-table__sort:hover{color:var(--text-primary)}
.ef-table__sort:focus-visible{outline:none;box-shadow:var(--focus-ring);border-radius:var(--radius-sm)}
.ef-table__sort__i{display:inline-flex;opacity:0;transition:opacity var(--dur-fast) var(--ease-enter)}
.ef-table__sort:hover .ef-table__sort__i,.ef-table__sort--on .ef-table__sort__i{opacity:1}
.ef-table__sel{width:1%;white-space:nowrap}
.ef-table__msg{padding:var(--space-8) var(--table-pad-x);text-align:center;font-size:var(--text-md);color:var(--text-muted)}
.ef-table__skel{height:12px;border-radius:var(--radius-sm);background:var(--surface-sunken);animation:ef-table-pulse 1.2s var(--ease-standard) infinite}
@keyframes ef-table-pulse{50%{opacity:.45}}
`;

const compare = (a, b) => {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
};

export const Table = React.forwardRef(function Table({
  columns, rows, rowKey, onRowClick, dense, children,
  sort: sortProp, defaultSort, onSortChange,
  selectable, selected: selectedProp, defaultSelected, onSelectionChange,
  label = 'Table', stickyHeader, maxHeight, loading, loadingRows = 3, empty = 'Nothing to show yet.',
  style, className, ...rest
}, ref) {
  injectEfCss('ef-css-table', CSS);
  // A wrap that scrolls takes a tab stop so a keyboard user can scroll it (WCAG 2.1.1,
  // axe scrollable-region-focusable); one that fits stays out of the tab order.
  const wrapEl = React.useRef(null);
  const [scrolls, setScrolls] = React.useState(false);
  const composition = !columns || !rows;
  React.useEffect(() => {
    const el = wrapEl.current;
    if (!el) return undefined;
    const overflows = () => el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight;
    // While the wrap holds focus the tab stop stays, so focus does not fall to the body
    // when the overflow stops; it goes once focus leaves.
    const measure = () => setScrolls(overflows() || document.activeElement === el);
    const release = () => setScrolls(overflows());
    measure();
    el.addEventListener('blur', release);
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    if (ro) {
      ro.observe(el);
      if (el.firstElementChild) ro.observe(el.firstElementChild);
    }
    return () => {
      el.removeEventListener('blur', release);
      if (ro) ro.disconnect();
    };
  }, [composition]);
  // A focusable scroll part needs a role and a name (WCAG 4.1.2). Named by the caller (aria-labelledby
  // wins over aria-label) it is a region; unnamed it is a group carrying `label`, so several scrolling
  // tables do not add several landmarks of one name.
  const callerName = rest['aria-labelledby'] || rest['aria-label'];
  const scrollRegion = scrolls
    ? { tabIndex: 0, role: callerName ? 'region' : 'group', 'aria-label': rest['aria-labelledby'] ? undefined : (rest['aria-label'] || label), 'aria-labelledby': rest['aria-labelledby'] }
    : {};
  // Hooks first: the composition branch below returns early, and hooks after
  // it would drop sort and selection state whenever a table passes through it.

  const [innerSort, setInnerSort] = React.useState(defaultSort || null);
  const sort = sortProp !== undefined ? sortProp : innerSort;
  const applySort = next => {
    if (sortProp === undefined) setInnerSort(next);
    if (onSortChange) onSortChange(next);
  };
  const toggleSort = colKey => {
    const dir = sort && sort.key === colKey && sort.direction === 'asc' ? 'desc' : 'asc';
    applySort({ key: colKey, direction: dir });
  };

  const [innerSel, setInnerSel] = React.useState(defaultSelected || []);
  const selected = selectedProp !== undefined ? selectedProp : innerSel;
  const applySel = next => {
    if (selectedProp === undefined) setInnerSel(next);
    if (onSelectionChange) onSelectionChange(next);
  };

  // Sorting is applied here, not expected of the caller: a table that renders
  // a sort affordance it does not honour is worse than one with no affordance.
  // Sort positions, not row objects: without rowKey a row's key is its index in
  // `rows`, so a selection stays on the same row when the sort changes, and a
  // row object listed twice still gets two keys.
  const order = React.useMemo(() => {
    const idx = (rows || []).map((_, i) => i);
    if (!rows || !columns || !sort || !sort.key) return idx;
    const col = columns.find(c => c.key === sort.key);
    if (!col) return idx;
    const get = col.sortAccessor || (row => row[col.key]);
    // Negate rather than reverse, so rows with equal keys keep their order.
    const sign = sort.direction === 'desc' ? -1 : 1;
    return idx.sort((x, y) => sign * compare(get(rows[x]), get(rows[y])));
  }, [rows, columns, sort]);
  const sorted = rows ? order.map(i => rows[i]) : rows;
  const key = (row, pos) => rowKey ? (typeof rowKey === 'function' ? rowKey(row) : row[rowKey]) : order[pos];

  if (!columns || !rows) {
    return <div ref={wrapEl} data-slot="table-container" className="ef-table-wrap" {...scrollRegion}>
      <table ref={ref} {...rest} data-slot="table" className={`ef-table${dense ? ' ef-table--dense' : ''}${className ? ' ' + className : ''}`} style={style}>{children}</table>
    </div>;
  }
  const allKeys = sorted.map((r, i) => key(r, i));
  const allOn = allKeys.length > 0 && allKeys.every(k => selected.includes(k));
  const someOn = !allOn && allKeys.some(k => selected.includes(k));
  const span = columns.length + (selectable ? 1 : 0);

  const wrapRef = styleRef({ 'max-height': stickyHeader || maxHeight ? (maxHeight || 320) : undefined });

  return (
    <div ref={mergeRefs(ref, wrapRef, wrapEl)} {...scrollRegion} {...rest}
      className={`ef-table-wrap${stickyHeader || maxHeight ? ' ef-table-wrap--sticky' : ''}`} style={style}>
      <table className={`ef-table${dense ? ' ef-table--dense' : ''}${stickyHeader ? ' ef-table--sticky' : ''}${className ? ' ' + className : ''}`}>
        <thead><tr>
          {selectable ? (
            <th className="ef-table__sel">
              <Checkbox aria-label={allOn ? 'Deselect all rows' : 'Select all rows'}
                checked={allOn ? true : someOn ? 'indeterminate' : false}
                onCheckedChange={next => applySel(next === true ? allKeys : [])} />
            </th>
          ) : null}
          {columns.map(c => {
            const on = sort && sort.key === c.key;
            return (
              <th key={c.key} data-align={c.align} ref={styleRef({ width: c.width })}
                aria-sort={c.sortable ? (on ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none') : undefined}>
                {c.sortable ? (
                  <button type="button" className={`ef-table__sort${on ? ' ef-table__sort--on' : ''}`} onClick={() => toggleSort(c.key)}>
                    {c.label}
                    <span className="ef-table__sort__i">
                      <Icon name={on && sort.direction === 'desc' ? 'chevron-down' : 'chevron-up'} size={12} />
                    </span>
                  </button>
                ) : c.label}
              </th>
            );
          })}
        </tr></thead>
        <tbody>
          {loading
            ? Array.from({ length: loadingRows }, (_, i) => (
                <tr key={'sk' + i}>
                  {Array.from({ length: span }, (_, j) => (
                    <td key={j}><div className={`ef-table__skel${j === 0 ? ' ef-table__skel--first' : ''}`} /></td>
                  ))}
                </tr>
              ))
            : sorted.length === 0
              ? <tr><td className="ef-table__msg" colSpan={span}>{empty}</td></tr>
              : sorted.map((row, i) => {
                  const k = key(row, i);
                  const isSel = selectable && selected.includes(k);
                  return (
                    <tr key={k}
                      className={`${onRowClick ? 'ef-table__row--click' : ''}${isSel ? ' ef-table__row--sel' : ''}`.trim() || undefined}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      tabIndex={onRowClick ? 0 : undefined}
                      onKeyDown={onRowClick ? e => {
                        // Only the row itself: Enter on a button or link inside it is that control's.
                        if (e.target !== e.currentTarget || (e.key !== 'Enter' && e.key !== ' ')) return;
                        e.preventDefault();
                        onRowClick(row);
                      } : undefined}>
                      {selectable ? (
                        <td className="ef-table__sel" onClick={e => e.stopPropagation()}>
                          <Checkbox aria-label={`Select row ${i + 1}`} checked={!!isSel}
                            onCheckedChange={next => applySel(next === true ? [...selected, k] : selected.filter(x => x !== k))} />
                        </td>
                      ) : null}
                      {columns.map(c => (
                        <td key={c.key} className={c.numeric ? 'ef-num' : ''} data-align={c.align}>
                          {c.render ? c.render(row[c.key], row, i) : row[c.key]}
                        </td>
                      ))}
                    </tr>
                  );
                })}
        </tbody>
      </table>
    </div>
  );
});

const tablePart = (tag, slot, displayName) => {
  const Part = React.forwardRef(function TablePart({ className, ...props }, ref) {
    injectEfCss('ef-css-table', CSS);
    return React.createElement(tag, { ref, 'data-slot': slot, className, ...props });
  });
  Part.displayName = displayName;
  return Part;
};

export const TableHeader = tablePart('thead', 'table-header', 'TableHeader');
export const TableBody = tablePart('tbody', 'table-body', 'TableBody');
export const TableFooter = tablePart('tfoot', 'table-footer', 'TableFooter');
export const TableRow = tablePart('tr', 'table-row', 'TableRow');
export const TableHead = tablePart('th', 'table-head', 'TableHead');
export const TableCell = tablePart('td', 'table-cell', 'TableCell');
export const TableCaption = tablePart('caption', 'table-caption', 'TableCaption');
