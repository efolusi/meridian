# Diff

Unified diff with dual line-number gutters, +/− signs, add/del row tints, and header counts.

`<Diff title="agents/retry.ts" from={'const max = 3;\nreturn run();'} to={'const max = 5;\nreturn run();'} />`

Pass the original and changed text through `from` and `to`; line numbers, change counts, and word-level marks are computed. For non-diff code use CodeBlock.
