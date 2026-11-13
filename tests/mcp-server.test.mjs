import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'mcp', 'package.json'), 'utf8'));
let client;

beforeAll(async () => {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [path.join(ROOT, 'mcp', 'server.mjs')],
    env: { ...process.env, MERIDIAN_SOURCE: ROOT },
    stderr: 'ignore',
  });
  client = new Client({ name: 'meridian-test', version: '0' });
  await client.connect(transport);
}, 60000);
afterAll(async () => { await client?.close(); });

const text = result => result.content.map(c => c.text).join('');

describe('meridian MCP server', () => {
  it('serves a real component', async () => {
    const result = await client.callTool({ name: 'get_component', arguments: { name: 'Button' } });
    expect(result.isError).toBeFalsy();
    expect(text(result)).toContain('# Button');
  });

  it('refuses component names that walk out of site/registry', async () => {
    for (const name of ['../../package', '../../mcp/package', '/etc/hosts', 'button?x', 'a/b']) {
      const result = await client.callTool({ name: 'get_component', arguments: { name } });
      expect(result.isError, name).toBe(true);
      expect(text(result), name).not.toContain('meridian-build');
    }
  });

  it('answers an unknown token group with the real groups, not an empty object', async () => {
    for (const group of ['constructor', '__proto__', 'nope']) {
      const result = await client.callTool({ name: 'get_tokens', arguments: { group } });
      expect(result.isError, group).toBe(true);
      expect(text(result), group).toMatch(/groups:/);
      expect(text(result), group).not.toMatch(/\$extensions/);
    }
  });

  it('describes get_tokens as what tokens.json holds', async () => {
    const tokens = JSON.parse(fs.readFileSync(path.join(ROOT, 'tokens.json'), 'utf8'));
    const tool = (await client.listTools()).tools.find(t => t.name === 'get_tokens');
    // $value is light at default density; dark, compact and coarse-pointer
    // values are DTCG $extensions modes, and references are {group.leaf} aliases.
    const modes = Object.keys(tokens.$extensions['com.efolusi.meridian'].modes);
    for (const mode of modes) expect(tool.description, mode).toMatch(new RegExp(`\\b${mode}\\b`));
    expect(tool.description).toMatch(/\{group\.leaf\}/);
    expect(tool.description).not.toMatch(/var\(--name\)/);
    const suggested = [...tool.inputSchema.properties.group.description.matchAll(/"([^"]+)"/g)].map(m => m[1]);
    expect(suggested.length).toBeGreaterThan(0);
    for (const group of suggested) expect(Object.hasOwn(tokens, group), group).toBe(true);
  });

  it('reports the version it is published under', () => {
    expect(client.getServerVersion()).toMatchObject({ name: 'meridian', version: pkg.version });
  });
});
