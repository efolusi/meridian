Large selectable tile — plan pickers, onboarding choices. Wrap in `ButtonTileGroup columns={n}`.

```jsx
<ButtonTileGroup columns={3}>
  <ButtonTile icon="rocket" title="Starter" description="Free forever" selected={plan==='starter'} onClick={() => setPlan('starter')} />
  <ButtonTile icon="zap" title="Growth" description="$12 per seat" selected={plan==='growth'} onClick={() => setPlan('growth')} />
</ButtonTileGroup>
```
