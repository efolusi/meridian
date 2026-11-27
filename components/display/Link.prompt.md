Styled anchor, underlined so a link in running text is not marked by colour alone (the link colour is 2.43:1 against body ink in light, 1.88:1 in dark). `external` adds ↗ + new tab; `standalone` makes a semibold CTA with → and drops the underline, because it sits alone.

```jsx
<Link href="/docs">the docs</Link>
<Link external href="https://status.efolusi.com">API status</Link>
<Link standalone href="#">Explore AI agents</Link>
```
