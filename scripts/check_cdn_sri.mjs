#!/usr/bin/env node
/**
 * Every third-party CDN tag shown to users carries the right SRI hash.
 *
 * The pinned React, ReactDOM and Babel URLs and their sha384 hashes live once,
 * in the page runtime (site/support.js, the `*_URL` / `*_SRI` pairs). This gate
 * scans every tracked text file for a <script src> or <link href> pointing at a
 * public CDN and fails when the tag has no integrity, no crossorigin="anonymous",
 * a hash that differs from the runtime's, or a URL nothing pins. The two
 * development React builds the smoke page loads are pinned in EXTRA_PINS here.
 * That covers the README, guidelines, hello.html, blocks, showcases, cards and
 * the snippet strings the docs pages build ('<' + SC + ' src="...">').
 *
 * Meridian's own files (https://meridian.efolusi.com/styles.css and
 * /_ds_bundle.js) are not on a public CDN and are left alone: the URLs always
 * serve the newest release, so a fixed hash would break every page on the next
 * deploy, and the npm tarball does not ship the UMD bundle, so there is no
 * versioned CDN copy to pin instead.
 *
 *   node scripts/check_cdn_sri.mjs           check the tracked files
 *   node scripts/check_cdn_sri.mjs --remote  also download each pinned URL and
 *                                            compare its hash (needs network)
 */
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const CDN_HOSTS = ['unpkg.com', 'cdn.jsdelivr.net', 'cdnjs.cloudflare.com', 'esm.sh', 'cdn.skypack.dev']
const TEXT_EXT = /\.(html|md|txt|js|mjs|cjs|jsx|ts|tsx|json|py)$/
/** Pinned files the runtime does not load itself: the development React builds site/_smoke.html uses. */
const EXTRA_PINS = new Map([
  ['https://unpkg.com/react@18.3.1/umd/react.development.js', 'sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L'],
  ['https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js', 'sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm'],
])
const SKIP = [/^node_modules\//, /^dist\//, /^package-lock\.json$/, /^scripts\/check_cdn_sri(\.test)?\.mjs$/]

/** URL -> "sha384-..." from the `var X_URL = "..."; var X_SRI = "...";` pairs in the runtime. */
export function readPins(runtimeSource) {
  const pins = new Map()
  const re = /var (\w+)_URL = "([^"]+)";\s*var \1_SRI = "([^"]+)";/g
  for (const m of runtimeSource.matchAll(re)) pins.set(m[2], m[3])
  return pins
}

/** Problems in one file's text, each { line, url, problem }. */
function cdnTagRe() {
  const hosts = CDN_HOSTS.map((h) => h.replace(/\./g, '\\.')).join('|')
  return new RegExp(`\\b(?:src|href)="(https://(?:${hosts})/[^"]+)"`, 'g')
}

export function scan(text, pins) {
  const problems = []
  for (const m of text.matchAll(cdnTagRe())) {
    const url = m[1]
    const start = text.lastIndexOf('<', m.index)
    const end = text.indexOf('>', m.index)
    const tag = text.slice(start, end === -1 ? undefined : end)
    const line = text.slice(0, m.index).split('\n').length
    const integrity = tag.match(/\bintegrity="([^"]*)"/)?.[1]
    const expected = pins.get(url)
    if (!expected) problems.push({ line, url, problem: 'URL is not pinned in site/support.js or EXTRA_PINS' })
    else if (!integrity) problems.push({ line, url, problem: 'missing integrity=' })
    else if (integrity !== expected) problems.push({ line, url, problem: `integrity ${integrity} does not match the pinned ${expected}` })
    if (!/\bcrossorigin="anonymous"/.test(tag)) problems.push({ line, url, problem: 'missing crossorigin="anonymous"' })
  }
  return problems
}

export function sri(bytes) {
  return 'sha384-' + createHash('sha384').update(bytes).digest('base64')
}

async function main() {
  const runtimePins = readPins(readFileSync(join(ROOT, 'site/support.js'), 'utf8'))
  if (runtimePins.size === 0) {
    console.error('no *_URL / *_SRI pins found in site/support.js')
    return 1
  }
  const pins = new Map([...runtimePins, ...EXTRA_PINS])

  const files = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' })
    .split('\n')
    .filter((f) => TEXT_EXT.test(f) && !SKIP.some((re) => re.test(f)))

  let tags = 0
  const failures = []
  for (const file of files) {
    let text
    try { text = readFileSync(join(ROOT, file), 'utf8') } catch { continue }
    if (!CDN_HOSTS.some((h) => text.includes(h))) continue
    for (const p of scan(text, pins)) failures.push(`  ${file}:${p.line}  ${p.url}\n    ${p.problem}`)
    tags += [...text.matchAll(cdnTagRe())].length
  }

  if (process.argv.includes('--remote')) {
    for (const [url, expected] of pins) {
      const res = await fetch(url)
      if (!res.ok) { failures.push(`  ${url}\n    download failed: HTTP ${res.status}`); continue }
      const actual = sri(Buffer.from(await res.arrayBuffer()))
      if (actual !== expected) failures.push(`  ${url}\n    published file hashes to ${actual}, pinned ${expected}`)
    }
  }

  if (failures.length > 0) {
    console.error(failures.join('\n'))
    console.error(`\n${failures.length} CDN tag problem(s). Copy the integrity from site/support.js and add crossorigin="anonymous".`)
    return 1
  }
  console.log(`${tags} CDN tags carry the pinned SRI hashes (${pins.size} pinned URLs)`)
  return 0
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exit(await main())
