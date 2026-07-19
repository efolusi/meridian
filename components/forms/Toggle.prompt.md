# Toggle / ToggleGroup

A pressed-state button for on/off formatting-style options (bold, grid view, mute). Use `icon` alone for toolbars, or icon + children for labeled toggles.

- Standalone: `<Toggle icon="sparkles" pressed={b} onPressedChange={setB} />`
- Grouped: `<ToggleGroup type="multiple" value={views} onChange={setViews}><Toggle value="list" icon="menu" />…</ToggleGroup>` — single type deselects on re-click.
- Not for navigation (use Tabs/SegmentedControl) or settings that save (use Switch).