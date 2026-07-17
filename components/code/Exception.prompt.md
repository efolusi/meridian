# Exception

Runtime-error card — mono type chip + message, collapsible stack frames (active frame flagged, internal frames dimmed) and an optional source excerpt with the failing line highlighted.

```jsx
<Exception type="TypeError" message="Cannot read properties of undefined (reading 'id')" frames={[
  { fn: 'getUser', loc: 'api/users.ts:32:11', active: true },
  { fn: 'renderApp', loc: 'react-dom.js:118', internal: true },
]} />
```
