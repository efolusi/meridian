# ToolCall

A tool invocation receipt: mono tool name, live status (running/success/error), collapsible Input/Result body.

`<ToolCall name="search_flights" status="success" args={{ from: 'LIS', before: '15:00' }} result="3 nonstops found" />`

Errors open by default and show the error prop. Stack several inside a message or an AgentRun step. Use Terminal for raw logs instead.