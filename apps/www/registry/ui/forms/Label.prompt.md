# Label

Standalone field label for custom controls that lack a built-in `label` prop. Pair via `htmlFor`; `required` adds the red asterisk, `hint` a muted inline note.

`<Label htmlFor="region" required hint="Cannot change later">Region</Label>`

Input, Select, etc. already render their own labels — do not double-label them.