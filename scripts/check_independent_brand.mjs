#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const ROOT = new URL('..', import.meta.url).pathname
const forbiddenTerms = [
  ['sh', 'adcn'].join(''),
  ['hall', 'mark'].join(''),
]
const schemaHost = `https://ui.${forbiddenTerms[0]}.com/schema/`
const files = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' })
  .split('\n')
  .filter(Boolean)

const violations = []
for (const file of files) {
  let content
  try {
    content = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')
  } catch {
    continue
  }
  content.split('\n').forEach((line, index) => {
    if (!forbiddenTerms.some((term) => line.toLowerCase().includes(term))) return
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
