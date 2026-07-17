# Governance

Rules for evolving this open-source design system.

## Versioning
- Semver. **Patch** = visual bugfix within the spec. **Minor** = new component, prop, or token (additive). **Major** = renamed/removed token or prop, changed default, visual language shift.
- Never repurpose a token's meaning — add a new one and deprecate the old (keep the alias one major version).
- Keep a `CHANGELOG.md` entry per release: Added / Changed / Deprecated / Removed.

## Contributing a component
1. Prove need: it must be used by ≥2 product surfaces, or be a documented pattern gap. One-offs stay in product code.
2. Ship the full contract: `<Name>.jsx` + `<Name>.d.ts` + `<Name>.prompt.md` + coverage in the group's card HTML.
3. Style with semantic tokens only (`--surface-*`, `--text-*`, `--border-*`, `--accent*`) — raw ramp values (`--sand-400`) only when the semantic layer genuinely has no slot. This is what keeps dark theme free.
4. States are non-negotiable: hover, press (scale .985), focus-visible ring, disabled (.45 opacity), and loading where async.
5. Follow the voice: sentence case, verbs on buttons, no emoji.

## Do / Don't
- **Do** compose primitives (Menu inside Table rows, Stat inside Card). **Don't** re-implement a primitive inside a kit.
- **Do** use `--space-*` steps. **Don't** invent 13px gaps.
- **Do** keep one primary action per view. **Don't** stack two ink buttons side by side.
- **Do** hairlines for structure. **Don't** add shadows to things that don't float.
- **Don't** introduce gradients, emoji icons, or cool grays — they are outside the language.

## Deprecation
Mark the prop/component `@deprecated` in `.d.ts` with the replacement, keep it working for one major version, delete in the next.
