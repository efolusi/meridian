# AgentRun

Vertical run trace: one row per step with done/active/pending/error state, connector rail, mono timestamps.

`<AgentRun steps={[{ title: 'Draft plan', status: 'done', time: '09:41' }, { title: 'Booking', status: 'active', detail: <ToolCall … /> }]} />`

Use for live agent progress or the run detail page. For static onboarding checklists use Steps instead.