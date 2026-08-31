import { execFileSync } from 'node:child_process'
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const workflow = readFileSync('.github/workflows/deploy-dev-static.yml', 'utf8')
const deploy = readFileSync('scripts/deploy-dev-static.sh', 'utf8')
const nginx = readFileSync('nginx/dev-meridian.efolusi.com.conf', 'utf8')
const runnerPrerequisites = readFileSync('nginx/dev-meridian-runner-prerequisites.md', 'utf8')

describe('Meridian development static deployment', () => {
  it('is push-only dev and uses only the dedicated Meridian runner', () => {
    expect(workflow).toContain('branches: [dev]')
    expect(workflow).not.toContain('branches: [main]')
    expect(workflow).not.toContain('pull_request:')
    expect(workflow).toContain('runs-on: [self-hosted, Linux, X64, meridian-deploy]')
    expect(workflow).not.toContain('runs-on: [self-hosted, Linux, X64, efolusi]')
    expect(workflow).toContain(
      'actions/checkout@d23441a48e516b6c34aea4fa41551a30e30af803 # v6',
    )
    expect(workflow).not.toContain('actions/checkout@v6')
    expect(workflow).toContain('source "$HOME/.nvm/nvm.sh"')
    expect(workflow).toContain("expected=\"$(tr -d '[:space:]' < .nvmrc)\"")
    expect(workflow).toContain('npm run check')
    expect(workflow).toContain('deploy-dev-static.sh "$MERIDIAN_RELEASE_SHA"')
  })

  it('publishes only exact committed bytes into an immutable SHA release', () => {
    expect(deploy).toContain('git archive --format=tar "$release_sha"')
    expect(deploy).toContain('/var/www/efolusi/meridian-dev')
    expect(deploy).toContain('release="$releases_root/$release_sha"')
    expect(deploy).toContain('meridian-release.txt')
    expect(deploy).toContain('mv -Tf "$next" "$deploy_root/current"')
    expect(deploy).toContain('runner_user="meridian-deploy"')
  })

  it('rolls back only the release symlink when validation or probes fail', () => {
    expect(deploy).toContain('trap rollback ERR')
    expect(deploy).toContain('mv -Tf "$rollback_link" "$deploy_root/current"')
    expect(deploy).toContain('for mode in origin public')
    expect(deploy).toContain('rollback 68')
    expect(deploy).not.toContain('exit 68')
  })

  it('publishes traversable release directories under a restrictive umask', () => {
    const fixture = mkdtempSync(join(tmpdir(), 'meridian-release-mode-'))

    try {
      execFileSync('/bin/bash', [
        '-c',
        'set -Eeuo pipefail; umask 077; install -d -m 0755 "$1/release"',
        'bash',
        fixture,
      ])
      expect(statSync(join(fixture, 'release')).mode & 0o777).toBe(0o755)
      expect(deploy).toContain('install -d -m 0755 "$candidate"')
      expect(deploy).toContain("stat -c '%U:%G:%a' \"$release\"")
    } finally {
      rmSync(fixture, { recursive: true, force: true })
    }
  })

  it('uses the rollback function for explicit probe failures', () => {
    const fixture = mkdtempSync(join(tmpdir(), 'meridian-release-rollback-'))
    const deployRoot = join(fixture, 'deploy')
    const newRelease = join(deployRoot, 'releases', 'new')

    let exitStatus
    try {
      execFileSync('/bin/mkdir', ['-p', newRelease])

      const rollbackSource = deploy.match(/rollback\(\) \{[\s\S]*?\n\}/)?.[0]
      expect(rollbackSource).toBeTruthy()

      execFileSync('/bin/bash', [
        '-c',
        `set -Eeuo pipefail
archive_dir="$1/archive"
publication_dir="$1/publication"
deploy_root="$1/deploy"
previous_current=""
deployment_started=true
cleanup() { rm -rf "$archive_dir" "$publication_dir"; }
${rollbackSource}
ln -sfn "$1/deploy/releases/new" "$1/deploy/current"
rollback 68`,
        'bash',
        fixture,
      ], { stdio: 'ignore' })
    } catch (error) {
      exitStatus = error.status
    } finally {
      expect(exitStatus).toBe(68)
      expect(existsSync(join(deployRoot, 'current'))).toBe(false)
      rmSync(fixture, { recursive: true, force: true })
    }
  })

  it('has no privileged runtime or unrelated infrastructure access', () => {
    expect(`${workflow}\n${deploy}`).not.toMatch(/\bsudo\b/)
    expect(`${workflow}\n${deploy}`).not.toMatch(/\bdocker\b/i)
    expect(`${workflow}\n${deploy}`).not.toMatch(/\bssh\b/i)
    expect(`${workflow}\n${deploy}`).not.toMatch(/database|postgres|redis|valkey|minio|nats/i)
    expect(deploy).toContain('cmp --silent "$tracked_vhost" "$available"')
    expect(deploy).toContain('[[ ! -w "$available" && ! -w "$enabled" ]]')
  })

  it('documents the exact one-time host ownership and environment boundary', () => {
    expect(runnerPrerequisites).toContain('`meridian-deploy:meridian-deploy` mode `0755`')
    expect(runnerPrerequisites).toContain('`root:root` mode `0644`')
    expect(runnerPrerequisites).toContain('runner `2.327.1` or newer')
    expect(runnerPrerequisites).toContain('No `sudo` permission')
    expect(runnerPrerequisites).toContain('No Docker socket')
    expect(runnerPrerequisites).toContain('No SSH private key')
    expect(runnerPrerequisites).toContain(
      'No database, object-storage, queue, or application secrets',
    )
  })

  it('serves an exact static host and does not invent an application runtime', () => {
    expect(nginx).toContain('server_name dev-meridian.efolusi.com;')
    expect(nginx).toContain('include snippets/efolusi-ssl.conf;')
    expect(nginx).toContain('root /var/www/efolusi/meridian-dev/current;')
    expect(nginx).toContain('try_files $uri $uri/ =404;')
    expect(nginx).not.toContain('proxy_pass')
    expect(`${workflow}\n${deploy}`).not.toMatch(/\bpm2\b/i)
    expect(`${workflow}\n${deploy}\n${nginx}`).not.toMatch(/datastore|database|api upstream/i)
  })
})
