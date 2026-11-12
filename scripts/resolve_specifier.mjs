// Does `specifier` resolve through the exports map, from `dir`, to a file that exists?
// A fresh process avoids module caches; import.meta.resolve does not check that the target exists.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

export async function resolvesByName(dir, specifier) {
  const child = spawnSync(
    process.execPath,
    ['--input-type=module', '-e', `process.stdout.write(import.meta.resolve(${JSON.stringify(specifier)}))`],
    { cwd: dir, encoding: 'utf8' },
  );
  if (child.status !== 0 || !child.stdout.startsWith('file:')) return false;
  return fs.existsSync(fileURLToPath(child.stdout));
}
