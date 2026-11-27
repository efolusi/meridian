# Diff

Unified diff with dual line-number gutters, +/− signs, add/del row tints, and header counts.

`<Diff title="agents/retry.ts" from={'const max = 3;\nreturn run();'} to={'const max = 5;\nreturn run();'} />`

Pass the original and changed text through `from` and `to`; line numbers, change counts, and word-level marks are computed. For non-diff code use CodeBlock.

The scrolling part is keyboard-focusable so the diff can be scrolled with the arrow keys. A single diff is a `region` when you pass `aria-label` or `aria-labelledby`; otherwise it is a `group` named by `title` when that is a string, else `Diff` (set the words with `label`). With `files`, each open file is a `group` named after the file, so a long list adds no landmarks.
