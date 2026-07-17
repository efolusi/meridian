# Efolusi Agent — UI kit

The autonomous-agent workspace: chat thread with streaming replies and embedded tool output, task step rail, context files, run metadata, ⌘K palette.

- `index.html` — interactive: send a message (fake streamed reply), pause/resume the run, ⌘K
- `AgentScreen.jsx` — thread, rail, header

Composes: ChatMessage, PromptComposer, Terminal, Steps, FileTile, StatusDot, KeyValueList, CommandPalette, Menu.
