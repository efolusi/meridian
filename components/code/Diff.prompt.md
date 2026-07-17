# Diff

Unified diff with dual line-number gutters, +/− signs, add/del row tints, and header counts.

`<Diff title="agents/retry.ts" lines={[{ text: 'const max = 3;', type: 'del' }, { text: 'const max = 5;', type: 'add' }, { text: 'return run();' }]} />`

Pass lines in display order; numbering is computed. For non-diff code use CodeBlock.