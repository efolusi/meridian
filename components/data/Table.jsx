import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-table-wrap{max-width:100%;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch}
.ef-table{width:100%;border-collapse:collapse}
.ef-table th{text-align:left;padding:10px var(--table-pad-x);font-size:11px;font-weight:var(--weight-semibold);letter-spacing:0.06em;text-transform:uppercase;color:var(--text-muted);border-bottom:1px solid var(--border-default);white-space:nowrap}
.ef-table td{padding:var(--table-pad-y) var(--table-pad-x);font-size:var(--text-md);border-bottom:1px solid var(--border-default);vertical-align:middle}
.ef-table tr:last-child td{border-bottom:none}
.ef-table--dense td{padding:8px var(--table-pad-x);font-size:var(--text-sm)}
.ef-table__row--click{cursor:pointer;transition:background var(--dur-fast) var(--ease-out)}
.ef-table__row--click:hover{background:var(--surface-subtle)}
.ef-table .ef-num{font-family:var(--font-mono);font-size:13px}
`;
export const Table = React.forwardRef(function Table({ columns, rows, rowKey, onRowClick, dense, style, className, ...rest }, ref) {
  injectEfCss('ef-css-table', CSS);
  const key = (row, i) => rowKey ? (typeof rowKey === 'function' ? rowKey(row) : row[rowKey]) : i;
  return (
    <div ref={ref} {...rest} className="ef-table-wrap" style={style}>
      <table className={`ef-table${dense ? ' ef-table--dense' : ''}${className ? ' ' + className : ''}`}>
        <thead><tr>
          {columns.map(c => <th key={c.key} style={{ width: c.width, textAlign: c.align }}>{c.label}</th>)}
        </tr></thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={key(row, i)} className={onRowClick ? 'ef-table__row--click' : ''} onClick={onRowClick ? () => onRowClick(row) : undefined}>
              {columns.map(c => (
                <td key={c.key} className={c.numeric ? 'ef-num' : ''} style={{ textAlign: c.align }}>
                  {c.render ? c.render(row[c.key], row, i) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
