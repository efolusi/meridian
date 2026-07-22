# Releasing Meridian

A release is a version bump pushed to `main`. The publish workflow notices that
the manifest carries a version the registry does not have, re-runs every gate,
publishes via npm Trusted Publishing (OIDC, no token anywhere), and then creates
the `vX.Y.Z` tag and the GitHub Release itself. Pushes whose version is already
published are a no-op for the workflow.

## Where the version lives

The npm build reads its version from `_ds_manifest.json`. Four other files
carry it and must agree:

| File | Field |
|---|---|
| `_ds_manifest.json` | `version` — **the source the build reads** |
| `package.json` | `version` |
| `CITATION.cff` | `version` (+ `date-released`) |
| `site/DsSite.dc.html` | JSON-LD `softwareVersion` |
| `CHANGELOG.md` | the release heading |

`npm run check` fails when the manifest and package.json disagree.

## The steps

1. Move CHANGELOG's `Unreleased` content under a `## X.Y.Z — YYYY-MM-DD` heading.
   The workflow lifts this section verbatim into the GitHub Release notes.
2. Bump the version in the five files above.
3. `npm run check` — all gates green, locally, before anything is pushed.
4. Commit and push. That is the release: the publish workflow sees the new
   version, re-runs the gates, publishes to npm, then pushes the tag and cuts
   the GitHub Release on its own.

Cutting a GitHub Release by hand still publishes too (with the tag-must-match
guard), and `workflow_dispatch` remains for dry-run rehearsals.

## Rules the workflow enforces

- **Only a version absent from the registry triggers the auto path.** Routine
  pushes skip publishing entirely; two racing bump pushes are serialized by a
  concurrency group, and the loser fails the already-published check.
- **Tag and package version must agree** on the manual-Release path. A release
  tagged `v1.6.0` whose manifest still says `1.5.2` fails before publish, not
  after.
- **A version already on the registry fails.** npm versions are immutable;
  bump instead.
- **Manual dispatch defaults to a dry run.** A non-dry manual publish
  additionally requires the matching `vX.Y.Z` tag to exist and point at the
  commit being built — an untagged tree cannot reach the registry.

## When something ships broken

npm allows unpublish only within 72 hours and it is rarely the right call.
Fix forward: bump the patch version, release again. `1.5.0` shipping with a
broken exports map and `1.5.1` correcting it is the precedent.
