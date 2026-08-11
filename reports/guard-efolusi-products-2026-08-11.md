# Meridian Guard — Efolusi product sweep

**Date:** 2026-08-11  
**Scope:** authored JavaScript and TypeScript in every product repository directly
under `/Volumes/Storage/Business/Efolusi/`, excluding Meridian itself, dependency
trees, generated framework/build output, tests/fixtures, minified vendor files,
and symbolic links.

## Result

Meridian Guard scanned **3,065 source files across 12 products**. The final sweep
reported **0 errors** and **320 warnings**:

- 317 `MDG003` raw-color warnings;
- 3 `MDG004` deprecated-prop warnings;
- 0 unknown components (`MDG001`);
- 0 unknown icons (`MDG002`);
- 0 deterministic accessibility violations (`MDG005`).

Seven products currently reference Meridian. Five do not; their raw-color counts
are useful as an adoption baseline, not evidence that they violate an installed
Meridian contract.

| Product | Files | Meridian | Errors | Warnings | Breakdown |
|---|---:|---|---:|---:|---|
| Cuwan | 413 | No | 0 | 26 | 26 raw color |
| EarthOS | 210 | Yes (`^1.9.2`) | 0 | 22 | 22 raw color |
| efolusi.com | 24 | Yes (`^1.19.1`) | 0 | 1 | 1 deprecated prop |
| Komando | 86 | No | 0 | 150 | 150 raw color, concentrated in `legacy/` |
| Kongkow | 362 | No | 0 | 27 | 27 raw color, all OG/global-error surfaces |
| Nexus | 18 | No | 0 | 0 | Clean, but no Meridian adoption |
| Nova | 461 | Yes (`^1.20.0`) | 0 | 10 | 10 raw color |
| Payswitch | 110 | No | 0 | 1 | 1 raw-color CSS template |
| SSO | 205 | Yes (`^1.17.0`) | 0 | 0 | Clean |
| Toolips | 190 | Yes (`^1.20.0`) | 0 | 21 | 21 raw color |
| Trady | 268 | Yes (`^1.19.1`) | 0 | 10 | 8 raw color, 2 deprecated props |
| ZOYYA | 718 | Yes (`^1.20.0`) | 0 | 52 | 52 raw color |

## Immediately actionable findings

Only three warnings are unambiguous API migrations:

1. `efolusi/app/components/HomeClient.jsx:251` — replace
   `<StatusDot state="ok">` with `<StatusDot status="ok">`.
2. `trady/apps/web/src/components/ProjectScreen.tsx:78` — replace the deprecated
   `StatusDot.state` prop with `status`.
3. `trady/apps/web/src/components/ProjectsScreen.tsx:141` — replace the deprecated
   `StatusDot.state` prop with `status`.

The raw-color baseline requires product-aware triage. Important concentrations:

- **Komando:** 150 warnings, 139 of them in four legacy view files. This is
  primarily a Meridian-adoption decision, not a collection of isolated fixes.
- **ZOYYA:** 52 warnings across 14 files. The largest UI surfaces are files,
  schedules, governance, `FilterChip`, and the global error page.
- **Cuwan:** 26 warnings across four dashboard/design-system files.
- **Kongkow:** all 27 warnings are in OG-image and global-error surfaces.
- **Nova:** cookie consent and error/not-found surfaces are UI candidates;
  email-template colors need their own non-CSS-token policy.
- **Toolips:** UI warnings are mixed with intentional color-tool values and PDF
  operations; they must not be bulk-replaced.
- **EarthOS and Trady:** many colors describe globe/video/rendering output rather
  than application chrome. Meridian semantic tokens are not automatically the
  right replacement.

## Guard defects discovered and corrected by the sweep

Testing real monorepos found three scanner defects that the Meridian fixtures did
not expose:

1. generated framework directories (`.next`, `.turbo`, `.open-next`, `.wrangler`,
   and equivalents) were scanned;
2. a broken sandbox symlink in ZOYYA terminated the whole scan;
3. TypeScript type-only imports and `tailwind.preset.cjs` were incorrectly treated
   as runtime component imports.

Guard now skips standard generated/test/vendor paths, never follows symlinks, and
validates only runtime component imports. Unit and built-package CLI checks cover
the new behavior.

## Recommended next pass

1. Fix the three deprecated props; they are deterministic and low risk.
2. Decide whether Cuwan, Komando, Kongkow, Nexus, and Payswitch should adopt
   Meridian before treating their raw-color baselines as failures.
3. Add project-level Guard configuration/allowlists for domain colors (globe,
   video, email, OG image, manifest, and color-conversion tools).
4. Then gate only the remaining application-chrome findings in CI, starting with
   SSO (already clean), efolusi.com, Nova, Toolips, Trady, and ZOYYA.
