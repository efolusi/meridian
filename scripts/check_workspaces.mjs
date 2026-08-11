#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs'

const ROOT = new URL('..', import.meta.url)
const read = (path) => JSON.parse(readFileSync(new URL(path, ROOT), 'utf8'))
const fail = (message) => {
  process.stderr.write(`workspace contract: ${message}\n`)
  process.exitCode = 1
}

const root = read('package.json')
const manifest = read('_ds_manifest.json')
const expectedWorkspaces = ['mcp', 'packages/*']
if (JSON.stringify(root.workspaces) !== JSON.stringify(expectedWorkspaces)) {
  fail(`package.json workspaces must be ${JSON.stringify(expectedWorkspaces)}`)
}

for (const [folder, name] of [
  ['packages/tokens', '@efolusi/meridian-tokens'],
  ['packages/icons', '@efolusi/meridian-icons'],
]) {
  const pkg = read(`${folder}/package.json`)
  if (pkg.name !== name) fail(`${folder} must be named ${name}`)
  if (pkg.version !== manifest.version) {
    fail(`${folder} version ${pkg.version} must match Meridian ${manifest.version}`)
  }
  if (pkg.private !== true) fail(`${folder} source workspace must remain private`)
}

const mcp = read('mcp/package.json')
if (mcp.name !== '@efolusi/meridian-mcp') fail('mcp workspace has the wrong package name')
if (!existsSync(new URL('skills/SKILL.md', ROOT))) fail('built-in Meridian skill is missing')

const retiredSkillRuntime = `.${['hall', 'mark'].join('')}`
for (const retired of ['.agents/skills', retiredSkillRuntime, 'skills-lock.json']) {
  if (existsSync(new URL(retired, ROOT))) fail(`retired external tooling remains at ${retired}`)
}

if (!process.exitCode) process.stdout.write('workspace contract: ok\n')
