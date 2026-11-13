#!/usr/bin/env node
// Meridian MCP server — exposes the design system's registry to an AI coding
// agent so it can build correct Meridian UI without guessing: the component
// list, each component's real source / types / usage guide, and the tokens.
//
// Data source (no repo needed by default):
//   MERIDIAN_SOURCE = https://meridian.efolusi.com   (default — the hosted site)
//   MERIDIAN_SOURCE = /path/to/meridian              (a local checkout / vendored copy)
// Either way it reads the same generated files: site/registry.json, the
// per-component site/registry/<name>.json (source embedded), and tokens.json.
//
// Run:  npx @efolusi/meridian-mcp     (or: node server.mjs)
// Add it to your agent's MCP config as a stdio server pointing at this command.

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import fs from 'node:fs/promises';
import path from 'node:path';

const SOURCE = (process.env.MERIDIAN_SOURCE || 'https://meridian.efolusi.com').replace(/\/$/, '');
const isURL = /^https?:\/\//.test(SOURCE);

// Read a repo-relative JSON file from either the hosted site or a local checkout.
async function readJSON(rel) {
  if (isURL) {
    const res = await fetch(`${SOURCE}/${rel}`);
    if (!res.ok) throw new Error(`${res.status} fetching ${rel}`);
    return res.json();
  }
  return JSON.parse(await fs.readFile(path.join(SOURCE, rel), 'utf8'));
}

let _index = null;
async function index() {
  if (!_index) _index = await readJSON('site/registry.json');
  return _index;
}
// UI components only (the registry also carries blocks and starters).
async function components() {
  return (await index()).items.filter((it) => it.type === 'registry:ui');
}
// The name becomes a file path, so only registry item names get through.
const COMPONENT_NAME = /^[a-z][a-z0-9-]*$/i;
async function component(name) {
  if (!COMPONENT_NAME.test(name)) throw new Error(`invalid component name ${JSON.stringify(name)}`);
  return readJSON(`site/registry/${name.toLowerCase()}.json`);
}

const { version } = JSON.parse(await fs.readFile(new URL('./package.json', import.meta.url), 'utf8'));
const server = new McpServer({ name: 'meridian', version });

server.registerTool(
  'list_components',
  {
    title: 'List Meridian components',
    description: 'List every Meridian UI component with its one-line description and categories. Start here to see what exists before building a screen.',
    inputSchema: { category: z.string().optional().describe('Optional category filter, e.g. "forms", "ai", "overlay".') },
  },
  async ({ category }) => {
    let items = await components();
    if (category) items = items.filter((it) => (it.categories || []).some((c) => c.toLowerCase() === category.toLowerCase()));
    const lines = items.map((it) => `- ${it.title || it.name}${(it.categories || []).length ? ` [${it.categories.join(', ')}]` : ''} — ${it.description || ''}`);
    return { content: [{ type: 'text', text: `${items.length} components (source: ${SOURCE})\n${lines.join('\n')}` }] };
  }
);

server.registerTool(
  'get_component',
  {
    title: 'Get a Meridian component',
    description: "Full detail for one component by name: description, dependencies, and every file's real content — the .jsx source, the .d.ts types, and the .prompt.md usage guide. Use this before writing code that uses the component.",
    inputSchema: { name: z.string().describe('Component name, e.g. "Button", "Calendar", "NumberInput".') },
  },
  async ({ name }) => {
    let c;
    try {
      c = await component(name);
    } catch {
      return { content: [{ type: 'text', text: `No component named "${name}". Call list_components to see valid names.` }], isError: true };
    }
    const dep = (c.registryDependencies || []).length ? `\nMeridian dependencies (copy these too if vendoring): ${c.registryDependencies.join(', ')}` : '';
    const files = (c.files || [])
      .map((f) => `\n\n### ${f.path} (${f.type})\n\`\`\`\n${f.content}\n\`\`\``)
      .join('');
    return { content: [{ type: 'text', text: `# ${c.title || c.name}\n${c.description || ''}${dep}${files}` }] };
  }
);

server.registerTool(
  'search_components',
  {
    title: 'Search Meridian components',
    description: 'Find components by a keyword across name, title, description and category — e.g. "date", "chart", "upload", "agent".',
    inputSchema: { query: z.string().describe('Keyword to search for.') },
  },
  async ({ query }) => {
    const q = query.toLowerCase();
    const hits = (await components()).filter((it) =>
      [it.name, it.title, it.description, ...(it.categories || [])].filter(Boolean).some((s) => String(s).toLowerCase().includes(q))
    );
    if (!hits.length) return { content: [{ type: 'text', text: `No components match "${query}".` }] };
    return { content: [{ type: 'text', text: hits.map((it) => `- ${it.title || it.name} — ${it.description || ''}`).join('\n') }] };
  }
);

server.registerTool(
  'get_tokens',
  {
    title: 'Get Meridian design tokens',
    description: 'The design tokens (colors, typography, spacing, effects) as DTCG JSON. Each $value is the light theme at default density; a token that changes elsewhere also carries $extensions["com.efolusi.meridian"].modes with its dark, compact and coarse (touch pointer) values. References between tokens are DTCG aliases, {group.leaf}: the CSS custom property is --group-leaf (e.g. {surface.page} is --surface-page). In generated CSS use the custom property so the theme, density and pointer modes all apply; never hardcode hex.',
    inputSchema: { group: z.string().optional().describe('Optional top-level group, e.g. "brand", "surface", "text", "space", "radius", "font". An unknown group returns the list of groups.') },
  },
  async ({ group }) => {
    const tokens = await readJSON('tokens.json');
    const groups = Object.keys(tokens).filter(k => !k.startsWith('$'));
    if (group && !groups.includes(group)) {
      return { content: [{ type: 'text', text: `No token group "${group}". groups: ${groups.join(', ')}` }], isError: true };
    }
    const text = JSON.stringify(group ? { [group]: tokens[group] } : tokens, null, 2);
    return { content: [{ type: 'text', text }] };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error(`meridian-mcp ready (source: ${SOURCE})`);
