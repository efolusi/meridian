import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// The repo has no YAML parser (and no dependency may be added for this), so this reads the one mistake that
// broke CI: a value that starts with a quote, closes it, and carries on, as in
//   run: "$RUNNER_TEMP/pw-node" scripts/check.mjs
// GitHub rejects the whole file ("workflow file issue") and no job runs. A quoted value must end at its closing
// quote, or at a comment. Write the command unquoted, or quote all of it.
const DIR = '.github/workflows';

/** Problems found in one workflow file: [{ line, text }]. */
export function quotedValueProblems(source) {
  const problems = [];
  source.split('\n').forEach((text, index) => {
    const m = text.match(/^\s*(?:-\s+)?[\w.-]+:\s+(["'])/);
    if (!m) return;
    const quote = m[1];
    let i = text.indexOf(quote, m[0].length - 1) + 1;
    let closed = -1;
    for (; i < text.length; i += 1) {
      if (quote === '"' && text[i] === '\\') { i += 1; continue; }
      if (text[i] === quote) {
        if (quote === "'" && text[i + 1] === "'") { i += 1; continue; }
        closed = i;
        break;
      }
    }
    if (closed === -1) return; // a quoted scalar may run on to the next line
    const rest = text.slice(closed + 1).trim();
    if (rest !== '' && !rest.startsWith('#')) problems.push({ line: index + 1, text: text.trim() });
  });
  return problems;
}

describe('quotedValueProblems', () => {
  it('flags a quoted start that carries on after the closing quote', () => {
    expect(quotedValueProblems('        run: "$RUNNER_TEMP/pw-node" scripts/check_reduced_motion.mjs')).toEqual([
      { line: 1, text: 'run: "$RUNNER_TEMP/pw-node" scripts/check_reduced_motion.mjs' },
    ]);
    expect(quotedValueProblems("  - run: 'a' b")).toHaveLength(1);
    expect(quotedValueProblems('name: "a" "b"')).toHaveLength(1);
  });

  it('passes a value that is wholly quoted, wholly plain, or followed by a comment', () => {
    for (const ok of [
      'run: "$RUNNER_TEMP/pw-node scripts/a.mjs"',
      'run: $RUNNER_TEMP/pw-node scripts/a.mjs',
      'run: BUTTON_SHOTS="$RUNNER_TEMP/b" "$RUNNER_TEMP/pw-node" scripts/a.mjs',
      "name: 'it''s fine'",
      'name: "say \\"hi\\""',
      "node-version: '26.13.1' # pinned",
      'with:',
      '  persist-credentials: false',
      'run: |',
    ]) expect(quotedValueProblems(ok), ok).toEqual([]);
  });
});

describe('the workflows', () => {
  const files = readdirSync(DIR).filter((f) => f.endsWith('.yml'));

  it('finds them', () => {
    expect(files).toEqual(expect.arrayContaining(['checks.yml', 'deploy-production.yml', 'publish.yml']));
  });

  it.each(files)('%s has no quoted value that carries on after its closing quote', (file) => {
    expect(quotedValueProblems(readFileSync(`${DIR}/${file}`, 'utf8'))).toEqual([]);
  });
});
