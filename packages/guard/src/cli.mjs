import path from 'node:path';
import { guard } from './scanner.mjs';
import { formatJson, formatPretty } from './reporter.mjs';

const HELP = `Meridian Guard — validate React code against Meridian contracts

Usage:
  meridian-guard [path ...] [--format pretty|json]

Options:
  --format <name>  Output format: pretty (default) or json
  --help           Show this help
  --version        Show the Guard rule-pack version
`;

function parseArgs(argv) {
  const paths = [];
  let format = 'pretty';
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--help' || arg === '-h') return { help: true, paths, format };
    if (arg === '--version' || arg === '-v') return { version: true, paths, format };
    if (arg === '--format') {
      format = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg.startsWith('--format=')) {
      format = arg.slice('--format='.length);
      continue;
    }
    if (arg.startsWith('-')) throw new Error(`unknown option ${arg}`);
    paths.push(arg);
  }
  if (!['pretty', 'json'].includes(format)) throw new Error(`unknown format ${format}`);
  return { paths, format };
}

export async function main(argv, io = process) {
  const options = parseArgs(argv);
  if (options.help) {
    io.stdout.write(HELP);
    return;
  }
  const { default: contracts } = await import('./generated/meridian-rules.json', { with: { type: 'json' } });
  if (options.version) {
    io.stdout.write(`${contracts.version}\n`);
    return;
  }
  const cwd = process.cwd();
  const targets = (options.paths.length ? options.paths : ['.']).map(target => path.resolve(cwd, target));
  const result = await guard(targets, { contracts });
  io.stdout.write(options.format === 'json' ? formatJson(result) : formatPretty(result, cwd));
  if (result.diagnostics.length > 0) io.exitCode = 1;
}
