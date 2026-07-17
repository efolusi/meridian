# Dashboard — starter journey

Copyable admin-console journey: overview → customers → customer detail → settings. Copy this whole folder to start your own console; `ds-base.js` has a single `base` line pointing at the design-system root — edit that one line and every page works.

- `Dashboard.dc.html` — overview: stats, usage chart, activity
- `Customers.dc.html` — filterable accounts table
- `CustomerDetail.dc.html` — single account: plan, usage, invoices
- `ConsoleSettings.dc.html` — workspace settings tabs

Showcase twin: `apps/www/registry/kits/console/` covers the same category as plain JSX screens you can lift into a React app. When a screen changes in one, update the other.
