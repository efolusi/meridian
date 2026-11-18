import { readFileSync } from 'node:fs'

// tokens/*.css is vendored from design-tokens (one declaration per line).
// Tests read it in one compact shape: no comments, `--name:value;`,
// `selector{` opens a block and `\n}` closes it.
export function compactCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/([\w-]+)\s*:\s+/g, '$1:')
    .replace(/\s*;\s*/g, ';')
    .replace(/\s*,\s*/g, ',')
    .replace(/\s*\{\s*/g, '{\n')
    .replace(/\s*\}\s*/g, '\n}\n')
    .trim() + '\n'
}

export const readTokenCss = (name) => compactCss(readFileSync(`tokens/${name}`, 'utf8'))
