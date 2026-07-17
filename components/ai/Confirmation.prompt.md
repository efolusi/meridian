# Confirmation

Inline approval card for agent actions — pending shows Approve/Reject, settled shows a status line. Ringed accent (or danger) border while pending.

`<Confirmation title="Send 12 refund emails?" description="Covers every failed webhook customer." onStateChange={apply} />`
`<Confirmation tone="danger" title="Drop table archived_runs?" approveLabel="Drop it" />`

Use in the thread when the agent needs permission; use ConfirmDialog only for app-level modals. Nest a ToolCall or Diff as children to show exactly what runs.