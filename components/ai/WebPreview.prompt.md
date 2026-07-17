# WebPreview

Browser pane for agent-built UIs — reload, draft-state address bar (Enter commits, Esc reverts), desktop/tablet/mobile widths (animated), collapsible console with error badge, open-in-new-tab. Pass `children` to mock the page without an iframe.

```jsx
<WebPreview url="https://demo.efolusi.dev" logs={[{ level: 'error', text: 'Uncaught TypeError…' }]}>
  <MockLanding />
</WebPreview>
```
