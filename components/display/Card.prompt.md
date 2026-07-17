The surface container: white, 1px sand border, 8px radius, warm shadow.

```jsx
<Card title="Invite your team" subtitle="Works better together." actions={<Button size="sm" variant="secondary">Invite</Button>} footer={<span>3 of 5 seats used</span>}>
  …content…
</Card>
<Card interactive>Hover-lifts 2px — use for clickable cards.</Card>
```

`padding` (default 20), `elevated`, `interactive`. Header renders only when `title`/`actions` set.
