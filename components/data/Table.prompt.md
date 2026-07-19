Data table: uppercase micro headers, hairline rows, optional row click. Borderless — nest in `<Card padding={0}>` for a framed table. Sorting, selection, sticky header, and empty/loading states are built in, so the common admin table does not have to be hand-rolled around it.

Sorting is applied by the table. Mark a column `sortable` and it sorts itself; pass `sort` + `onSortChange` only when the order lives elsewhere (a server query, a URL param). `sortAccessor` covers cells whose sort value differs from what is rendered.

Selection behaves the same: `selectable` alone works, and `selected` + `onSelectionChange` takes over when you need the state. Selected rows are tracked by `rowKey`, so set it whenever rows can reorder.

```jsx
<Table
  rowKey="id"
  selectable
  stickyHeader
  onRowClick={openCustomer}
  columns={[
    { key: 'name', label: 'Customer', sortable: true },
    { key: 'plan', label: 'Plan' },
    { key: 'mrr', label: 'MRR', numeric: true, align: 'right', sortable: true,
      sortAccessor: r => Number(String(r.mrr).replace(/[^0-9.]/g, '')) },
    { key: 'status', label: 'Status', render: v => <Badge tone="success" dot>{v}</Badge> },
  ]}
  rows={customers}
  empty="No customers yet."
/>
```

`dense` tightens row height; `render(value, row, i)` for custom cells; `loading` swaps the body for shimmer rows so the header and column widths stay put while the first page loads.

For a genuinely large grid — virtualisation, column resizing, grouping — reach for a dedicated data grid. This covers the admin table, not that.
