Data table: uppercase micro headers, hairline rows, optional row click. Borderless — nest in `<Card padding={0}>` for a framed table.

```jsx
<Table
  rowKey="id"
  columns={[
    { key: 'name', label: 'Customer' },
    { key: 'plan', label: 'Plan' },
    { key: 'mrr', label: 'MRR', numeric: true, align: 'right' },
    { key: 'status', label: 'Status', render: v => <Badge tone="success" dot>{v}</Badge> },
  ]}
  rows={customers}
  onRowClick={openCustomer}
/>
```

`dense` tightens row height; `render(value, row, i)` for custom cells.
