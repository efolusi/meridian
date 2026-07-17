# Efolusi Console — product demo

The admin surface shared by Efolusi's B2B products: overview dashboard, customers table, and workspace settings. Original demonstration screens (no prior product existed to recreate).

- `index.html` — interactive: sidebar navigation, New project dialog → toast, customer selection, settings tabs.
- `Shell.jsx` — sidebar + topbar chrome
- `OverviewScreen.jsx` — stats, usage chart, activity
- `CustomersScreen.jsx` — filterable table
- `SettingsScreen.jsx` — tabbed settings (general, members, API keys)
- `ExtraScreens.jsx` — ProjectsScreen, UsageScreen, BillingScreen (reachable via the ⌘K palette)

Layout: 1440 design width, 240px sidebar, `--sand-50` page, white cards, 24px gutters.

Starter twin: `starters/dashboard/` is the copyable multi-page journey for this category; this kit shows the screens as liftable plain JSX. When a screen changes in one, update the other.
