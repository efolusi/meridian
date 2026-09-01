import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const workflow = readFileSync('.github/workflows/deploy-prod-static.yml', 'utf8')
const deploy = readFileSync('scripts/deploy-prod-static.sh', 'utf8')
const nginx = readFileSync('nginx/meridian.efolusi.com.conf', 'utf8')
const prerequisites = readFileSync('nginx/meridian-prod-runner-prerequisites.md', 'utf8')

describe('Meridian production static deployment', () => {
  it('is main-only and binds the exact push SHA on the dedicated runner', () => {
    expect(workflow).toContain('branches: [main]')
    expect(workflow).not.toContain('branches: [dev]')
    expect(workflow).not.toContain('pull_request:')
    expect(workflow).toContain('runs-on: [self-hosted, Linux, X64, meridian-deploy]')
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

  it('publishes exact committed bytes into an immutable SHA release', () => {
    expect(deploy).toContain('git archive --format=tar "$release_sha"')
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

  it('limits the one-time host authority to a read-only Nginx test', () => {
    expect(prerequisites).toContain('`sudo -n /usr/sbin/nginx -t`')
    expect(prerequisites).toContain('Do not grant')
    expect(prerequisites).toContain('Nginx reload/restart')
    expect(prerequisites).toContain('No Docker socket')
    expect(prerequisites).toContain('No repository/environment secret')
  })
})
