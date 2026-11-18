import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, utimesSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const workflow = readFileSync('.github/workflows/deploy-prod-static.yml', 'utf8')
const deploy = readFileSync('scripts/deploy-prod-static.sh', 'utf8')
const nginx = readFileSync('nginx/meridian.efolusi.com.conf', 'utf8')

describe('Meridian production static deployment', () => {
  it('is main-only and binds the exact push SHA on the production runner', () => {
    expect(workflow).toContain('branches: [main]')
    expect(workflow).not.toContain('branches: [dev]')
    expect(workflow).not.toContain('pull_request:')
    expect(workflow).toContain('runs-on: [self-hosted, Linux, X64, efolusi-prod]')
    expect(workflow).toContain('ref: ${{ github.sha }}')
    expect(workflow).toContain('[[ "$GITHUB_REF" == "refs/heads/main" ]]')
    expect(workflow).toContain('[[ "$(git rev-parse HEAD)" == "$MERIDIAN_RELEASE_SHA" ]]')
  })

  it('pins Node 22.23.2 through NVM and runs the complete repository gate', () => {
    expect(workflow).toContain('[[ "$expected" == "22.23.2" ]]')
    expect(workflow).toContain('source "$HOME/.nvm/nvm.sh"')
    expect(workflow).toContain('npm ci --no-audit --no-fund')
    expect(workflow).toContain('npm run check')
    expect(workflow).toContain('git diff --exit-code')
  })

  it('publishes every root file the hosted consumers fetch', () => {
    const publicPaths = deploy.match(/^public_paths=\(\n([\s\S]*?)\n\)/m)[1]
      .split('\n').map((p) => p.trim())
    const servedBy = (rel) => publicPaths.some((p) => rel === p || rel.startsWith(`${p}/`))
    // @efolusi/meridian-mcp reads these from https://meridian.efolusi.com by
    // default; llms.txt advertises root paths to agents.
    const mcp = readFileSync('mcp/server.mjs', 'utf8')
    const mcpReads = [...mcp.matchAll(/readJSON\(['`]([^'`$]+)/g)].map(([, rel]) => rel)
    const llms = readFileSync('llms.txt', 'utf8')
    const llmsPaths = [
      ...[...llms.matchAll(/(?:^|[\s(,])\/([A-Za-z0-9_][\w./-]*\.(?:json|js|css|txt|html|xml|md))\b/gm)].map(([, rel]) => rel),
      ...[...llms.matchAll(/(?:^|[\s(,])\/(LICENSE)\b/gm)].map(([, rel]) => rel),
    ]
    // skills/SKILL.md sends agents to the README "one level up" from the skill.
    expect(readFileSync('skills/SKILL.md', 'utf8')).toContain('repository README.md')
    llmsPaths.push('README.md')
    for (const doc of ['README.md', 'ARCHITECTURE.md', 'CHANGELOG.md', 'CONTRIBUTING.md', 'SECURITY.md', 'LICENSE']) {
      expect(llmsPaths).toContain(doc)
    }
    expect(mcpReads).toContain('tokens.json')
    expect(llmsPaths).toContain('tokens.json')
    for (const rel of [...mcpReads, ...llmsPaths]) {
      expect(servedBy(rel), `${rel} is fetched from the host but not published`).toBe(true)
    }
  })

  it('publishes exact committed bytes into an immutable SHA release', () => {
    expect(deploy).toContain('git archive --format=tar "$release_sha"')
    expect(deploy).toContain('public_paths=(')
    expect(deploy).toContain('tar -C "$archive_dir" -cf - "${public_paths[@]}"')
    expect(deploy).not.toContain('--exclude-from=')
    expect(deploy).toContain('/var/www/efolusi/meridian-prod')
    expect(deploy).toContain('release="$releases_root/$release_sha"')
    expect(deploy).toContain('meridian-release.txt')
    expect(deploy).toContain(
      'diff --recursive --brief --no-dereference "$publication_dir" "$release"',
    )
    expect(deploy).toContain("stat -c '%U:%G:%a' \"$release\"")
    expect(deploy).toContain('mv -Tf "$next" "$deploy_root/current"')
    expect(deploy).not.toMatch(/git pull|git checkout|git reset/)
  })

  it('keeps repository and operator files outside the public document root', () => {
    const allowlist = deploy.match(/public_paths=\((?<paths>[\s\S]*?)\n\)/)?.groups?.paths || ''
    const forbidden = [
      '.github',
      '.nvmrc',
      'CLAUDE.md',
      'nginx',
      'package.json',
      'package-lock.json',
      'scripts',
      'tests',
    ]

    for (const path of forbidden) {
      expect(allowlist.split(/\s+/)).not.toContain(path)
      expect(deploy).toMatch(new RegExp(`(?:^|\\s)${path.replace('.', '\\.')}(?:\\s|; do)`))
    }
    expect(deploy).toContain('[[ ! -e "${publication_dir}/${forbidden_path}" ]]')
    expect(deploy).toContain('find "$publication_dir" -type l -print -quit | grep -q .')
    expect(deploy).toContain('public static tree must not contain symlinks')
    expect(allowlist.split(/\s+/)).toEqual(
      expect.arrayContaining(['index.html', '_ds_bundle.js', 'assets', 'site', 'tokens']),
    )
  })

  it('validates installed Nginx before changing the release pointer', () => {
    const nginxTest = deploy.indexOf('/usr/bin/sudo -n /usr/sbin/nginx -t')
    const pointerMove = deploy.indexOf('mv -Tf "$next" "$deploy_root/current"')
    expect(nginxTest).toBeGreaterThan(-1)
    expect(pointerMove).toBeGreaterThan(nginxTest)
    expect(deploy).toContain('cmp --silent "$tracked_vhost" "$available"')
    expect(deploy).toContain('[[ ! -w "$available" && ! -w "$enabled" ]]')
  })

  it('checks exact origin and public release identity and restores the prior pointer', () => {
    expect(deploy).toContain('for mode in origin public')
    expect(deploy).toContain('--resolve "${domain}:443:127.0.0.1"')
    expect(deploy).toContain('[[ "$body" == "$release_sha" ]]')
    expect(deploy).toContain('mv -Tf "$rollback_link" "$deploy_root/current"')
    expect(deploy).toContain('rollback 68')
  })

  it('serves only the static production site', () => {
    expect(nginx).toContain('server_name meridian.efolusi.com;')
    expect(nginx).toContain('root /var/www/efolusi/meridian-prod/current;')
    expect(nginx).toContain('try_files $uri $uri/ =404;')
    expect(nginx).not.toContain('proxy_pass')
    expect(`${workflow}\n${deploy}\n${nginx}`).not.toMatch(/\bpm2\b|\bdocker\b/i)
  })
})

describe('release pruning on both hosts', () => {
  const scripts = {
    prod: readFileSync('scripts/deploy-prod-static.sh', 'utf8'),
    dev: readFileSync('scripts/deploy-dev-static.sh', 'utf8'),
  }
  const pruneSource = (src) => src.match(/^prune_releases\(\) \{[\s\S]*?\n\}/m)?.[0]

  it('is the same function in both deploy scripts and runs only after a verified deploy', () => {
    expect(pruneSource(scripts.prod)).toBeTruthy()
    expect(pruneSource(scripts.dev)).toBe(pruneSource(scripts.prod))
    for (const src of Object.values(scripts)) {
      expect(src).toContain('keep_releases=5')
      const call = src.indexOf('prune_releases "$keep_releases"')
      expect(call).toBeGreaterThan(src.lastIndexOf('trap - ERR'))
      // A failed prune warns; it never fails or rolls back a good deploy.
      expect(src).toMatch(/prune_releases "\$keep_releases" \|\| echo .*warning/)
    }
  })

  it('keeps the newest N releases plus whatever current points to', () => {
    const fixture = mkdtempSync(join(tmpdir(), 'meridian-prune-'))
    const releases = join(fixture, 'releases')
    const sha = (n) => n.toString(16).padStart(40, '0')
    try {
      for (let n = 1; n <= 8; n++) {
        mkdirSync(join(releases, sha(n)), { recursive: true })
        // Older n gets an older mtime: release 1 is the oldest.
        const t = new Date(Date.UTC(2026, 0, n))
        utimesSync(join(releases, sha(n)), t, t)
      }
      mkdirSync(join(releases, `.${sha(9)}.123`)) // an in-flight candidate
      symlinkSync(join(releases, sha(1)), join(fixture, 'current')) // rolled back to the oldest
      execFileSync('/bin/bash', ['-c', `set -Eeuo pipefail
deploy_root="$1"
releases_root="$1/releases"
${pruneSource(scripts.prod)}
prune_releases 5`, 'bash', fixture])
      const left = readdirSync(releases).sort()
      expect(left).toEqual([`.${sha(9)}.123`, sha(1), sha(4), sha(5), sha(6), sha(7), sha(8)].sort())
    } finally {
      rmSync(fixture, { recursive: true, force: true })
    }
  })
})

describe('Meridian production public files (DS-03, DS-12)', () => {
  const allowlist = deploy.match(/^public_paths=\(\n([\s\S]*?)\n\)/m)[1].split('\n').map((p) => p.trim())
  const rootDocs = allowlist.filter((p) => p === 'LICENSE' || /^[A-Z]+\.md$/.test(p))

  it('serves every published root doc as UTF-8 plain text instead of a download', () => {
    expect(rootDocs.sort()).toEqual(['ARCHITECTURE.md', 'CHANGELOG.md', 'CONTRIBUTING.md', 'LICENSE', 'README.md', 'SECURITY.md'])
    const at = nginx.indexOf('location ~ ^/(LICENSE|')
    expect(at).toBeGreaterThan(-1)
    const spec = nginx.slice(at).match(/location ~ (\S+) \{/)[1]
    const re = new RegExp(spec)
    for (const doc of rootDocs) expect(re.test(`/${doc}`), doc).toBe(true)
    // Every published Markdown file reads as text, not only the root docs:
    // llms.txt sends agents to /skills/SKILL.md and the guidelines.
    for (const doc of ['/skills/SKILL.md', '/guidelines/forms.md', '/components/forms/Select.prompt.md']) {
      expect(re.test(doc), doc).toBe(true)
    }
    for (const other of ['/LICENSE.txt', '/site/index.html', '/styles.css']) {
      expect(re.test(other), other).toBe(false)
    }
    const block = nginx.slice(at, nginx.indexOf('\n    }', at))
    expect(block).toContain('types { }')
    expect(block).toContain('default_type text/plain;')
    expect(block).toContain('charset utf-8;')
    expect(block).toContain('add_header X-Meridian-Environment production always;')
  })

  it('lets any origin load the self-hosted fonts and keeps their cache policy', () => {
    const fonts = nginx.slice(nginx.indexOf('location ^~ /assets/fonts/ {'))
    const block = fonts.slice(0, fonts.indexOf('\n    }'))
    // CORS comes from the shared snippet ($meridian_cors covers /assets/fonts/).
    expect(block).toContain('include snippets/meridian-security-headers.conf;')
    expect(readFileSync('nginx/snippets/meridian-cors.conf', 'utf8')).toContain('assets/fonts/')
    expect(block).toContain('add_header X-Meridian-Environment production always;')
    expect(block).toContain('add_header Cache-Control "public, max-age=31536000" always;')
  })
})
