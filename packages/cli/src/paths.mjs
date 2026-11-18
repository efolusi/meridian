import { realpath as realpathCallback } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

// Registry JSON is untrusted input: an item name becomes part of a URL or a
// file name, and a file target becomes a path on the user's disk. Everything
// that reaches the file system goes through the checks in this module.

const ITEM_NAME = /^[a-z0-9][a-z0-9-]{0,99}$/;
const SEGMENT = /^[A-Za-z0-9._@+-]+$/;
const WINDOWS_DEVICE = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\.|$)/i;

/** Throws unless `name` is a plain registry item name such as `button`. */
export function assertItemName(name) {
  if (typeof name !== 'string' || !ITEM_NAME.test(name)) {
    throw new UnsafeError(`invalid item name ${JSON.stringify(name)}: use lowercase letters, digits and hyphens`);
  }
  return name;
}

/**
 * Checks a file target from a registry item and returns it in normalised
 * POSIX form. Rejects anything that could land outside the target directory
 * before the disk is consulted: absolute paths, drive letters, backslashes,
 * NUL and other control characters, `.` or `..` segments, any character
 * outside `A-Za-z0-9._@+-`, names ending in `.`, `.git`, and Windows device
 * names such as `nul`.
 */
export function checkTarget(target) {
  if (typeof target !== 'string' || target.length === 0 || target.length > 400) {
    throw new UnsafeError(`invalid file target ${JSON.stringify(target)}`);
  }
  if (/[\u0000-\u001f\u007f]/.test(target)) throw new UnsafeError(`file target contains a control character: ${JSON.stringify(target)}`);
  if (target.includes('\\')) throw new UnsafeError(`file target contains a backslash: ${JSON.stringify(target)}`);
  if (target.startsWith('/') || /^[a-zA-Z]:/.test(target)) {
    throw new UnsafeError(`file target is absolute: ${JSON.stringify(target)}`);
  }
  const segments = target.split('/');
  for (const segment of segments) {
    if (segment === '..' || segment === '.' || segment === '') {
      throw new UnsafeError(`file target has an empty, "." or ".." segment: ${JSON.stringify(target)}`);
    }
    // ASCII only: no lookalike dots or slashes, no bidi or zero-width
    // characters, no `%` escapes, no `:` (an NTFS stream or drive).
    if (!SEGMENT.test(segment)) {
      throw new UnsafeError(`file target may only use A-Z a-z 0-9 . _ @ + - in each folder or file name: ${JSON.stringify(target)}`);
    }
    // Windows drops trailing dots, so `...` or `x.` would not name what it seems to.
    if (segment.endsWith('.')) throw new UnsafeError(`file target has a name ending in ".": ${JSON.stringify(target)}`);
    if (segment.toLowerCase() === '.git') throw new UnsafeError(`file target writes into .git: ${JSON.stringify(target)}`);
    if (WINDOWS_DEVICE.test(segment)) throw new UnsafeError(`file target uses a Windows device name: ${JSON.stringify(target)}`);
  }
  return segments.join('/');
}

function isInside(root, candidate) {
  const rel = path.relative(root, candidate);
  // A real parent step is '..' alone or followed by a separator; '..foo' is a
  // folder name inside root.
  return rel === '' || (rel !== '..' && !rel.startsWith(`..${path.sep}`) && !path.isAbsolute(rel));
}

// The native realpath fails with EISDIR on Windows volumes whose driver lacks
// GetFinalPathNameByHandle (RAM disks, some virtual and network drives). The JS
// implementation walks the path with lstat and readlink and works there.
const jsRealpath = promisify(realpathCallback);
async function realpath(p) {
  try {
    return await fs.realpath(p);
  } catch (error) {
    if (process.platform === 'win32' && (error.code === 'EISDIR' || error.code === 'EINVAL')) return jsRealpath(p);
    throw error;
  }
}

/**
 * Resolves a checked target under `dir` and confirms that writing it stays
 * inside `dir` on disk: the deepest existing ancestor must resolve (through
 * any symlinks) to a place inside the real `dir`, and the file itself must
 * not be a symlink. Returns the absolute path to write.
 */
export async function resolveInside(dir, target) {
  const rel = checkTarget(target);
  const root = path.resolve(dir);
  const absolute = path.resolve(root, ...rel.split('/'));
  if (!isInside(root, absolute) || absolute === root) {
    throw new UnsafeError(`file target resolves outside ${root}: ${JSON.stringify(target)}`);
  }

  let realRoot;
  try {
    realRoot = await realpath(root);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    // The directory does not exist yet, so nothing under it can be a link.
    return absolute;
  }

  try {
    const stat = await fs.lstat(absolute);
    if (stat.isSymbolicLink()) throw new DiskError(`refusing to write through a symlink: ${absolute}`);
    if (!stat.isFile()) throw new DiskError(`target exists and is not a regular file: ${absolute}`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  let probe = path.dirname(absolute);
  for (;;) {
    try {
      const real = await realpath(probe);
      if (!isInside(realRoot, real)) {
        throw new DiskError(`file target resolves outside ${root} through a symlink: ${JSON.stringify(target)}`);
      }
      return absolute;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      probe = path.dirname(probe);
    }
  }
}

/** Registry content that must not be acted on. */
export class UnsafeError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnsafeError';
  }
}

/** The target directory on disk would send a write somewhere unsafe. */
export class DiskError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DiskError';
  }
}
