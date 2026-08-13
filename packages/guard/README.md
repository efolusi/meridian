# Meridian Guard

Deterministic compliance checks for React applications built with Meridian.
Guard runs locally, never uploads source, and does not call an AI model.

## Requirements and installation

Node.js 20.10 or newer is required.

Install the public CLI as a development dependency:

```sh
npm install --save-dev @efolusi/meridian-guard
```

Add a repeatable project command:

```json
{
  "scripts": {
    "guard": "meridian-guard src"
  }
}
```

Run it with `npm run guard` locally and in CI.

## Usage

```sh
npx @efolusi/meridian-guard src
npx @efolusi/meridian-guard src pages --format json
npx meridian-guard --help
```

Guard exits `0` when no diagnostics are found, `1` when a contract violation is
found (including warnings), and `2` for invalid options, missing targets, empty
scans, or runtime failures. An empty scan fails closed so a misspelled CI target
cannot silently pass; use `--allow-empty` only when zero source files is expected.

Directories are scanned recursively;
common dependency, framework-output, build, and coverage directories are
ignored (`node_modules`, `.next`, `.turbo`, `.open-next`, `.wrangler`, `dist`,
`build`, `coverage`, and their equivalents). Symbolic links are not followed,
keeping a scan inside the requested source tree and safely skipping broken links.
Test/spec fixtures and minified vendor scripts are also excluded because they are
not shipped interface source.

## Rules

| Rule | Severity | Contract |
|---|---|---|
| `MDG000` | error | Source must parse before it can be validated. |
| `MDG001` | error | Imported Meridian components must exist. |
| `MDG002` | error | Static `Icon` and `IconButton` names must exist. |
| `MDG003` | warning | Inline and CSS-in-JS colors use semantic tokens, not hex. |
| `MDG004` | warning | Deprecated props migrate to their canonical replacement. |
| `MDG005` | error | Required accessible names and dialog titles are present. |
| `MDG006` | error | Referenced Meridian radius tokens must exist in the generated token contract. |

Dynamic icon names cannot be proven statically and are left to the application.
Guard currently validates Meridian imports from the umbrella package and its
documented deep-import paths.

## Continuous integration

GitHub Actions needs no npm token for installing the public package:

```yaml
- uses: actions/setup-node@v5
  with:
    node-version: '22'
- run: npm ci
- run: npm run guard
```

Use `--format json` when another tool will consume the result. Its stable top-level
fields are `version`, `filesScanned`, `errors`, `warnings`, and `diagnostics`.
Every diagnostic includes `file`, `line`, `column`, `ruleId`, `severity`, and
`message`. The default pretty format is intended for terminal logs:

```text
src/Toolbar.jsx:8:5 error MDG002
  "magnify" is not a Meridian icon. Choose a name from the icon registry.
```

## Programmatic API

The package also exports `guard`, `scanSource`, and the `RULES` metadata:

```js
import { guard } from '@efolusi/meridian-guard';

const result = await guard(['src']);
if (result.diagnostics.length) process.exitCode = 1;
```

`scanSource(source, filename, contracts)` is available for editor and test
integrations that already have source text. Most applications should use the CLI
or `guard()` so they receive the packaged Meridian contract automatically.

## Scope and troubleshooting

- Guard parses JavaScript, JSX, TypeScript, TSX, MJS, and CJS. It is a focused
  Meridian contract checker, not a replacement for ESLint or TypeScript.
- Dynamic component and icon names cannot be proven statically and are skipped.
- Test/spec files, fixtures, generated output, dependencies, minified files, and
  symbolic links are intentionally skipped. Scan authored application directories.
- There is no per-rule suppression or configuration file yet. If a diagnostic is
  incorrect, report the smallest reproducible source at the Meridian repository
  instead of hiding the rule globally.
- Exit `2` usually means the target path is wrong, no supported files were found,
  the source could not be read, or an option is invalid. The CLI prints the exact
  cause to stderr.

## Developing

The contract at `src/generated/meridian-rules.json` is generated from Meridian's
manifest, component declarations, tokens, and SVG directory. Regenerate it with:

```sh
node scripts/build_guard_rules.mjs
```

Do not edit the generated file manually.
