import fs from 'node:fs/promises';
import path from 'node:path';
import { assertItemName, checkTarget, UnsafeError } from './paths.mjs';

export const DEFAULT_REGISTRY = 'https://meridian.efolusi.com/site/registry/';
export const MAX_RESPONSE_BYTES = 4 * 1024 * 1024;
const MAX_REDIRECTS = 5;
const TIMEOUT_MS = 30_000;

/** The registry could not be read, or an item was not in it. */
export class RegistryError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RegistryError';
  }
}

/**
 * Opens a registry from `--registry`: an http(s) URL of the folder that holds
 * `<name>.json` items, or a local directory with the same layout. The index
 * used by `list` is `registry.json` next to that folder, which is how the
 * hosted site lays it out (`/site/registry.json` beside `/site/registry/`).
 */
export async function openRegistry(location = DEFAULT_REGISTRY, { fetchImpl = globalThis.fetch } = {}) {
  if (typeof location !== 'string' || location.length === 0) throw new RegistryError('--registry needs a URL or a directory');
  if (/^https?:\/\//i.test(location)) {
    const base = new URL(location.endsWith('/') ? location : `${location}/`);
    if (base.username || base.password) throw new RegistryError('--registry URL must not carry credentials');
    return httpRegistry(base, fetchImpl);
  }
  // Any other scheme (file:, ftp:, data:, ...). One letter is a Windows drive.
  if (/^[a-z][a-z0-9+.-]+:/i.test(location)) {
    throw new RegistryError(`unsupported --registry ${JSON.stringify(location)}: use an http(s) URL or a local directory`);
  }
  const dir = path.resolve(location);
  let stat;
  try {
    stat = await fs.stat(dir);
  } catch {
    throw new RegistryError(`registry directory not found: ${dir}`);
  }
  if (!stat.isDirectory()) throw new RegistryError(`--registry is not a directory: ${dir}`);
  return localRegistry(dir);
}

function httpRegistry(base, fetchImpl) {
  if (typeof fetchImpl !== 'function') throw new RegistryError('this Node.js has no global fetch; use Node.js 20.10 or newer');
  return {
    kind: 'url',
    location: base.href,
    base,
    async item(name) {
      assertItemName(name);
      const url = new URL(`${name}.json`, base);
      const text = await fetchText(url, fetchImpl, { notFound: () => new RegistryError(`"${name}" is not in the registry at ${base.href}`) });
      return parseItem(text, name, url.href);
    },
    async index() {
      const url = new URL('../registry.json', base);
      const text = await fetchText(url, fetchImpl, { notFound: () => new RegistryError(`no registry index at ${url.href}`) });
      return parseIndex(text, url.href);
    },
  };
}

function localRegistry(dir) {
  return {
    kind: 'dir',
    location: dir,
    base: null,
    async item(name) {
      assertItemName(name);
      const file = path.join(dir, `${name}.json`);
      const text = await readLocal(file, () => new RegistryError(`"${name}" is not in the registry at ${dir}`));
      return parseItem(text, name, file);
    },
    async index() {
      const file = path.join(path.dirname(dir), 'registry.json');
      const hasIndex = await fs.stat(file).then(stat => stat.isFile(), () => false);
      if (hasIndex) return parseIndex(await readLocal(file, () => new RegistryError(`no registry index at ${file}`)), file);
      // No index beside the folder: read the items themselves.
      const names = (await fs.readdir(dir))
        .filter(entry => entry.endsWith('.json'))
        .map(entry => entry.slice(0, -'.json'.length))
        .filter(name => /^[a-z0-9][a-z0-9-]{0,99}$/.test(name))
        .sort();
      const items = [];
      for (const name of names) {
        const item = await this.item(name);
        items.push({ name: item.name, type: item.type, description: item.description });
      }
      return items;
    },
  };
}

async function readLocal(file, notFound) {
  let stat;
  try {
    stat = await fs.stat(file);
  } catch (error) {
    if (error.code === 'ENOENT') throw notFound();
    throw new RegistryError(`cannot read ${file}: ${error.message}`);
  }
  if (!stat.isFile()) throw new RegistryError(`${file} is not a file`);
  if (stat.size > MAX_RESPONSE_BYTES) throw new RegistryError(`${file} is larger than ${MAX_RESPONSE_BYTES} bytes`);
  return fs.readFile(file, 'utf8');
}

/**
 * GET with manual redirects: a redirect to the same origin is followed, a
 * redirect anywhere else stops with an error naming the destination. The body
 * is read in chunks and abandoned once it passes MAX_RESPONSE_BYTES.
 */
export async function fetchText(url, fetchImpl, { notFound } = {}) {
  let current = url;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    let response;
    try {
      response = await fetchImpl(current, {
        redirect: 'manual',
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (error) {
      throw new RegistryError(`cannot reach ${current.href}: ${error.cause?.message ?? error.message}`);
    }
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) throw new RegistryError(`${current.href} redirected without a Location header`);
      const next = new URL(location, current);
      if (next.origin !== url.origin) {
        throw new RegistryError(`${current.href} redirects to another origin (${next.origin}); pass that URL with --registry if you trust it`);
      }
      current = next;
      continue;
    }
    if (response.status === 404 && notFound) throw notFound();
    if (!response.ok) throw new RegistryError(`${current.href} answered HTTP ${response.status}`);
    return readCapped(response, current.href);
  }
  throw new RegistryError(`${url.href} redirected more than ${MAX_REDIRECTS} times`);
}

async function readCapped(response, label) {
  const declared = Number(response.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > MAX_RESPONSE_BYTES) {
    throw new RegistryError(`${label} is larger than ${MAX_RESPONSE_BYTES} bytes`);
  }
  if (!response.body) return '';
  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_RESPONSE_BYTES) {
      await reader.cancel().catch(() => {});
      throw new RegistryError(`${label} is larger than ${MAX_RESPONSE_BYTES} bytes`);
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString('utf8');
}

function parseJson(text, label) {
  try {
    return JSON.parse(text);
  } catch {
    throw new RegistryError(`${label} is not valid JSON`);
  }
}

const NPM_SPEC = /^(@[a-z0-9][a-z0-9._~-]*\/)?[a-z0-9][a-z0-9._~-]*(@[A-Za-z0-9.^~<>=| *+-]+)?$/;

/**
 * Validates one registry item and returns only the fields the CLI uses.
 * Unknown fields are ignored; anything malformed in a used field rejects the
 * whole item.
 */
export function parseItem(text, expectedName, label = expectedName) {
  const raw = parseJson(text, label);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new UnsafeError(`${label} is not a registry item`);
  if (raw.name !== expectedName) throw new UnsafeError(`${label} names itself ${JSON.stringify(raw.name)}, expected "${expectedName}"`);
  const files = raw.files ?? [];
  if (!Array.isArray(files)) throw new UnsafeError(`${label}: files must be an array`);
  const parsedFiles = files.map((file, index) => {
    if (!file || typeof file !== 'object') throw new UnsafeError(`${label}: files[${index}] is not an object`);
    if (typeof file.content !== 'string') throw new UnsafeError(`${label}: files[${index}] has no content`);
    const target = file.target ?? file.path;
    return { target: checkTarget(target), content: file.content };
  });
  return {
    name: raw.name,
    type: typeof raw.type === 'string' ? raw.type : '',
    description: typeof raw.description === 'string' ? raw.description : '',
    dependencies: stringList(raw.dependencies, `${label}: dependencies`).map(spec => {
      if (!NPM_SPEC.test(spec)) throw new UnsafeError(`${label}: ${JSON.stringify(spec)} is not an npm package name`);
      return spec;
    }),
    registryDependencies: stringList(raw.registryDependencies, `${label}: registryDependencies`),
    files: parsedFiles,
  };
}

function parseIndex(text, label) {
  const raw = parseJson(text, label);
  const items = Array.isArray(raw) ? raw : raw?.items;
  if (!Array.isArray(items)) throw new RegistryError(`${label} has no items list`);
  return items
    .filter(item => item && typeof item.name === 'string' && /^[a-z0-9][a-z0-9-]{0,99}$/.test(item.name))
    .map(item => ({
      name: item.name,
      type: typeof item.type === 'string' ? item.type : '',
      description: typeof item.description === 'string' ? item.description : '',
    }));
}

function stringList(value, label) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some(entry => typeof entry !== 'string')) {
    throw new UnsafeError(`${label} must be a list of strings`);
  }
  return value;
}

/**
 * Turns a registryDependencies entry into an item name in the open registry.
 * A bare name is looked up as is. A URL must point at `<name>.json` in this
 * registry's folder or in Meridian's hosted folder (a local copy of the
 * registry still lists hosted URLs); a URL anywhere else is refused rather
 * than fetched.
 */
export function dependencyName(entry, registry) {
  if (!/^https?:\/\//i.test(entry)) return assertItemName(entry);
  let url;
  try {
    url = new URL(entry);
  } catch {
    throw new UnsafeError(`invalid registry dependency URL ${JSON.stringify(entry)}`);
  }
  const folder = new URL('./', url).href;
  const allowed = [DEFAULT_REGISTRY];
  if (registry.base) allowed.push(registry.base.href);
  if (!allowed.includes(folder) || url.search || url.hash) {
    throw new UnsafeError(`registry dependency ${entry} is outside this registry`);
  }
  const file = url.pathname.slice(url.pathname.lastIndexOf('/') + 1);
  if (!file.endsWith('.json')) throw new UnsafeError(`registry dependency ${entry} is not a .json item`);
  return assertItemName(file.slice(0, -'.json'.length));
}
