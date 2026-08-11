# @efolusi/meridian-mcp

An [MCP](https://modelcontextprotocol.io) server that gives an AI coding agent
first-hand knowledge of the Meridian design system, so it builds correct Meridian
UI instead of guessing. It exposes the same generated registry the docs site uses.

## Tools

| Tool | What it returns |
|---|---|
| `list_components` | Every UI component with a one-line description and categories. Optional `category` filter. |
| `get_component` | One component's full detail: description, Meridian dependencies, and each file's real content — the `.jsx` source, the `.d.ts` types, and the `.prompt.md` usage guide. |
| `search_components` | Components matching a keyword across name, title, description and category. |
| `get_tokens` | Design tokens (colour, typography, spacing, effects) in light, dark and compact. Optional `group` filter. |

## Data source

No repository needed. By default the server reads the **hosted** registry, so it
works standalone:

- `MERIDIAN_SOURCE=https://meridian.efolusi.com` — the default.
- `MERIDIAN_SOURCE=/path/to/meridian` — a local checkout or a vendored copy, if
  you prefer offline / pinned data.

## Add it to your agent

It speaks stdio. Point your agent's MCP config at the command. Once published you
can use `npx`; from a checkout use `node /path/to/meridian/mcp/server.mjs`.

**Claude Code**

```bash
claude mcp add meridian -- npx -y @efolusi/meridian-mcp
```

**Claude Desktop / Cursor / any stdio MCP client** (`mcpServers` config):

```json
{
  "mcpServers": {
    "meridian": {
      "command": "npx",
      "args": ["-y", "@efolusi/meridian-mcp"],
      "env": { "MERIDIAN_SOURCE": "https://meridian.efolusi.com" }
    }
  }
}
```

Then ask your agent things like *"list Meridian form components"*, *"show me the
Calendar props and date-picker composition"*, or *"build an Efolusi settings page with Meridian"* —
it will pull the real source and tokens before writing code.

## Run locally / develop

```bash
cd mcp
npm install
MERIDIAN_SOURCE=.. node server.mjs   # read the local registry
node smoke.mjs                        # quick end-to-end check of every tool
```

MIT licensed.
