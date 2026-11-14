import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { EXIT, main } from '../packages/cli/src/cli.mjs';
import { checkTarget, DiskError, resolveInside, UnsafeError } from '../packages/cli/src/paths.mjs';
import { dependencyName, fetchText, MAX_RESPONSE_BYTES, openRegistry, parseItem, RegistryError } from '../packages/cli/src/registry.mjs';
import { npmDependencies, resolveItems } from '../packages/cli/src/resolve.mjs';
import { applyPlan, planWrites } from '../packages/cli/src/write.mjs';

const BIN = path.resolve('packages/cli/bin/meridian.js');
const SITE_REGISTRY = path.resolve('site/registry');

let tmp;
beforeEach(async () => {
  tmp = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'meridian-cli-')));
});
afterEach(async () => {
  await fs.rm(tmp, { recursive: true, force: true });
});

function memoryIo(extra = {}) {
  const out = { text: '' };
  const err = { text: '' };
  return {
    out,
    err,
    io: {
      stdout: { write: chunk => { out.text += chunk; } },
      stderr: { write: chunk => { err.text += chunk; } },
      cwd: tmp,
      ...extra,
    },
  };
}

function item(name, { deps = [], files = [{ target: `components/${name}.jsx`, content: `// ${name}\n` }], npm = [] } = {}) {
  return { name, type: 'registry:ui', description: `${name} item`, registryDependencies: deps, dependencies: npm, files };
}

function fakeRegistry(items) {
  const byName = new Map(items.map(entry => [entry.name, entry]));
  return {
    base: new URL('https://registry.test/r/'),
    loads: [],
    async item(name) {
      this.loads.push(name);
      if (!byName.has(name)) throw new RegistryError(`"${name}" is not in the registry`);
      return byName.get(name);
    },
  };
}

async function writeRegistry(dir, items) {
  await fs.mkdir(dir, { recursive: true });
  for (const entry of items) {
    await fs.writeFile(path.join(dir, `${entry.name}.json`), JSON.stringify({
      name: entry.name,
      type: entry.type,
      description: entry.description,
      dependencies: entry.dependencies,
      registryDependencies: entry.registryDependencies,
      files: entry.files.map(file => ({ path: file.target, content: file.content })),
    }));
  }
}

describe('file target safety', () => {
  it.each([
    ['/etc/passwd', 'absolute'],
    ['C:/Windows/x.js', 'absolute'],
    ['c:x.js', 'absolute'],
    ['../outside.js', '".."'],
    ['components/../../outside.js', '".."'],
    ['components/./Button.jsx', '"."'],
    ['components//Button.jsx', 'empty'],
    ['components\\Button.jsx', 'backslash'],
    ['components/Button.jsx\u0000.txt', 'control character'],
    ['components/\nButton.jsx', 'control character'],
    ['', 'invalid'],
  ])('rejects %j', (target, reason) => {
    expect(() => checkTarget(target)).toThrow(UnsafeError);
    expect(() => checkTarget(target)).toThrow(reason);
  });

  it('rejects non-string targets', () => {
    expect(() => checkTarget(undefined)).toThrow(UnsafeError);
    expect(() => checkTarget(['a'])).toThrow(UnsafeError);
  });

  it('accepts nested relative targets', () => {
    expect(checkTarget('components/forms/Button.jsx')).toBe('components/forms/Button.jsx');
    expect(checkTarget('styles.css')).toBe('styles.css');
  });

  it('resolves a target inside --dir', async () => {
    expect(await resolveInside(tmp, 'components/forms/Button.jsx')).toBe(path.join(tmp, 'components', 'forms', 'Button.jsx'));
  });

  it('allows a --dir that does not exist yet', async () => {
    const dir = path.join(tmp, 'new', 'ui');
    expect(await resolveInside(dir, 'a/b.jsx')).toBe(path.join(dir, 'a', 'b.jsx'));
  });

  it('refuses a symlinked folder inside --dir that points outside it', async () => {
    const dir = path.join(tmp, 'project');
    const outside = path.join(tmp, 'outside');
    await fs.mkdir(dir);
    await fs.mkdir(outside);
    await fs.symlink(outside, path.join(dir, 'components'));
    await expect(resolveInside(dir, 'components/Button.jsx')).rejects.toThrow(DiskError);
    await expect(resolveInside(dir, 'components/deep/Button.jsx')).rejects.toThrow('through a symlink');
  });

  it('allows a symlinked folder that stays inside --dir', async () => {
    const dir = path.join(tmp, 'project');
    await fs.mkdir(path.join(dir, 'real'), { recursive: true });
    await fs.symlink(path.join(dir, 'real'), path.join(dir, 'components'));
    expect(await resolveInside(dir, 'components/Button.jsx')).toBe(path.join(dir, 'components', 'Button.jsx'));
  });

  it('refuses to write through a symlinked file', async () => {
    const dir = path.join(tmp, 'project');
    await fs.mkdir(dir);
    await fs.writeFile(path.join(tmp, 'secret'), 'x');
    await fs.symlink(path.join(tmp, 'secret'), path.join(dir, 'styles.css'));
    await expect(resolveInside(dir, 'styles.css')).rejects.toThrow('symlink');
  });
});

describe('registry item parsing', () => {
  const valid = { name: 'button', files: [{ path: 'components/forms/Button.jsx', content: 'x' }] };

  it('uses target over path', () => {
    const parsed = parseItem(JSON.stringify({ ...valid, files: [{ path: 'a/b.jsx', target: 'c/d.jsx', content: 'x' }] }), 'button');
    expect(parsed.files).toEqual([{ target: 'c/d.jsx', content: 'x' }]);
  });

  it('rejects an item that names itself differently', () => {
    expect(() => parseItem(JSON.stringify({ ...valid, name: 'card' }), 'button')).toThrow('expected "button"');
  });

  it('rejects a traversal target inside an item', () => {
    expect(() => parseItem(JSON.stringify({ ...valid, files: [{ path: '../../.bashrc', content: 'x' }] }), 'button')).toThrow(UnsafeError);
  });

  it('rejects odd npm dependency strings', () => {
    expect(() => parseItem(JSON.stringify({ ...valid, dependencies: ['react; rm -rf /'] }), 'button')).toThrow('not an npm package name');
    expect(parseItem(JSON.stringify({ ...valid, dependencies: ['recharts@^3.8.0', '@types/react'] }), 'button').dependencies)
      .toEqual(['recharts@^3.8.0', '@types/react']);
  });

  it('rejects invalid JSON and files without content', () => {
    expect(() => parseItem('{', 'button')).toThrow('not valid JSON');
    expect(() => parseItem(JSON.stringify({ ...valid, files: [{ path: 'a.jsx' }] }), 'button')).toThrow('no content');
  });

  it('maps registry dependency URLs to names only inside known registries', () => {
    const registry = { base: new URL('https://registry.test/r/') };
    expect(dependencyName('icon', registry)).toBe('icon');
    expect(dependencyName('https://meridian.efolusi.com/site/registry/icon.json', registry)).toBe('icon');
    expect(dependencyName('https://registry.test/r/icon.json', registry)).toBe('icon');
    expect(() => dependencyName('https://evil.test/r/icon.json', registry)).toThrow('outside this registry');
    expect(() => dependencyName('https://registry.test/r/sub/icon.json', registry)).toThrow('outside this registry');
    expect(() => dependencyName('../icon', registry)).toThrow('invalid item name');
  });
});

describe('dependency resolution', () => {
  it('orders dependencies before the items that need them, each once', async () => {
    const registry = fakeRegistry([
      item('base'),
      item('icon', { deps: ['base'] }),
      item('button', { deps: ['base', 'icon'] }),
      item('dialog', { deps: ['button', 'https://registry.test/r/icon.json'] }),
    ]);
    const resolved = await resolveItems(['dialog', 'button'], registry);
    expect(resolved.map(entry => entry.name)).toEqual(['base', 'icon', 'button', 'dialog']);
    expect(registry.loads).toEqual(['dialog', 'button', 'base', 'icon']);
  });

  it('stops at a cycle instead of looping', async () => {
    const registry = fakeRegistry([item('a', { deps: ['b'] }), item('b', { deps: ['c'] }), item('c', { deps: ['a'] })]);
    const resolved = await resolveItems(['a'], registry);
    expect(resolved.map(entry => entry.name).sort()).toEqual(['a', 'b', 'c']);
  });

  it('names the chain that needed a missing dependency', async () => {
    const registry = fakeRegistry([item('dialog', { deps: ['button'] }), item('button', { deps: ['ghost'] })]);
    await expect(resolveItems(['dialog'], registry)).rejects.toThrow('"ghost" is not in the registry (needed by button <- dialog)');
  });

  it('rejects an unsafe requested name before loading anything', async () => {
    const registry = fakeRegistry([]);
    await expect(resolveItems(['../etc/passwd'], registry)).rejects.toThrow(UnsafeError);
    expect(registry.loads).toEqual([]);
  });

  it('collects npm packages once, keeping a version range', () => {
    expect(npmDependencies([item('a', { npm: ['react'] }), item('b', { npm: ['react', 'recharts@^3.8.0'] }), item('c', { npm: ['recharts'] })]))
      .toEqual(['react', 'recharts@^3.8.0']);
  });
});

describe('conflicts and writing', () => {
  it('classifies create, unchanged, conflict and overwrite', async () => {
    await fs.mkdir(path.join(tmp, 'components'));
    await fs.writeFile(path.join(tmp, 'components', 'same.jsx'), '// same\n');
    await fs.writeFile(path.join(tmp, 'components', 'edited.jsx'), '// mine\n');
    const items = [item('same'), item('edited'), item('fresh')];

    const plan = await planWrites(items, tmp);
    expect(Object.fromEntries(plan.map(entry => [entry.target, entry.status]))).toEqual({
      'components/same.jsx': 'unchanged',
      'components/edited.jsx': 'conflict',
      'components/fresh.jsx': 'create',
    });
    await expect(applyPlan(plan, tmp)).rejects.toThrow('conflicts');

    const forced = await planWrites(items, tmp, { overwrite: true });
    const written = await applyPlan(forced, tmp);
    expect(written.map(entry => entry.target)).toEqual(['components/edited.jsx', 'components/fresh.jsx']);
    expect(await fs.readFile(path.join(tmp, 'components', 'edited.jsx'), 'utf8')).toBe('// edited\n');
  });

  it('refuses two items that write one path with different content', async () => {
    const a = item('a', { files: [{ target: 'shared.js', content: '1' }] });
    const b = item('b', { files: [{ target: 'shared.js', content: '2' }] });
    await expect(planWrites([a, b], tmp)).rejects.toThrow('both write shared.js');
    const c = item('c', { files: [{ target: 'shared.js', content: '1' }] });
    expect((await planWrites([a, c], tmp)).length).toBe(1);
  });

  it('add exits 1 on a conflict and writes nothing', async () => {
    const registryDir = path.join(tmp, 'reg');
    await writeRegistry(registryDir, [item('one'), item('two')]);
    await fs.mkdir(path.join(tmp, 'out', 'components'), { recursive: true });
    await fs.writeFile(path.join(tmp, 'out', 'components', 'two.jsx'), '// mine\n');

    const { io, err } = memoryIo();
    const code = await main(['add', 'one', 'two', '--registry', registryDir, '--dir', 'out'], io);
    expect(code).toBe(EXIT.CONFLICT);
    expect(err.text).toContain('components/two.jsx');
    await expect(fs.access(path.join(tmp, 'out', 'components', 'one.jsx'))).rejects.toThrow();
  });

  it('--dry-run reports the plan and writes nothing', async () => {
    const registryDir = path.join(tmp, 'reg');
    await writeRegistry(registryDir, [item('base'), item('one', { deps: ['base'], npm: ['react'] })]);
    const { io, out } = memoryIo();
    const code = await main(['add', 'one', '--registry', registryDir, '--dir', 'out', '--dry-run'], io);
    expect(code).toBe(EXIT.OK);
    expect(out.text).toContain('would create   components/base.jsx');
    expect(out.text).toContain('Nothing was written');
    expect(out.text).toContain('npm install react');
    await expect(fs.access(path.join(tmp, 'out'))).rejects.toThrow();
  });

  it('a registry item with a traversal target exits 3 and writes nothing', async () => {
    const registryDir = path.join(tmp, 'reg');
    await fs.mkdir(registryDir);
    await fs.writeFile(path.join(registryDir, 'bad.json'), JSON.stringify({ name: 'bad', files: [{ path: '../escape.js', content: 'x' }] }));
    const { io, err } = memoryIo();
    expect(await main(['add', 'bad', '--registry', registryDir, '--dir', 'out'], io)).toBe(EXIT.REGISTRY);
    expect(err.text).toContain('".."');
    await expect(fs.access(path.join(tmp, 'escape.js'))).rejects.toThrow();
  });
});

describe('arguments', () => {
  it.each([
    [['add'], EXIT.USAGE],
    [['frobnicate'], EXIT.USAGE],
    [['add', 'button', '--bogus'], EXIT.USAGE],
    [['add', 'button', '--registry', 'file:///etc'], EXIT.USAGE],
    [['add', 'button', '--registry'], EXIT.USAGE],
    [['add', 'button', '--registry='], EXIT.USAGE],
    [['add', 'button', '--dir='], EXIT.USAGE],
    [[], EXIT.USAGE],
    [['--help'], EXIT.OK],
  ])('%j exits %i', async (argv, code) => {
    const { io } = memoryIo();
    expect(await main(argv, io)).toBe(code);
  });
});

describe('http registry', () => {
  const response = (status, body = '', headers = {}) => new Response(status >= 300 && status < 400 ? null : body, { status, headers });

  it('follows a same-origin redirect', async () => {
    const calls = [];
    const fetchImpl = async url => {
      calls.push(url.href);
      return url.pathname === '/old/button.json'
        ? response(301, '', { location: '/new/button.json' })
        : response(200, JSON.stringify({ name: 'button', files: [] }));
    };
    const registry = await openRegistry('https://registry.test/old', { fetchImpl });
    expect((await registry.item('button')).name).toBe('button');
    expect(calls).toEqual(['https://registry.test/old/button.json', 'https://registry.test/new/button.json']);
  });

  it('refuses a redirect to another origin', async () => {
    const fetchImpl = async () => response(302, '', { location: 'https://elsewhere.test/button.json' });
    const registry = await openRegistry('https://registry.test/r/', { fetchImpl });
    await expect(registry.item('button')).rejects.toThrow('redirects to another origin (https://elsewhere.test)');
  });

  it('stops reading a body past the size limit', async () => {
    const big = new Uint8Array(MAX_RESPONSE_BYTES + 1);
    const fetchImpl = async () => new Response(new ReadableStream({
      start(controller) {
        controller.enqueue(big);
        controller.close();
      },
    }));
    await expect(fetchText(new URL('https://registry.test/r/a.json'), fetchImpl)).rejects.toThrow('larger than');
  });

  it('refuses a declared Content-Length past the limit', async () => {
    const fetchImpl = async () => response(200, '{}', { 'content-length': String(MAX_RESPONSE_BYTES + 1) });
    await expect(fetchText(new URL('https://registry.test/r/a.json'), fetchImpl)).rejects.toThrow('larger than');
  });

  it('reports 404 as a missing item', async () => {
    const { io, err } = memoryIo({ fetchImpl: async () => response(404) });
    expect(await main(['add', 'nope', '--registry', 'https://registry.test/r/'], io)).toBe(EXIT.REGISTRY);
    expect(err.text).toContain('"nope" is not in the registry');
  });

  it('lists the index next to the item folder', async () => {
    const seen = [];
    const fetchImpl = async url => {
      seen.push(url.href);
      return response(200, JSON.stringify({ items: [{ name: 'button', description: 'A\u001b[31m button\nthat acts' }] }));
    };
    const { io, out } = memoryIo({ fetchImpl });
    expect(await main(['list', '--registry', 'https://registry.test/site/registry/'], io)).toBe(EXIT.OK);
    expect(seen).toEqual(['https://registry.test/site/registry.json']);
    expect(out.text).toBe('button  A [31m button that acts\n');
  });
});

describe('meridian bin against site/registry', () => {
  const run = (...args) => spawnSync(process.execPath, [BIN, ...args], { cwd: tmp, encoding: 'utf8' });

  it('adds an item with its registry dependencies, then reports them unchanged', () => {
    const first = run('add', 'dialog', '--registry', SITE_REGISTRY, '--dir', 'app');
    expect(first.status, first.stderr).toBe(0);
    expect(first.stdout).toContain('Items: meridian-base, icon, button, iconbutton, portal, dialog');
    expect(first.stdout).toContain('npm install react');

    const second = run('add', 'dialog', '--registry', SITE_REGISTRY, '--dir', 'app');
    expect(second.status).toBe(0);
    expect(second.stdout).toContain('0 file(s) written');
  });

  it('writes the same bytes the registry carries', async () => {
    expect(run('add', 'button', '--registry', SITE_REGISTRY, '--dir', 'app').status).toBe(0);
    const source = JSON.parse(await fs.readFile(path.join(SITE_REGISTRY, 'button.json'), 'utf8'));
    for (const file of source.files) {
      expect(await fs.readFile(path.join(tmp, 'app', file.target ?? file.path), 'utf8')).toBe(file.content);
    }
  });

  it('lists every registry item from the local index', async () => {
    const result = run('list', '--registry', SITE_REGISTRY);
    expect(result.status).toBe(0);
    const index = JSON.parse(await fs.readFile(path.resolve('site/registry.json'), 'utf8'));
    expect(result.stdout.trim().split('\n')).toHaveLength(index.items.length);
    expect(result.stdout).toMatch(/^button +The action button/m);
  });

  // Imports can span lines (`import {\n  Dialog,\n} from '../feedback/Dialog.jsx'`);
  // Drawer and Menubar once shipped without the item they import.
  it('every item brings the files its relative imports need', async () => {
    const registry = await openRegistry(SITE_REGISTRY);
    const names = (await fs.readdir(SITE_REGISTRY)).map(file => file.slice(0, -'.json'.length));
    const missing = [];
    for (const name of names) {
      const items = await resolveItems([name], registry);
      const targets = new Set(items.flatMap(entry => entry.files.map(file => file.target)));
      for (const file of items.flatMap(entry => entry.files)) {
        if (!/\.jsx?$/.test(file.target)) continue;
        for (const [, spec] of file.content.matchAll(/^import\s[^;]*?\sfrom\s+'(\.[^']+)';/gm)) {
          const wanted = path.posix.normalize(path.posix.join(path.posix.dirname(file.target), spec));
          if (!['', '.jsx', '.js'].some(ext => targets.has(wanted + ext))) missing.push(`${name}: ${file.target} imports ${spec}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it('prints the version from its package.json', async () => {
    const pkg = JSON.parse(await fs.readFile(path.resolve('packages/cli/package.json'), 'utf8'));
    expect(run('--version').stdout.trim()).toBe(pkg.version);
  });
});

describe('hostile registry content', () => {
  it.each([
    ['%2e%2e/outside.js', 'encoded dots'],
    ['components/%2e%2e/x.js', 'encoded dots inside'],
    ['․․/outside.js', 'one-dot-leader lookalike of ..'],
    ['．．/outside.js', 'fullwidth dots'],
    ['components∕..∕x.js', 'division slash lookalike'],
    ['components/\u009b31mButton.jsx', 'C1 control (CSI)'],
    ['components/‮Button.jsx', 'bidi override'],
    ['components/Button.jsx​', 'zero-width space'],
    ['components/Button.jsx:stream', 'NTFS alternate data stream'],
    ['components/.. /x.js', 'dot-dot-space (Windows strips trailing spaces)'],
    ['components/.../x.js', 'dots only'],
    ['components/x./y.js', 'trailing dot'],
    ['.git/hooks/pre-commit', '.git folder'],
    ['sub/.GIT/config', '.git folder, other case'],
    ['components/nul.jsx', 'Windows device name'],
    ['COM1', 'Windows device name'],
  ])('rejects %j (%s)', target => {
    expect(() => checkTarget(target)).toThrow(UnsafeError);
  });

  it('keeps ordinary dotfiles and punctuation the registry uses', () => {
    expect(checkTarget('components/forms/_shared.jsx')).toBe('components/forms/_shared.jsx');
    expect(checkTarget('.meridian/prompt.md')).toBe('.meridian/prompt.md');
    expect(checkTarget('docs/button.prompt.md')).toBe('docs/button.prompt.md');
  });

  it('quotes npm specs that a shell would read as operators in the install hint', async () => {
    const registryDir = path.join(tmp, 'reg');
    await writeRegistry(registryDir, [item('one', { npm: ['react', 'x@>=1 <2 | sh', 'y@1 > .bashrc'] })]);
    const { io, out } = memoryIo();
    expect(await main(['add', 'one', '--registry', registryDir, '--dir', 'out', '--dry-run'], io)).toBe(EXIT.OK);
    expect(out.text).toContain('npm install react "x@>=1 <2 | sh" "y@1 > .bashrc"');
  });

  it('JSON __proto__ keys do not reach Object.prototype or the parsed item', () => {
    const text = '{"__proto__":{"polluted":true,"files":[{"path":"../x","content":"x"}]},"name":"button","constructor":{"prototype":{"polluted":true}}}';
    const parsed = parseItem(text, 'button');
    expect(parsed.files).toEqual([]);
    expect({}.polluted).toBeUndefined();
    expect(Object.prototype.polluted).toBeUndefined();
  });

  it('strips terminal control and bidi characters from error messages', async () => {
    const registryDir = path.join(tmp, 'reg');
    await fs.mkdir(registryDir);
    await fs.writeFile(path.join(registryDir, 'bad.json'), JSON.stringify({ name: 'x\u009b2J‮evil', files: [] }));
    const { io, err } = memoryIo();
    expect(await main(['add', 'bad', '--registry', registryDir], io)).toBe(EXIT.REGISTRY);
    expect(err.text).toContain('names itself');
    expect(err.text).not.toMatch(/[\u0080-\u009f‪-‮⁦-⁩]/);
  });

  it('strips bidi characters from list descriptions', async () => {
    const fetchImpl = async () => new Response(JSON.stringify({ items: [{ name: 'button', description: 'safe‮dlrow' }] }));
    const { io, out } = memoryIo({ fetchImpl });
    expect(await main(['list', '--registry', 'https://registry.test/site/registry/'], io)).toBe(EXIT.OK);
    expect(out.text).not.toMatch(/[‪-‮⁦-⁩]/);
  });

  it('--overwrite does not follow a symlink swapped in after the last check', async () => {
    const dir = path.join(tmp, 'project');
    await fs.mkdir(dir);
    await fs.writeFile(path.join(dir, 'a.js'), 'old');
    await fs.writeFile(path.join(tmp, 'secret'), 'keep');
    const plan = await planWrites([item('a', { files: [{ target: 'a.js', content: 'new' }] })], dir, { overwrite: true });
    expect(plan[0].status).toBe('overwrite');
    const realLstat = fs.lstat;
    let calls = 0;
    fs.lstat = async (...args) => {
      const result = await realLstat(...args);
      calls += 1;
      // applyPlan checks twice; swap the file for a link right after the second check.
      if (calls === 2) {
        await fs.rm(path.join(dir, 'a.js'));
        await fs.symlink(path.join(tmp, 'secret'), path.join(dir, 'a.js'));
      }
      return result;
    };
    try {
      await expect(applyPlan(plan, dir)).rejects.toThrow();
    } finally {
      fs.lstat = realLstat;
    }
    expect(await fs.readFile(path.join(tmp, 'secret'), 'utf8')).toBe('keep');
  });
});
