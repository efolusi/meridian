Generic row: leading icon/media, title + description, trailing slot. Renders as div, button (`onClick`), or anchor (`href`).

```jsx
<ListItem icon="bell" title="Usage alerts" description="At 80% of plan" trailing={<Switch defaultChecked />} />
<ListItem media={<Avatar name="Ada Obi" />} title="Ada Obi" trailing="2m ago" chevron onClick={open} />
```
