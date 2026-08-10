Renders one of the 117 glyphs shipped in `assets/icons/` (114 curated Lucide icons plus the `linkedin`, `x-brand` and `github-brand` marks), inheriting `currentColor`. Naming rule: when a Lucide name is taken, the filled brand mark gets a `-brand` suffix — `x` is the close mark and `github` the outline, so the logos are `x-brand` and `github-brand`.

```jsx
<Icon name="arrow-right" />
<Icon name="bell" size={20} />
<Icon name="trash-2" size={16} title="Delete" />
```

Sizes: 16 inline/buttons, 20 nav/lists, 24 feature spots. Keep strokeWidth 1.5 (brand default). Available names = filenames in `assets/icons/` (arrow-right, check, x, plus, search, settings, user, users, bell, house, menu, chevron-*, calendar, clock, mail, lock, eye, eye-off, upload, download, trash-2, pencil, copy, external-link, ellipsis, log-out, credit-card, layout-dashboard, folder, file-text, star, circle-alert, triangle-alert, circle-check, info, sparkles, zap, globe, book-open, code, terminal, shield, shield-check, log-in, laptop, monitor, sun, moon, refresh-cw, chart-column, chart-line, trending-up, inbox, sliders-horizontal, loader-circle, panel-left, funnel, link, activity, wallet, database, rocket, life-buoy, message-square, send, badge-check, …).
