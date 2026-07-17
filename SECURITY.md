# Security policy

## Supported versions
Only the latest release of Meridian receives security fixes.

## Reporting a vulnerability
Meridian is a design system — static CSS, tokens, and client-side React components with no server, no telemetry, and no data collection. Security issues are still possible (XSS via component props, malicious SVG assets, supply-chain concerns).

Report privately to **security@efolusi.com**. Do not open a public issue. Include the affected file, a reproduction, and impact. We aim to acknowledge within 72 hours and patch within 14 days.

## Scope
- `components/`, `blocks/`, `ui_kits/`, `templates/` — component and page source
- `assets/` — icons, fonts, logo
- `styles.css` + `tokens/` — stylesheet closure

Out of scope: issues in consuming applications, browsers, or third-party fonts.
