#!/usr/bin/env node
/**
 * Run every gate CI runs, in one command.
 *
 * The gates are split across two workflows with different lists: checks.yml runs
 * three generators that publish.yml does not. Running the publish list and
 * concluding the tree is clean is a mistake that has already been made twice,
 * and it is not a mistake anyone can be told out of, because the two lists look
 * interchangeable until one of them fails.
 *
 * So this is the list, in one place. `npm run check` before every push.
 *
 * Not covered: the Playwright smoke job, which needs a browser download and a
 * served repo. It is reported at the end rather than silently omitted, because
 * a check script that quietly skips something is worse than no script.
 *
 *   node scripts/check_all.mjs           run everything
 *   node scripts/check_all.mjs --fix     regenerate first, then verify
 */
import { execFileSync } from 'node:child_process'
import { relative } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const FIX = process.argv.includes('--fix')

/**
 * Generators own their output files. Running them must leave the tree
 * unchanged; if it does not, the committed output is stale. This is exactly
 * what the "Registry is in sync with its generator" gate checks, and it is the
 * one most easily forgotten because nothing in a component diff hints that a
 * JSON file somewhere else also has to move.
 */
const GENERATORS = [
  ['python3', ['scripts/build_registry.py']],
  ['python3', ['scripts/build_tokens.py']],
  ['python3', ['scripts/build_interfaces.py']],
  ['python3', ['scripts/build_llms.py']],
]

/**
 * Everything the generators above write. Staleness is judged by comparing these
 * against HEAD after regenerating, which is what CI effectively does from a
 * clean checkout.
 *
 * Comparing against a snapshot of what was dirty *before* the run reads more
 * naturally and is wrong: regenerate once without committing and the file is
 * already dirty, so the second run sees no new change and reports success. This
 * script did exactly that and passed on a tree it should have rejected.
 */
const GENERATED_PATHS = [
  'site/registry',
  'site/registry.json',
  'site/interfaces.json',
  'tokens.json',
  'tailwind.preset.js',
  'llms-full.txt',
]

const GATES = [
  ['Contrast (WCAG AA token pairs)', 'python3', ['scripts/check_contrast.py']],
  ['Runtime copies', 'python3', ['scripts/check_runtime_copies.py']],
  ['Relative paths resolve', 'python3', ['scripts/check_paths.py']],
  ['Manifest inventories', 'python3', ['scripts/sync_manifest.py', '--check']],
  ['No dead interactive controls', 'python3', ['scripts/check_dead_controls.py']],
  ['No new raw colour literals', 'python3', ['scripts/check_token_adherence.py']],
  ['Bundle source hashes', 'python3', ['scripts/check_bundle_hashes.py']],
  ['Bundle reproducible from source', 'node', ['scripts/build_bundle.mjs', '--check']],
  ['Unit tests', 'npm', ['test', '--silent']],
  ['npm package builds', 'node', ['scripts/build_npm.mjs']],
  ['npm package imports', 'node', ['scripts/check_npm_package.mjs']],
  ['Bundle and package size budget', 'node', ['scripts/check_size.mjs']],
  ['Types compile', 'node', ['scripts/check_types.mjs']],
]

function run(cmd, args) {
  try {
    execFileSync(cmd, args, { cwd: ROOT, stdio: 'pipe', encoding: 'utf8' })
    return { ok: true, output: '' }
  } catch (error) {
    return { ok: false, output: `${error.stdout ?? ''}${error.stderr ?? ''}`.trimEnd() }
  }
}

/** Generator outputs that differ from HEAD, i.e. that still need committing. */
function staleGeneratedFiles() {
  const out = execFileSync('git', ['status', '--porcelain', '--', ...GENERATED_PATHS], {
    cwd: ROOT,
    encoding: 'utf8',
  })
  return out
    .split('\n')
    .filter(Boolean)
    .map((line) => line.slice(3).trim())
}

const failures = []

process.stdout.write(`generators${FIX ? ' (--fix)' : ''}\n`)
for (const [cmd, args] of GENERATORS) {
  const label = relative('scripts', args[0])
  const result = run(cmd, args)
  process.stdout.write(`  ${result.ok ? 'ok  ' : 'FAIL'} ${label}\n`)
  if (!result.ok) failures.push([label, result.output])
}

const stale = staleGeneratedFiles()
if (stale.length > 0) {
  if (FIX) {
    process.stdout.write(`  regenerated ${stale.length} file(s):\n`)
    for (const f of stale) process.stdout.write(`    ${f}\n`)
    process.stdout.write('  review and commit them\n')
  } else {
    failures.push([
      'generated output is stale',
      'These are generator outputs and must be committed alongside the change\n' +
        'that moved them:\n' +
        stale.map((f) => `  ${f}`).join('\n') +
        '\n\nRe-run with --fix, review the diff, and commit.',
    ])
    process.stdout.write(`  FAIL generated output is stale (${stale.length} file(s))\n`)
  }
}

process.stdout.write('\ngates\n')
for (const [label, cmd, args] of GATES) {
  const result = run(cmd, args)
  process.stdout.write(`  ${result.ok ? 'ok  ' : 'FAIL'} ${label}\n`)
  if (!result.ok) failures.push([label, result.output])
}

process.stdout.write('\n')
if (failures.length > 0) {
  for (const [label, output] of failures) {
    process.stdout.write(`\n--- ${label} ---\n${output || '(no output)'}\n`)
  }
  process.stdout.write(`\n${failures.length} check(s) failed\n`)
  process.exit(1)
}

process.stdout.write('all checks passed\n')
process.stdout.write(
  'note: the Playwright smoke job is not run here and only runs in CI ' +
    '(scripts/smoke_headless.mjs against a served repo)\n',
)
