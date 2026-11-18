# Governance

Rules for evolving this open-source design system.

## Scope

Meridian covers the common path of a real product surface and declines the speculative and the niche. It is components, tokens and patterns: it does not own routing, data, or state beyond a component's own. It ships no analytics or telemetry into a consumer's page. The npm packages are carved from the same flat sources as the CDN bundle and move in lockstep; the component sources never move into packages.

## Versioning
- Semver. **Patch** = visual bugfix within the spec. **Minor** = new component, prop, or token, or a breaking change while Meridian is used only inside Efolusi (see Breaking changes). **Major** = a breaking change once Meridian has outside users, or a visual language shift.
- Never repurpose a token's meaning. Add a new one and remove the old in the same change.
- Keep a `CHANGELOG.md` entry per release. Mark each breaking change **Breaking** and give the old and new name.

## Contributing a component
1. Prove need: it must be used by ≥2 product surfaces, or be a documented pattern gap. One-offs stay in product code.
2. Ship the full contract in [CONTRIBUTING.md](../CONTRIBUTING.md) (source, types, prompt guide, specimen) and follow [STYLEGUIDE.md](../STYLEGUIDE.md).

## Do / Don't
- **Do** compose primitives (Menu inside Table rows, Stat inside Card). **Don't** re-implement a primitive inside a kit.
- **Do** use `--space-*` steps. **Don't** invent 13px gaps.
- **Do** keep one primary action per view. **Don't** stack two ink buttons side by side.
- **Do** hairlines for structure. **Don't** add shadows to things that don't float.
- **Don't** introduce gradients, emoji icons, or cool grays: they are outside the language.

## Breaking changes
Meridian keeps no legacy code: no aliases for renamed props or tokens, no deprecation warnings, no shims kept until a later release.

1. Rename or remove in one change, and update every caller in the same change: components, showcases, starters, blocks, the docs site, tests and skills.
2. Mark it **Breaking** in `CHANGELOG.md` with the old and new name.
3. Add a section with before and after code to [migration.md](migration.md).
4. List the product repos that use the old name, so each updates when it moves to that release.
