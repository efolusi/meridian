import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// MD20 (#184): a missing "])," in Docs.dc.html broke its whole page script on the live
// site, and no check noticed. Every site page's logic script must at least compile.
const pages = readdirSync('site').filter((f) => f.endsWith('.dc.html'));

describe('site page scripts', () => {
  it.each(pages)('%s: the data-dc-script compiles', (page) => {
    const html = readFileSync(`site/${page}`, 'utf8');
    const scripts = [...html.matchAll(/<script type="text\/x-dc" data-dc-script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    expect(scripts.length, `${page} has no data-dc-script`).toBeGreaterThan(0);
    for (const source of scripts) {
      expect(() => new Function('DCLogic', source), page).not.toThrow();
    }
  });
});

describe('check_public_facts current_text', () => {
  // Load only the function from the script, so the test does not run the whole check.
  const run = (body) => spawnSync('python3', ['-c', `
import ast, pathlib, re, sys, tempfile
src = pathlib.Path("scripts/check_public_facts.py").read_text()
fn = next(n for n in ast.parse(src).body if isinstance(n, ast.FunctionDef) and n.name == "current_text")
ns = {"re": re}
exec(compile(ast.Module(body=[fn], type_ignores=[]), "current_text", "exec"), ns)
p = pathlib.Path(tempfile.mkdtemp()) / "page.html"
p.write_text(sys.argv[1])
print(ns["current_text"](p), end="")
`, body], { encoding: 'utf8' });

  it('blanks the changelog history and keeps the text after it', () => {
    const r = run("intro 221 tokens\n      { group: 'Reference', id: 'changelog', blocks: [\n        ['201 tokens'],\n      ] },\n  id: 221 token,");
    expect(r.status).toBe(0);
    expect(r.stdout).toContain('intro 221 tokens');
    expect(r.stdout).not.toContain('201 tokens');
    expect(r.stdout).toContain('id: 221 token,');
    expect(r.stdout.split('\n')).toHaveLength(5);
  });

  it('fails closed when the changelog section has no end marker', () => {
    const r = run("{ group: 'Reference', id: 'changelog', blocks: [\n ['201 tokens'],");
    expect(r.status).not.toBe(0);
    expect(r.stderr).toContain('changelog section has no closing');
  });
});
