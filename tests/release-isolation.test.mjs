import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function readRepoFile(relativePath) {
  return fs.readFile(path.join(repoRoot, relativePath), 'utf8');
}

function parseJsonc(source) {
  let stripped = '';
  let inString = false;
  let escaped = false;
  for (let index = 0; index < source.length; index += 1) {
    const current = source[index];
    const next = source[index + 1];
    if (inString) {
      stripped += current;
      if (escaped) escaped = false;
      else if (current === '\\') escaped = true;
      else if (current === '"') inString = false;
      continue;
    }
    if (current === '"') {
      inString = true;
      stripped += current;
      continue;
    }
    if (current === '/' && next === '/') {
      while (index < source.length && source[index] !== '\n') index += 1;
      stripped += '\n';
      continue;
    }
    if (current === '/' && next === '*') {
      index += 2;
      while (index < source.length && !(source[index] === '*' && source[index + 1] === '/')) {
        stripped += source[index] === '\n' ? '\n' : ' ';
        index += 1;
      }
      if (index >= source.length) throw new SyntaxError('unterminated JSONC block comment');
      index += 1;
      continue;
    }
    stripped += current;
  }
  if (inString) throw new SyntaxError('unterminated JSONC string');
  let normalized = '';
  inString = false;
  escaped = false;
  for (let index = 0; index < stripped.length; index += 1) {
    const current = stripped[index];
    if (inString) {
      normalized += current;
      if (escaped) escaped = false;
      else if (current === '\\') escaped = true;
      else if (current === '"') inString = false;
      continue;
    }
    if (current === '"') {
      inString = true;
      normalized += current;
      continue;
    }
    if (current === ',') {
      let lookahead = index + 1;
      while (/\s/.test(stripped[lookahead] ?? '')) lookahead += 1;
      if (stripped[lookahead] === '}' || stripped[lookahead] === ']') continue;
    }
    normalized += current;
  }
  return JSON.parse(normalized);
}

function assertDevWorkerIsolation(config) {
  const effectiveDev = config.env?.dev ?? config;
  expect(config.name).toBe('meridian-dev');
  expect(effectiveDev.name).toBe('meridian-dev');
  expect(effectiveDev.workers_dev).toBe(true);
  expect(effectiveDev.routes).toEqual([]);
  expect(config.env?.production?.workers_dev).toBe(false);
}

describe('Meridian integration and release isolation', () => {
  it('validates dev changes while keeping publication main-only', async () => {
    const checks = await readRepoFile('.github/workflows/checks.yml');
    const publish = await readRepoFile('.github/workflows/publish.yml');

    expect(checks).toMatch(/push:\n\s+branches: \[main, dev\]/);
    expect(checks).toMatch(/pull_request:/);
    expect(checks).toMatch(/permissions:\n\s+contents: read/);

    expect(publish).toMatch(/push:\n\s+branches: \[main\]/);
    expect(publish).not.toMatch(/push:\n\s+branches: \[[^\]]*dev/);
  });

  it('keeps the dev Worker isolated from production routes', async () => {
    const wrangler = parseJsonc(await readRepoFile('wrangler.jsonc'));

    assertDevWorkerIsolation(wrangler);
  });

  it('rejects unsafe effective values hidden behind safe-looking comments', () => {
    const commentsOnly = parseJsonc(`{
      // "name": "meridian-dev", "workers_dev": true, "routes": []
      "name": "meridian-production",
      "workers_dev": false,
      "routes": ["meridian.example.com/*"],
      "env": { "production": { "workers_dev": false } },
    }`);

    expect(() => assertDevWorkerIsolation(commentsOnly)).toThrow();

    const unsafeDevEnvironment = parseJsonc(`{
      "name": "meridian-dev",
      "workers_dev": true,
      "routes": [],
      "env": {
        // "dev": { "name": "meridian-dev", "workers_dev": true, "routes": [] },
        "dev": { "name": "meridian", "workers_dev": false, "routes": ["example.com/*"] },
        "production": { "workers_dev": false }
      }
    }`);

    expect(() => assertDevWorkerIsolation(unsafeDevEnvironment)).toThrow();
  });

  it('parses comments and trailing commas without changing effective values', () => {
    const validJsonc = parseJsonc(`{
      /* bounded JSONC fixture */
      "name": "meridian-dev",
      "workers_dev": true,
      "routes": [],
      "note": "https://example.invalid/a,//b,}",
      "env": { "production": { "workers_dev": false, }, },
    }`);

    assertDevWorkerIsolation(validJsonc);
  });
});
