// Does `specifier` resolve, through the package "exports" map, to a file that
// exists, as seen from a module in `dir`?
//
// Resolution runs in a fresh node process, so no module cache or test-runner
// resolver is involved. Any resolution error means "no": the earlier inline
// version treated every error except ERR_MODULE_NOT_FOUND as success, which
// passed ERR_PACKAGE_PATH_NOT_EXPORTED, the exact failure an exports-map check
// exists to catch. import.meta.resolve does not check that a mapped target
// exists, so that is checked here too.
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
