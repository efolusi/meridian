Chronological, immutable events for audit logs, incidents, approvals, and relationship history. Uses semantic `ol`, `li`, and `time` elements. Use `Steps` for a process the user is progressing through; use `Timeline` for events that already happened.

```jsx
<Timeline items={[
  { id: 'review', title: 'Security review requested', description: 'Assigned to the solutions team.', time: '09:42', dateTime: '2026-08-10T09:42:00Z', actor: 'Ada Obi', tone: 'warning' },
  { id: 'approved', title: 'Rollout approved', time: 'Yesterday', dateTime: '2026-08-09', actor: 'June Park', tone: 'success' },
]} />
```

Tone is optional and never the only state signal: titles and descriptions carry the meaning. Supply `dateTime` whenever `time` represents a real timestamp.

