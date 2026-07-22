# WebPreview

Browser pane for agent-built UIs — reload, draft-state address bar (Enter commits, Esc reverts), desktop/tablet/mobile widths (animated), collapsible console with error badge, open-in-new-tab. Pass `children` to mock the page without an iframe. Changing the `url` prop navigates the pane (parent-driven navigation); `defaultOpen` starts the console open.

```jsx
<WebPreview url="https://demo.efolusi.dev" logs={[{ level: 'error', text: 'Uncaught TypeError…' }]}>
  <MockLanding />
</WebPreview>
```

Vocabulary: state-carrying selection fires `onChange`; command menus fire `onSelect`; placement is `side` (top/bottom/left/right). `defaultConsoleOpen` is a deprecated alias for `defaultOpen` (one major); `defaultOpen` wins when both are passed.
