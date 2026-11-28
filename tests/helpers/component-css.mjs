import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

// The CSS of every component, as the rules it writes: [{ file, selector, body }]. Comments are blanked;
// a rule inside an @media block is read as its own rule.
export function componentFiles() {
  return execFileSync('git', ['ls-files', '-z', 'components'], { encoding: 'utf8' }).split('\0').filter((f) => f.endsWith('.jsx'))
}

export function rulesOf(text, file = '') {
  const clean = text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
  const rules = []
  for (const m of clean.matchAll(/([^{};`]+)\{([^{}]*)\}/g)) rules.push({ file, selector: m[1].trim(), body: m[2] })
  return rules
}

export function componentRules() {
  return componentFiles().flatMap((file) => rulesOf(readFileSync(file, 'utf8'), file))
}

/** { file, name, body } for every @keyframes in a source text; nested braces are matched. */
export function keyframesOf(text, file = '') {
  const clean = text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
  const out = []
  for (const m of clean.matchAll(/@keyframes\s+([\w-]+)\s*\{/g)) {
    let depth = 1
    let i = m.index + m[0].length
    for (; i < clean.length && depth > 0; i += 1) {
      if (clean[i] === '{') depth += 1
      else if (clean[i] === '}') depth -= 1
    }
    out.push({ file, name: m[1], body: clean.slice(m.index + m[0].length, i - 1) })
  }
  return out
}

export function componentKeyframes() {
  return componentFiles().flatMap((file) => keyframesOf(readFileSync(file, 'utf8'), file))
}

/** The text of every opening tag of `name` in a JSX source: braces are balanced, so an arrow function in an attribute does not end the tag. */
export function openingTags(text, name) {
  const tags = []
  for (const m of text.matchAll(new RegExp(`<${name}(?=[\\s>])`, 'g'))) {
    let depth = 0
    let quote = null
    let i = m.index
    for (; i < text.length; i += 1) {
      const c = text[i]
      if (quote) { if (c === quote) quote = null; continue }
      if (c === '"' || c === "'" || c === '`') { quote = c; continue }
      if (c === '{') depth += 1
      else if (c === '}') depth -= 1
      else if (c === '>' && depth === 0 && text[i - 1] !== '=') break
    }
    tags.push(text.slice(m.index, i + 1))
  }
  return tags
}
