import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const workflow = readFileSync('.github/workflows/deploy-dev-static.yml', 'utf8')
const deploy = readFileSync('scripts/deploy-dev-static.sh', 'utf8')
const nginx = readFileSync('nginx/dev-meridian.efolusi.com.conf', 'utf8')

describe('Meridian development static deployment', () => {
  it('is dev-only and uses the canonical self-hosted Node 22 runner', () => {
    expect(workflow).toContain('branches: [dev]')
    expect(workflow).not.toContain('branches: [main]')
    expect(workflow).toContain('runs-on: [self-hosted, Linux, X64, efolusi]')
    expect(workflow).toContain('source "$HOME/.nvm/nvm.sh"')
    expect(workflow).toContain("expected=\"$(tr -d '[:space:]' < .nvmrc)\"")
    expect(workflow).toContain('npm run check')
    expect(workflow).toContain('deploy-dev-static.sh "$MERIDIAN_RELEASE_SHA"')
  })

  it('publishes only exact committed bytes into an immutable SHA release', () => {
    expect(deploy).toContain('git archive --format=tar "$release_sha"')
    expect(deploy).toContain('/var/www/efolusi/meridian-dev')
    expect(deploy).toContain('release="$releases/$RELEASE_SHA"')
    expect(deploy).toContain('meridian-release.txt')
    expect(deploy).toContain('mv -Tf "$next" "$root/current"')
    expect(deploy).toContain('"${docker[@]}" run --rm')
  })

  it('rolls back the symlink and vhost when validation or probes fail', () => {
    expect(deploy).toContain('trap rollback ERR')
    expect(deploy).toContain('write_root_file "${backup_dir}/available" "$available"')
    expect(deploy).toContain('nginx -t')
    expect(deploy).toContain('systemctl reload nginx')
    expect(deploy).toContain('for mode in origin public')
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
