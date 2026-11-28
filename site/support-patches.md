# Patches to the vendored page runtime

`support.js` is generated from `dc-runtime/src/*.ts` (see its first line) and copied, byte for byte, into `site/` and every starter (`scripts/check_runtime_copies.py` fails a copy that differs). A change here is a patch on a generated file: it is written down in this note and applied to all ten copies in one change, until the same change lands in `dc-runtime` and the next rebuild carries it.

| Patch | Where | Why | Row |
|---|---|---|---|
| The placeholder shimmer `sc-shine` runs on `linear`, not `ease` | `BASE_CSS`, the rule `html.sc-dc-streaming .sc-placeholder::before`: `animation: sc-shine 1.4s linear infinite` | A loop has no ease (better-motion, `guidelines/motion.md`): `ease` slows the sweep at both ends and makes the shimmer pulse. The period stays 1.4 s, `--dur-loop`. | MD130, 2026-11-28 |

Upstream: make the same one-word change in `dc-runtime/src/boot.ts` (`animation:sc-shine 1.4s ease infinite`), rebuild with `cd dc-runtime && bun run build`, and delete the row above. Under reduced motion `tokens/base.css` stills the placeholder pseudo-element (it is not a loading loop of the library), so no query is added here.
