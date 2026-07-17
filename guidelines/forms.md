# Forms

The validation pattern every Efolusi form follows.

## Structure
- Label above field (Input/Select/Textarea `label` prop), optional `hint` below. 14px controls, `--control-h-md` default; `lg` for auth/marketing.
- One column. Related short fields (city/zip) may share a row; never three-up.
- One primary action, right-aligned, verb label ("Create account"). Ghost "Cancel" to its left.

## Validation timing
1. **On blur**, not on keystroke — don't flag half-typed emails.
2. Once a field has erred, re-validate **on change** so the error clears the moment it's fixed.
3. **On submit**, validate everything; if ≥2 errors, add a summary `Alert tone="danger"` above the form ("Fix 2 fields to continue") and move focus to it.

## Error copy
Field `error` prop: what happened + how to fix, ≤ 90 chars, no blame, no codes. "That email is already in use. Try signing in instead." — never "Invalid input".

## Submit states
- Busy: `Button loading` (spinner replaces icon, button disables). Keep the label.
- Success: navigate, or `Toast tone="success"` when staying put.
- Server failure: `Alert tone="danger"` above the form with a retry path; keep user input intact.

## Async checks
Inline availability checks (workspace name, email) show `Spinner size={14}` right of the label while pending; resolve to `hint` ("efolusi.com/acme is available") or `error`.
