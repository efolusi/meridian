# Meridian Guard

Meridian Guard validates React source against Meridian's component, icon,
token, deprecation, and accessibility contracts. It is deterministic: the CLI
does not upload source or call an AI model.

## Usage

```sh
npx @efolusi/meridian-guard src
npx @efolusi/meridian-guard src pages --format json
```

Guard exits `0` when no diagnostics are found, `1` when a contract violation is
found, and `2` for CLI or runtime failures. Directories are scanned recursively;
`.git`, `node_modules`, `dist`, `build`, and `coverage` are ignored.

## Rules

| Rule | Severity | Contract |
|---|---|---|
| `MDG000` | error | Source must parse before it can be validated. |
| `MDG001` | error | Imported Meridian components must exist. |
| `MDG002` | error | Static `Icon` and `IconButton` names must exist. |
| `MDG003` | warning | Inline and CSS-in-JS colors use semantic tokens, not hex. |
| `MDG004` | warning | Deprecated props migrate to their canonical replacement. |
| `MDG005` | error | Required accessible names and dialog titles are present. |

Dynamic icon names cannot be proven statically and are left to the application.
Guard currently validates Meridian imports from the umbrella package and its
documented deep-import paths.

## Developing

The contract at `src/generated/meridian-rules.json` is generated from Meridian's
manifest, component declarations, tokens, and SVG directory. Regenerate it with:

```sh
node scripts/build_guard_rules.mjs
```

Do not edit the generated file manually.
