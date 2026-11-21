import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'

// A symlink in the repo points at one machine's path. #210 committed a `node_modules` symlink to
// an absolute local path by accident; `node_modules/` in .gitignore does not match a symlink.
describe('tracked files', () => {
  it('include no symlink', () => {
    const entries = execFileSync('git', ['ls-files', '-s'], { encoding: 'utf8' }).split('\n').filter(Boolean)
    const links = entries.filter((line) => line.startsWith('120000')).map((line) => line.split('\t')[1])
    expect(links).toEqual([])
  })
})
