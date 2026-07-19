# Security policy

## Supported versions

| Version | Supported |
|---|---|
| `main` (hosted at meridian.efolusi.com) | Yes — fixes land here first |
| Latest tagged release (1.x) | Yes — security fixes |
| Untagged 1.0.0–1.3.0 milestones | No — these were never published; see CHANGELOG.md |

## Reporting a vulnerability
Meridian is a design system — static CSS, tokens, and client-side React components with no server, no telemetry, and no data collection. Security issues are still possible (XSS via component props, malicious SVG assets, supply-chain concerns).

Report privately via [GitHub private vulnerability reporting](https://github.com/efolusi/meridian/security/advisories/new) or to **security@efolusi.com**. Do not open a public issue. Include the affected file, a reproduction, and impact. We aim to acknowledge within 72 hours and patch within 14 days.

## Scope
- `components/`, `blocks/`, `showcases/`, `starters/`, `site/` — component and page source
- `assets/` — icons, fonts, logo
- `styles.css` + `tokens/` — stylesheet closure

Out of scope: issues in consuming applications, browsers, or third-party fonts.
