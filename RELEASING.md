# Releasing Meridian

A release is a version bump pushed to `main`. The publish workflow notices that
the manifest carries a version the registry does not have, re-runs every gate,
publishes via npm Trusted Publishing (OIDC, no token anywhere), and then creates
the `vX.Y.Z` tag and the GitHub Release itself. Pushes whose version is already
published are a no-op for the workflow.

**The production site deploys from the tag, never from a push.**
`deploy-prod-static.yml` runs on a `v*` tag push, or by hand (`workflow_dispatch`)
on a `v*` tag. It checks out the tagged commit, refuses a commit that is not on
`main` or whose checks did not pass, runs `npm run check`, and publishes.
The tag that `publish.yml` creates is pushed with `GITHUB_TOKEN`, which does not
start other workflows, so after a release run the deploy by hand:
`gh workflow run deploy-prod-static.yml --ref vX.Y.Z`.

**This is a monorepo of five published lockstep packages.** One version bump
publishes all five at the same version: the `@efolusi/meridian` umbrella plus
the standalone `@efolusi/meridian-tokens`, `@efolusi/meridian-icons`,
`@efolusi/meridian-guard`, and `@efolusi/meridian-cli`. Each publish is
idempotent (a version already on the registry is skipped), so a run that fails
partway re-runs cleanly. Each package needs its own Trusted Publisher configured
on npmjs.com (all pointing at `publish.yml`); a brand-new sub-package must be
created once with a manual `npm publish ./packages/<name>/dist --access public`
before OIDC can take over, exactly as the umbrella was first published.

The MCP server `@efolusi/meridian-mcp` (`mcp/`) is a **sixth** package the same
pipeline maintains, but **versioned independently** in `mcp/package.json`: it is
a dev tool, not part of the design-system surface. Bump `mcp/package.json` and
push; the `decide` job gates it on its own version, so an mcp-only bump releases
without touching the lockstep five (and a lockstep bump leaves mcp alone unless
its version is new). It has its own Trusted Publisher; it was first published
manually, so OIDC now maintains it.

## Where the version lives

The npm build reads its version from `_ds_manifest.json`. These files carry it
and must agree:

| File | Field |
|---|---|
| `_ds_manifest.json` | `version`, **the source the build reads** |
| `package.json` | `version` (tokens, icons, Guard, and CLI workspace versions match it; refresh `package-lock.json` with `npm install --package-lock-only` so its workspace entries follow) |
| `CITATION.cff` | `version` (+ `date-released`) |
| `site/DsSite.dc.html` | JSON-LD `softwareVersion` |
| `CHANGELOG.md` | the release heading |
| `site/Docs.dc.html` | the `X.Y.Z (Month YYYY)` changelog marker the public-facts gate checks |

`npm run check` fails when the manifest and package.json disagree.

## First publish of `@efolusi/meridian-cli`

Done: the owner published `@efolusi/meridian-cli@1.22.0` by hand on 2026-11-18
and added its Trusted Publisher (repository `efolusi/meridian`, workflow
`publish.yml`, environment `npm-publish`). npm keeps a new Trusted Publisher
pending until one workflow publish succeeds, so 1.23.0 is the first release the
pipeline publishes the CLI with. A manual publish of any package uses the Node
version in `.nvmrc`: run `nvm use` (or install that version) before `npm ci`.

## The steps

1. Move CHANGELOG's `Unreleased` content under a `## X.Y.Z — YYYY-MM-DD` heading.
   The workflow lifts this section verbatim into the GitHub Release notes.
2. Bump the version in the five files above.
3. `npm run check`: all gates green, locally, before anything is pushed.
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
  commit being built, so an untagged tree cannot reach the registry.

## When something ships broken

npm allows unpublish only within 72 hours and it is rarely the right call.
Fix forward: bump the patch version, release again. `1.5.0` shipping with a
broken exports map and `1.5.1` correcting it is the precedent.
