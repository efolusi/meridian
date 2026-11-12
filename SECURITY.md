# Security policy

## Supported versions

| Version | Supported |
|---|---|
| `main` (hosted at meridian.efolusi.com) | Yes. Fixes land here first |
| Latest tagged release (1.x) | Yes, for security fixes |
| Untagged 1.0.0 to 1.3.0 milestones | No. They were never published (see CHANGELOG.md) |

## Reporting a vulnerability
Meridian is a design system: static CSS, tokens, and client-side React components. It has no hosted backend, no telemetry, and collects no data. It also ships npm packages and a local MCP server (`@efolusi/meridian-mcp`), a stdio process that runs on your machine and reads the public registry. Security issues are still possible, for example XSS through component props, a malicious SVG asset, or a supply-chain compromise of the published packages or the release pipeline.

Report privately via [GitHub private vulnerability reporting](https://github.com/efolusi/meridian/security/advisories/new) or to **security@efolusi.com**. Do not open a public issue. Include the affected file, a reproduction, and impact. We aim to acknowledge within 72 hours and patch within 14 days.

## Scope
- `components/`, `blocks/`, `showcases/`, `starters/`, `site/`: component and page source
- `assets/`: icons, fonts, logo
- `styles.css` and `tokens/`: the stylesheet closure
- The npm packages `@efolusi/meridian`, `@efolusi/meridian-tokens`, `@efolusi/meridian-icons`, `@efolusi/meridian-guard` (`packages/`) and `@efolusi/meridian-mcp` (`mcp/`)
- The release and deploy pipeline: `.github/workflows/`, `scripts/deploy-*.sh`, `nginx/`

Out of scope: issues in consuming applications, browsers, or third-party fonts.
