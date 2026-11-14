import fs from 'node:fs';
import path from 'node:path';
import { DiskError, UnsafeError } from './paths.mjs';
import { DEFAULT_REGISTRY, openRegistry, RegistryError } from './registry.mjs';
import { npmDependencies, resolveItems } from './resolve.mjs';
import { applyPlan, planWrites } from './write.mjs';

export const EXIT = Object.freeze({
  OK: 0,
  CONFLICT: 1,
  USAGE: 2,
  REGISTRY: 3,
  DISK: 4,
});

const HELP = `meridian: copy Meridian components into your project

Usage:
  meridian add <name...> [options]   copy items and the items they depend on
  meridian list [options]            show every item with a one-line description

Options:
  --registry <url|dir>  registry folder (default ${DEFAULT_REGISTRY})
                        an http(s) URL or a local directory of <name>.json items
  --dir <path>          where files are written (default: current directory)
  --dry-run             show what add would write, write nothing
  --overwrite           replace files that exist with different content
  -h, --help            show this help
  -v, --version         show the CLI version

Exit codes:
  0  done
  1  files already exist with different content; nothing was written
  2  usage error
  3  registry error: unreachable, item not found, or unsafe item content
  4  file system error, or a target that leaves --dir through a symlink

add does not run npm install. It prints the packages to install.
`;

class UsageError extends Error {}

function parseArgs(argv) {
  const options = { names: [], registry: DEFAULT_REGISTRY, dir: '.', dryRun: false, overwrite: false };
  const takeValue = (flag, index) => {
    const value = argv[index + 1];
    if (value === undefined || value.startsWith('-')) throw new UsageError(`${flag} needs a value`);
    return value;
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '-h' || arg === '--help') return { help: true };
    if (arg === '-v' || arg === '--version') return { version: true };
    if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--overwrite') options.overwrite = true;
    else if (arg === '--registry' || arg === '--dir') {
      options[arg.slice(2)] = takeValue(arg, index);
      index += 1;
    } else if (arg.startsWith('--registry=')) options.registry = arg.slice('--registry='.length);
    else if (arg.startsWith('--dir=')) options.dir = arg.slice('--dir='.length);
    else if (arg.startsWith('-')) throw new UsageError(`unknown option ${arg}`);
    else if (!options.command) options.command = arg;
    else options.names.push(arg);
  }
  if (!options.registry) throw new UsageError('--registry needs a value');
  if (!options.dir) throw new UsageError('--dir needs a value');
  if (!options.command) return { help: true, missing: true };
  if (options.command === 'ls') options.command = 'list';
  if (options.command !== 'add' && options.command !== 'list') throw new UsageError(`unknown command ${options.command}`);
  if (options.command === 'add' && options.names.length === 0) throw new UsageError('add needs at least one item name, for example: meridian add button');
  if (options.command === 'list' && options.names.length) throw new UsageError('list takes no item names');
  if (!/^https?:\/\//i.test(options.registry) && /^[a-z][a-z0-9+.-]+:/i.test(options.registry)) {
    throw new UsageError(`--registry must be an http(s) URL or a local directory, not ${JSON.stringify(options.registry)}`);
  }
  return options;
}

function version() {
  const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  return pkg.version;
}

/**
 * Registry text shown in a terminal: one line, no control characters, and
 * no bidi or zero-width characters that could make it read differently.
 */
function plain(text) {
  return String(text)
    .replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁠-⁩﻿]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * An npm spec for the printed install command. Ranges such as `>=1 <2` hold
 * characters a shell treats as operators, so those specs are double-quoted;
 * the spec pattern already excludes `"`, `$`, backtick, `\`, `!` and `%`.
 */
function shellArg(spec) {
  return /^[A-Za-z0-9@/._~^=+-]+$/.test(spec) ? spec : `"${spec}"`;
}

async function list(options, io) {
  const registry = await openRegistry(options.registry, { fetchImpl: io.fetchImpl });
  const items = await registry.index();
  const width = Math.min(32, Math.max(0, ...items.map(item => item.name.length)));
  for (const item of items) io.stdout.write(`${item.name.padEnd(width)}  ${plain(item.description)}\n`);
  return EXIT.OK;
}

async function add(options, io) {
  const registry = await openRegistry(options.registry, { fetchImpl: io.fetchImpl });
  const dir = path.resolve(io.cwd, options.dir);
  const items = await resolveItems(options.names, registry);
  const plan = await planWrites(items, dir, { overwrite: options.overwrite });
  const out = line => io.stdout.write(`${line}\n`);

  out(`Items: ${items.map(item => item.name).join(', ')}`);
  out(`Target: ${dir}`);

  const conflicts = plan.filter(entry => entry.status === 'conflict');
  if (conflicts.length) {
    io.stderr.write(`${conflicts.length} file(s) already exist with different content:\n`);
    for (const entry of conflicts) io.stderr.write(`  ${entry.target}\n`);
    io.stderr.write('Nothing was written. Pass --overwrite to replace them, or --dir to write somewhere else.\n');
    return EXIT.CONFLICT;
  }

  const verb = { create: options.dryRun ? 'would create' : 'created', overwrite: options.dryRun ? 'would replace' : 'replaced', unchanged: 'unchanged' };
  if (!options.dryRun) await applyPlan(plan, dir);
  const width = Math.max(...Object.values(verb).map(word => word.length));
  for (const entry of plan) out(`  ${verb[entry.status].padEnd(width)}  ${entry.target}`);

  const changed = plan.filter(entry => entry.status !== 'unchanged').length;
  out(options.dryRun ? `Dry run: ${changed} file(s) would be written. Nothing was written.` : `${changed} file(s) written, ${plan.length - changed} unchanged.`);

  const packages = npmDependencies(items);
  if (packages.length) {
    out('These files import npm packages. Install them if your project does not have them yet:');
    out(`  npm install ${packages.map(shellArg).join(' ')}`);
  }
  return EXIT.OK;
}

/** Runs the CLI and resolves to its exit code. */
export async function main(argv, io = {}) {
  const env = {
    stdout: io.stdout ?? process.stdout,
    stderr: io.stderr ?? process.stderr,
    cwd: io.cwd ?? process.cwd(),
    fetchImpl: io.fetchImpl ?? globalThis.fetch,
  };
  let options;
  try {
    options = parseArgs(argv);
  } catch (error) {
    if (!(error instanceof UsageError)) throw error;
    env.stderr.write(`meridian: ${error.message}\nRun meridian --help for usage.\n`);
    return EXIT.USAGE;
  }
  if (options.help) {
    (options.missing ? env.stderr : env.stdout).write(HELP);
    return options.missing ? EXIT.USAGE : EXIT.OK;
  }
  if (options.version) {
    env.stdout.write(`${version()}\n`);
    return EXIT.OK;
  }
  try {
    return options.command === 'list' ? await list(options, env) : await add(options, env);
  } catch (error) {
    // Messages can quote registry text, so they get the same cleanup as list.
    env.stderr.write(`meridian: ${plain(error.message)}\n`);
    if (error instanceof RegistryError || error instanceof UnsafeError) return EXIT.REGISTRY;
    return EXIT.DISK;
  }
}
