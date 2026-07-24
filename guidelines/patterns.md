# Patterns

The product-state playbook: how to reach for the right component when there is nothing yet, something is loading, something went wrong, or something is about to be destroyed. Forms have their own page (`forms.md`); this covers the states around them.

## Loading

Match the placeholder to what you know.

- **Known shape, content will fill in** (a card, a table, a list): `Skeleton`, shaped like the real content. Never a spinner over a layout you can already draw.
- **Inline or in a control**: `Spinner` (small, next to text) or `Button loading` (the spinner replaces the icon, the button disables, the label stays).
- **A whole region with no known shape**: `Loader` with a label saying what is happening.
- Do not stack spinners. One region, one loading affordance. Skeletons may tile.

## Empty

`EmptyState` (`icon`, `title`, `description`, `action`). Three empties, three tones:

- **First run** (nothing created yet): warm, one clear `action` to create the first thing. Not an apology.
- **No results** (a filter or search matched nothing): say what was searched, offer to clear it. No primary action to "create".
- **Failed to load**: this is an error, not an empty. Use the error pattern below, with a retry.

## Errors

By how long the message should live:

- **Persistent, in place**: `Alert` inside the page (an invalid section, a degraded feature) or `Banner` across the top (account-wide: billing, an outage). Both pair colour with an icon; never colour alone.
- **Transient, after an action**: `Toast tone="danger"` through `Toaster`. A toast that carries an action never auto-dismisses (WCAG 2.2.1); a plain one fades.
- **A thrown error with a stack** (dev surfaces, logs): `Exception` in the `code` group.
- **A field**: `FormField` / control `error` prop. Timing and copy live in `forms.md`.

Error copy everywhere: what happened, then how to fix it. No codes, no blame.

## Destructive

- `ConfirmDialog`, `tone="danger"`, a verb-labelled confirm ("Delete workspace", not "OK").
- High stakes (deleting data others depend on): `typeToConfirm` with the resource's name, so muscle memory cannot fire it.
- Never move focus onto the destructive button on open; focus lands on the panel, the safe path (Cancel / the type-to-confirm field) is first.
- Report the result: a `Toast` on success, an `Alert` if it half-failed.

## Agent surfaces

The `ai/` group is the differentiator, and agent UX has its own states. Reach for:

- **Thinking**: `Reasoning` (collapsible, streams, shows elapsed) rather than a bare spinner while a model works.
- **Acting with consequences**: `ToolCall` gates a tool behind approve/reject; `Confirmation` is the inline yes/no; `AgentRun` shows the run as collapsible steps.
- **Streaming output**: the scrolling surface is a `role="log"` live region (`Terminal`, `Console`), so a screen reader hears new lines without losing place.

Every one of these is keyboard-operable and announced; see `accessibility.md` for the per-component contracts.
