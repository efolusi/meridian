import { constants as fsConstants } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { DiskError, resolveInside, UnsafeError } from './paths.mjs';

export const MAX_FILES = 2000;

// Windows has no O_NOFOLLOW (it is undefined there), so replace() also checks
// the open handle against the path before it truncates anything.
const { O_WRONLY, O_CREAT, O_EXCL, O_NOFOLLOW = 0 } = fsConstants;

// Line endings and a byte-order mark are how a checkout differs on Windows
// (git core.autocrlf, editors), not a change someone made to the file.
const comparable = text => text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');

/**
 * Works out what `add` would do for each file without touching the disk:
 *   create     the file does not exist
 *   unchanged  the file exists with the same content
 *   conflict   the file exists with different content (overwrite=false)
 *   overwrite  the file exists with different content (overwrite=true)
 * Two items that ship the same target with different content are an error.
 */
export async function planWrites(items, dir, { overwrite = false } = {}) {
  const byPath = new Map();
  for (const item of items) {
    for (const file of item.files) {
      const absolute = await resolveInside(dir, file.target);
      // NTFS and default macOS volumes ignore case, so Button.jsx and button.jsx
      // are one file there. Key on the folded path and refuse two spellings.
      const key = absolute.toLowerCase();
      const previous = byPath.get(key);
      if (previous) {
        if (previous.target !== file.target) {
          throw new UnsafeError(`${previous.item} writes ${previous.target} and ${item.name} writes ${file.target}, the same file on case-insensitive disks`);
        }
        if (previous.content !== file.content) {
          throw new UnsafeError(`${previous.item} and ${item.name} both write ${file.target} with different content`);
        }
        continue;
      }
      byPath.set(key, { path: absolute, target: file.target, item: item.name, content: file.content });
      if (byPath.size > MAX_FILES) throw new UnsafeError(`more than ${MAX_FILES} files to write; the registry looks wrong`);
    }
  }

  const plan = [];
  for (const entry of byPath.values()) {
    let existing = null;
    try {
      existing = await fs.readFile(entry.path, 'utf8');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    const status = existing === null ? 'create'
      : comparable(existing) === comparable(entry.content) ? 'unchanged'
        : overwrite ? 'overwrite' : 'conflict';
    plan.push({ ...entry, status });
  }
  return plan;
}

/**
 * Writes every create and overwrite entry. Call only on a plan without conflicts.
 * If a write fails (a file locked by an editor, a read-only file), the error
 * carries `written`, the entries already written, so the caller can say so.
 * `noFollow` exists for tests that simulate a platform without O_NOFOLLOW.
 */
export async function applyPlan(plan, dir, { noFollow = O_NOFOLLOW } = {}) {
  if (plan.some(entry => entry.status === 'conflict')) throw new Error('refusing to apply a plan with conflicts');
  const written = [];
  for (const entry of plan) {
    if (entry.status !== 'create' && entry.status !== 'overwrite') continue;
    try {
      // Check again right before writing: a directory made for an earlier file,
      // or a link created since planning, must not move the write elsewhere.
      const absolute = await resolveInside(dir, entry.target);
      await fs.mkdir(path.dirname(absolute), { recursive: true });
      await resolveInside(dir, entry.target);
      if (entry.status === 'create') {
        // O_EXCL fails on anything already there, a link included.
        await fs.writeFile(absolute, entry.content, { flag: O_WRONLY | O_CREAT | O_EXCL | noFollow });
      } else {
        await replace(absolute, entry.content, noFollow);
      }
    } catch (error) {
      error.written = written;
      throw error;
    }
    written.push(entry);
  }
  return written;
}

/**
 * Overwrites an existing regular file without following a link swapped in after
 * the checks. O_NOFOLLOW refuses a link at open time where the platform has it.
 * Everywhere, the handle is compared with the path before anything is truncated:
 * the path must still not be a link and must be the same file as the handle.
 */
async function replace(absolute, content, noFollow) {
  const handle = await fs.open(absolute, O_WRONLY | noFollow);
  try {
    const [opened, named] = await Promise.all([handle.stat(), fs.lstat(absolute)]);
    if (named.isSymbolicLink() || !opened.isFile() || opened.ino !== named.ino || opened.dev !== named.dev) {
      throw new DiskError(`${absolute} changed while it was being written; nothing was replaced`);
    }
    await handle.truncate(0);
    await handle.writeFile(content);
  } finally {
    await handle.close();
  }
}
