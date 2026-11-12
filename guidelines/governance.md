# Governance

Rules for evolving this open-source design system.

## Scope

Meridian covers the common path of a real product surface and declines the speculative and the niche. It is components, tokens and patterns: it does not own routing, data, or state beyond a component's own. It ships no analytics or telemetry into a consumer's page. The npm packages are carved from the same flat sources as the CDN bundle and move in lockstep; the component sources never move into packages.

## Versioning
- Semver. **Patch** = visual bugfix within the spec. **Minor** = new component, prop, or token (additive). **Major** = renamed/removed token or prop, changed default, visual language shift.
- Never repurpose a token's meaning. Add a new one and deprecate the old (see Deprecation).
- Keep a `CHANGELOG.md` entry per release: Added / Changed / Deprecated / Removed.

## Contributing a component
1. Prove need: it must be used by ≥2 product surfaces, or be a documented pattern gap. One-offs stay in product code.
2. Ship the full contract in [CONTRIBUTING.md](../CONTRIBUTING.md) (source, types, prompt guide, specimen) and follow [STYLEGUIDE.md](../STYLEGUIDE.md).

## Do / Don't
- **Do** compose primitives (Menu inside Table rows, Stat inside Card). **Don't** re-implement a primitive inside a kit.
- **Do** use `--space-*` steps. **Don't** invent 13px gaps.
- **Do** keep one primary action per view. **Don't** stack two ink buttons side by side.
- **Do** hairlines for structure. **Don't** add shadows to things that don't float.
- **Don't** introduce gradients, emoji icons, or cool grays: they are outside the language.

## Deprecation
A deprecated prop, component or token keeps working, with a development console warning that names its replacement, until the next major version. Removing it is a major change.

1. Publish the replacement.
2. Migrate every maintained consumer: showcases, starters, blocks and the docs site.
3. Record it under **Deprecated** in `CHANGELOG.md` with the migration, and remove it in the next major.
