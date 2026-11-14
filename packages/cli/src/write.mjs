import fs from 'node:fs/promises';
import path from 'node:path';
import { resolveInside, UnsafeError } from './paths.mjs';

export const MAX_FILES = 2000;

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
      const previous = byPath.get(absolute);
      if (previous) {
        if (previous.content !== file.content) {
          throw new UnsafeError(`${previous.item} and ${item.name} both write ${file.target} with different content`);
        }
        continue;
      }
      byPath.set(absolute, { path: absolute, target: file.target, item: item.name, content: file.content });
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
    const status = existing === null ? 'create' : existing === entry.content ? 'unchanged' : overwrite ? 'overwrite' : 'conflict';
    plan.push({ ...entry, status });
  }
  return plan;
}

/** Writes every create and overwrite entry. Call only on a plan without conflicts. */
export async function applyPlan(plan, dir) {
  if (plan.some(entry => entry.status === 'conflict')) throw new Error('refusing to apply a plan with conflicts');
  const written = [];
  for (const entry of plan) {
    if (entry.status !== 'create' && entry.status !== 'overwrite') continue;
    // Check again right before writing: a directory made for an earlier file,
    // or a link created since planning, must not move the write elsewhere.
    const absolute = await resolveInside(dir, entry.target);
    await fs.mkdir(path.dirname(absolute), { recursive: true });
    await resolveInside(dir, entry.target);
    await fs.writeFile(absolute, entry.content, { flag: entry.status === 'create' ? 'wx' : 'w' });
    written.push(entry);
  }
  return written;
}
