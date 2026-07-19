import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
import { Checkbox } from '../forms/Checkbox.jsx';
import { Icon } from '../icons/Icon.jsx';
const CSS = `
.ef-table-wrap{max-width:100%;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch}
.ef-table-wrap--sticky{overflow-y:auto}
.ef-table{width:100%;border-collapse:collapse}
.ef-table th{text-align:left;padding:10px var(--table-pad-x);font-size:11px;font-weight:var(--weight-semibold);letter-spacing:0.06em;text-transform:uppercase;color:var(--text-muted);border-bottom:1px solid var(--border-default);white-space:nowrap}
.ef-table--sticky thead th{position:sticky;top:0;z-index:1;background:var(--surface-card)}
.ef-table td{padding:var(--table-pad-y) var(--table-pad-x);font-size:var(--text-md);border-bottom:1px solid var(--border-default);vertical-align:middle}
.ef-table tr:last-child td{border-bottom:none}
.ef-table--dense td{padding:8px var(--table-pad-x);font-size:var(--text-sm)}
.ef-table__row--click{cursor:pointer;transition:background var(--dur-fast) var(--ease-out)}
.ef-table__row--click:hover{background:var(--surface-subtle)}
.ef-table__row--sel{background:var(--accent-subtle)}
.ef-table .ef-num{font-family:var(--font-mono);font-size:13px}
.ef-table__sort{display:inline-flex;align-items:center;gap:4px;border:none;background:none;padding:0;margin:0;font:inherit;letter-spacing:inherit;text-transform:inherit;color:inherit;cursor:pointer}
.ef-table__sort:hover{color:var(--text-primary)}
.ef-table__sort:focus-visible{outline:none;box-shadow:var(--focus-ring);border-radius:var(--radius-sm)}
.ef-table__sort__i{display:inline-flex;opacity:0;transition:opacity var(--dur-fast) var(--ease-out)}
.ef-table__sort:hover .ef-table__sort__i,.ef-table__sort--on .ef-table__sort__i{opacity:1}
.ef-table__sel{width:1%;white-space:nowrap}
.ef-table__msg{padding:28px var(--table-pad-x);text-align:center;font-size:var(--text-md);color:var(--text-muted)}
.ef-table__skel{height:12px;border-radius:var(--radius-sm);background:var(--surface-sunken);animation:ef-table-pulse 1.2s var(--ease-in-out) infinite}
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
  columns, rows, rowKey, onRowClick, dense,
  sort: sortProp, defaultSort, onSortChange,
  selectable, selected: selectedProp, defaultSelected, onSelectionChange,
  stickyHeader, maxHeight, loading, loadingRows = 3, empty = 'Nothing to show yet.',
  style, className, ...rest
}, ref) {
  injectEfCss('ef-css-table', CSS);
  const key = (row, i) => rowKey ? (typeof rowKey === 'function' ? rowKey(row) : row[rowKey]) : i;

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
  const sorted = React.useMemo(() => {
    if (!sort || !sort.key) return rows;
    const col = columns.find(c => c.key === sort.key);
    if (!col) return rows;
    const get = col.sortAccessor || (row => row[col.key]);
    const out = rows.slice().sort((x, y) => compare(get(x), get(y)));
    return sort.direction === 'desc' ? out.reverse() : out;
  }, [rows, columns, sort]);

  const allKeys = sorted.map((r, i) => key(r, i));
  const allOn = allKeys.length > 0 && allKeys.every(k => selected.includes(k));
  const someOn = !allOn && allKeys.some(k => selected.includes(k));
  const span = columns.length + (selectable ? 1 : 0);

  const wrapStyle = stickyHeader || maxHeight ? { maxHeight: maxHeight || 320, ...style } : style;

  return (
    <div ref={ref} {...rest}
      className={`ef-table-wrap${stickyHeader || maxHeight ? ' ef-table-wrap--sticky' : ''}`} style={wrapStyle}>
      <table className={`ef-table${dense ? ' ef-table--dense' : ''}${stickyHeader ? ' ef-table--sticky' : ''}${className ? ' ' + className : ''}`}>
        <thead><tr>
          {selectable ? (
            <th className="ef-table__sel">
              <Checkbox aria-label={allOn ? 'Deselect all rows' : 'Select all rows'}
                checked={allOn}
                ref={el => { if (el) el.indeterminate = someOn; }}
                onChange={e => applySel(e.target.checked ? allKeys : [])} />
            </th>
          ) : null}
          {columns.map(c => {
            const on = sort && sort.key === c.key;
            return (
              <th key={c.key} style={{ width: c.width, textAlign: c.align }}
                aria-sort={c.sortable ? (on ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none') : undefined}>
                {c.sortable ? (
                  <button type="button" className={`ef-table__sort${on ? ' ef-table__sort--on' : ''}`} onClick={() => toggleSort(c.key)}>
                    {c.label}
                    <span className="ef-table__sort__i">
                      <Icon name={on && sort.direction === 'desc' ? 'chevron-down' : 'chevron-up'} size={13} />
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
                    <td key={j}><div className="ef-table__skel" style={{ width: j === 0 ? '55%' : '75%' }} /></td>
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
                      onClick={onRowClick ? () => onRowClick(row) : undefined}>
                      {selectable ? (
                        <td className="ef-table__sel" onClick={e => e.stopPropagation()}>
                          <Checkbox aria-label={`Select row ${i + 1}`} checked={!!isSel}
                            onChange={e => applySel(e.target.checked ? [...selected, k] : selected.filter(x => x !== k))} />
                        </td>
                      ) : null}
                      {columns.map(c => (
                        <td key={c.key} className={c.numeric ? 'ef-num' : ''} style={{ textAlign: c.align }}>
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
