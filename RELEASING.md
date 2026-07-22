# Releasing Meridian

Every release is a version bump, a tag, and a GitHub Release. The publish
workflow does the rest — it re-runs every gate and refuses to ship a package
that disagrees with its tag.

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
2. Bump the version in the five files above.
3. `npm run check` — all gates green, locally, before anything is pushed.
4. Commit, push, and confirm the `checks` workflow is green on `main`.
5. Tag and release:

   ```bash
   git tag vX.Y.Z
   git push origin vX.Y.Z
   gh release create vX.Y.Z --title "Meridian X.Y.Z" --notes-file <notes>
   ```

6. Publishing the GitHub Release triggers `.github/workflows/publish.yml`,
   which re-runs the gates, verifies the tag matches the built package version,
   verifies the version is not already on the registry, and publishes via npm
   Trusted Publishing (OIDC) — no token anywhere.

## Rules the workflow enforces

- **Tag and package version must agree.** A release tagged `v1.6.0` whose
  manifest still says `1.5.2` fails before publish, not after.
- **A version already on the registry fails.** npm versions are immutable;
  bump instead.
- **Manual dispatch defaults to a dry run.** A non-dry manual publish
  additionally requires the matching `vX.Y.Z` tag to exist and point at the
  commit being built — an untagged tree cannot reach the registry.

## When something ships broken

npm allows unpublish only within 72 hours and it is rarely the right call.
Fix forward: bump the patch version, release again. `1.5.0` shipping with a
broken exports map and `1.5.1` correcting it is the precedent.
