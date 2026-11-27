import { contrast } from '../../scripts/contrast.mjs'
import { readTokenCss } from './token-css.mjs'

// The light and dark colour tables of tokens/colors.css, with var() chains resolved to rgb().
const tokens = readTokenCss('colors.css')
const vars = (text) => Object.fromEntries([...text.matchAll(/(--[\w-]+):([^;}]+)/g)].map(([, n, v]) => [n, v.trim()]))
const block = (selector) => {
  const start = tokens.indexOf(`${selector}{`)
  return tokens.slice(start, tokens.indexOf('\n}', start))
}
const light = vars(block(':root,[data-theme="light"]'))
export const THEMES = [['light', light], ['dark', { ...light, ...vars(block('[data-theme="dark"]')) }]]

export function resolve(table, name) {
  let v = table[name]
  for (let i = 0; i < 10 && /^var\(/.test(v); i += 1) v = table[/var\((--[\w-]+)\)/.exec(v)[1]]
  const n = parseInt(v.slice(1), 16)
  return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`
}

export const ratio = (table, fg, bg) => contrast(resolve(table, fg), resolve(table, bg))
