# Efolusi Infra — UI kit

The infrastructure control plane: resources / domains / certificates tables, live status, detail drawer with records + logs, connect flow.

- `index.html` — interactive: switch tabs, click a row for the drawer, connect a resource, dismiss the incident banner
- `InfraScreen.jsx` — stats, tables, drawer

Composes: Banner, Stat, Sparkline, SegmentedControl, Table, StatusDot, Drawer, KeyValueList, CopyField, Terminal, Dialog.
