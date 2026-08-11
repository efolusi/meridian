#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const ROOT = new URL('..', import.meta.url).pathname
const forbidden = ['sh', 'adcn'].join('')
const schemaHost = `https://ui.${forbidden}.com/schema/`
const files = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' })
  .split('\n')
  .filter(Boolean)
  // Vendored agent skills are tooling inputs, not Meridian product content.
  .filter((file) => !file.startsWith('.agents/skills/'))

const violations = []
for (const file of files) {
  let content
  try {
    content = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')
  } catch {
    continue
  }
  content.split('\n').forEach((line, index) => {
    if (!line.toLowerCase().includes(forbidden)) return
    if (line.includes(schemaHost)) return
    violations.push(`${file}:${index + 1}: ${line.trim()}`)
  })
}

if (violations.length) {
  process.stderr.write(
    `External product naming is not allowed in Meridian content:\n${violations.join('\n')}\n`,
  )
  process.exit(1)
}

process.stdout.write('independent repository naming: ok\n')
