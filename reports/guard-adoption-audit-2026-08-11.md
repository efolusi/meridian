# Meridian Guard — adoption audit

**Date:** 2026-08-11
**Scope:** authored JavaScript and TypeScript across twelve external consumer repositories. Dependency trees, generated framework/build output, tests, fixtures, minified vendor files, symbolic links, and Meridian itself were excluded.

## Result

Meridian Guard scanned **3,065 authored files across 12 consumers**. The final sweep reported **0 errors** and **320 warnings**:

- 317 `MDG003` raw-color warnings;
- 3 `MDG004` obsolete-prop warnings at audit time;
- 0 unknown components (`MDG001`);
- 0 unknown icons (`MDG002`);
- 0 deterministic accessibility violations (`MDG005`).

Seven consumers currently reference Meridian. Five do not; their raw-color counts are an adoption baseline, not evidence that they violate an installed Meridian contract.

## Actionable classes

The three deterministic API warnings used `StatusDot.state`; they were migrated to `StatusDot.status` before the stable alias was removed.

Raw-color findings need product-aware triage. They include application chrome as well as domain output such as generated images, email markup, media, manifests, and color-processing tools. Those categories must not be bulk-replaced with semantic UI tokens.

## Guard defects corrected by the audit

Testing real monorepos exposed three scanner defects not covered by the original fixtures:

1. generated framework directories were scanned;
2. a broken sandbox symlink terminated the scan;
3. TypeScript type-only imports and non-component package assets were treated as runtime component imports.

Guard now skips standard generated, test, and vendor paths; never follows symlinks; and validates only runtime component imports. Unit tests and built-package CLI checks cover the behavior.

## Next migration pass

1. Keep maintained consumers on canonical props before removing obsolete aliases.
2. Decide adoption scope before treating non-consumer raw colors as failures.
3. Add consumer-local allowlists for domain colors that are not application chrome.
4. Gate only the remaining application-chrome findings in each consumer's CI.
