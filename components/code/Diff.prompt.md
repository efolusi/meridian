# Diff

Unified diff with dual line-number gutters, +/− signs, add/del row tints, and header counts.

`<Diff title="agents/retry.ts" from={'const max = 3;\nreturn run();'} to={'const max = 5;\nreturn run();'} />`

Pass the original and changed text through `from` and `to`; line numbers, change counts, and word-level marks are computed. For non-diff code use CodeBlock.

The scrolling part is a keyboard-focusable `region` so the diff can be scrolled with the arrow keys. A single diff is named by `aria-label` or `aria-labelledby`; without either it takes `title` when that is a string, else `Diff`. With `files`, each open file is a region named after the file.
