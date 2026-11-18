import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { afterEach, describe, expect, it } from 'vitest';
import contracts from '../packages/guard/src/generated/meridian-rules.json';
import { applyFixes, guard, scanSource, scanStyleSource } from '../packages/guard/src/scanner.mjs';
import { formatJson, formatPretty } from '../packages/guard/src/reporter.mjs';

const temporaryDirectories = [];
afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map(directory => fs.rm(directory, { recursive: true, force: true })));
});

function rules(source) {
  return scanSource(source, '/app/src/Example.jsx', contracts).map(item => item.ruleId);
}

describe('Meridian Guard rules', () => {
  it('accepts valid aliased and namespace component usage', () => {
    const diagnostics = scanSource(`
      import { Icon as Glyph, IconButton } from '@efolusi/meridian';
      import * as Meridian from '@efolusi/meridian';
      export function Example() {
        return <Meridian.Card><Glyph name="check" /><IconButton icon="copy" label="Copy" /></Meridian.Card>;
      }
    `, '/app/src/Example.jsx', contracts);
    expect(diagnostics).toEqual([]);
  });

  it('reports unknown components and static icon names', () => {
    expect(rules(`
      import { Imaginary, Icon } from '@efolusi/meridian';
      export const Example = () => <Icon name="not-a-real-glyph" />;
    `)).toEqual(['MDG001', 'MDG002']);
    expect(rules(`
      import * as Meridian from '@efolusi/meridian';
      export const Example = () => <Meridian.Imaginary />;
    `)).toEqual(['MDG001']);
  });

  it('allows lowercase utility exports from the Meridian package', () => {
    const diagnostics = scanSource(`
      import { buttonVariants, toast } from '@efolusi/meridian';
      export const classes = buttonVariants({ variant: 'primary' });
      export const notify = () => toast('Saved');
    `, '/app/src/helpers.jsx', contracts);
    expect(diagnostics).toEqual([]);
  });

  it('supports documented deep imports and reports parse failures', () => {
    expect(rules(`
      import { Button } from '@efolusi/meridian/forms/Button.js';
      export const Example = () => <Button>Save</Button>;
    `)).toEqual([]);
    expect(rules(`
      import preset from '@efolusi/meridian/tailwind.preset.cjs';
      import { Player, type PlayerHandle } from '@efolusi/meridian/ai/Player.js';
      import type { DialogProps } from '@efolusi/meridian/feedback/Dialog.js';
      export const Example = () => <Player />;
    `)).toEqual([]);
    expect(rules('export const broken = <')).toEqual(['MDG000']);
  });

  it('reports raw inline colors but ignores colors in visible prose', () => {
    const found = rules(`
      import { Card } from '@efolusi/meridian';
      export const Example = () => <Card style={{ color: '#fff' }}>The value #123 is an issue number.</Card>;
    `);
    expect(found).toEqual(['MDG003']);
    expect(rules('export const issue = `Invoice #10422 paid`;')).toEqual([]);
    expect(rules('const cardCss = `.card { color: #fff; }`; export const issue = cardCss;')).toEqual(['MDG003']);
  });

  it('rejects undefined Meridian radius tokens in authored styles', () => {
    expect(rules('const cardCss = `.card { border-radius: var(--radius-tiny); }`; export const card = cardCss;')).toEqual(['MDG006']);
    expect(rules('const cardCss = `.card { border-radius: var(--radius-sm); }`; export const card = cardCss;')).toEqual([]);
  });

  // Deprecation policy: a deprecated prop keeps working with a warning until the
  // next major, so every entry must name its prop and say when it goes.
  it('ships deprecated prop contracts only with a named prop and a next-major removal', () => {
    expect(contracts.deprecated.map(d => `${d.component}.${d.prop}`)).toEqual(['Drawer.modal']);
    for (const d of contracts.deprecated) {
      expect(d.message).toMatch(/next major/);
      expect(d.message).toContain('guidelines/migration.md');
      expect(d.message).not.toContain('@codemod');
    }
    expect(contracts.deprecated.find(d => d.prop === 'modal').codemod).toBe('remove');
  });

  it('removes ignored deprecated props with --fix and leaves the rest of the element alone', () => {
    const source = `
      import { Drawer as Panel } from '@efolusi/meridian';
      import * as M from '@efolusi/meridian';
      export const A = () => <Panel modal={false} direction="right">x</Panel>;
      export const B = () => (
        <M.Drawer
          open
          modal
          onOpenChange={() => {}}
        />
      );
      export const C = ({ keep }) => <Panel modal={keep} />;
    `;
    const diagnostics = scanSource(source, '/app/src/Example.jsx', contracts);
    expect(diagnostics.map(item => [item.ruleId, Boolean(item.fix)])).toEqual([['MDG004', true], ['MDG004', true], ['MDG004', true]]);
    const { output, applied } = applyFixes(source, diagnostics);
    expect(applied).toBe(3);
    expect(output).toContain('<Panel direction="right">x</Panel>');
    expect(output).toContain('<M.Drawer\n          open\n          onOpenChange={() => {}}\n        />');
    expect(output).toContain('<Panel />');
    expect(scanSource(output, '/app/src/Example.jsx', contracts)).toEqual([]);
  });

  it('does not rewrite a modal prop on a component that is not Meridian Drawer', () => {
    const source = `import { Drawer } from 'vaul'; export const A = () => <Drawer modal={false} />;`;
    const diagnostics = scanSource(source, '/app/src/Example.jsx', contracts);
    expect(applyFixes(source, diagnostics).output).toBe(source);
  });

  it('applies fixes in place from the CLI and reports them as fixable in JSON', async () => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'meridian-guard-fix-'));
    temporaryDirectories.push(directory);
    const sourceFile = path.join(directory, 'Example.jsx');
    const binary = path.resolve('packages/guard/bin/meridian-guard.js');
    await fs.writeFile(sourceFile, "import { Drawer } from '@efolusi/meridian'; export const A = () => <Drawer modal={false} />;");

    const report = spawnSync(process.execPath, [binary, sourceFile, '--format', 'json'], { encoding: 'utf8' });
    expect(report.status).toBe(1);
    expect(JSON.parse(report.stdout).diagnostics).toEqual([expect.objectContaining({ ruleId: 'MDG004', fixable: true })]);
    expect(report.stdout).not.toContain('"start"');

    const fixed = spawnSync(process.execPath, [binary, sourceFile, '--fix'], { encoding: 'utf8' });
    expect(fixed.status).toBe(0);
    expect(fixed.stdout).toContain('fixed 1 issue(s)');
    expect(await fs.readFile(sourceFile, 'utf8')).toBe("import { Drawer } from '@efolusi/meridian'; export const A = () => <Drawer />;");
  });

  it('enforces deterministic accessibility contracts', () => {
    expect(rules(`
      import { IconButton, Dialog, DialogContent, AlertDialogContent } from '@efolusi/meridian';
      export const Example = () => <><IconButton icon="copy" /><Dialog open /><DialogContent>Untitled</DialogContent><AlertDialogContent>Sure?</AlertDialogContent></>;
    `)).toEqual(['MDG005', 'MDG005', 'MDG005', 'MDG005']);
  });

  it('rejects consumer paint and radius overrides on Meridian actions', () => {
    expect(rules(`
      import { Button, IconButton } from '@efolusi/meridian';
      export const Example = () => <><Button className="grow bg-red-500 rounded-xl">Delete</Button><IconButton icon="copy" label="Copy" style={{ color: 'var(--text-link)' }} /></>;
    `)).toEqual(['MDG012', 'MDG012']);
    expect(rules(`
      import { Button } from '@efolusi/meridian';
      export const Example = () => <Button className="w-full justify-between">Save</Button>;
    `)).toEqual([]);
  });

  it('accepts compositional Dialog titles', () => {
    expect(rules(`
      import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@efolusi/meridian';
      export const Example = () => <Dialog><DialogContent><DialogHeader><DialogTitle>Composed</DialogTitle></DialogHeader></DialogContent></Dialog>;
    `)).toEqual([]);
  });

  it('recognizes an AlertDialogTitle nested inside wrappers', () => {
    expect(rules(`
      import { AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from '@efolusi/meridian';
      export const Example = () => <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Archive?</AlertDialogTitle></AlertDialogHeader></AlertDialogContent>;
    `)).toEqual([]);
  });
});

describe('Meridian Guard scanning and reporting', () => {
  it('checks CSS radius, elevation, motion and type hierarchy', () => {
    const diagnostics = scanStyleSource(`
      .good { border-radius: var(--radius-md); box-shadow: var(--shadow-lg); font-family: var(--font-sans); font-size: var(--text-md); transition: transform var(--dur-slow) var(--ease-out); }
      .bad { color: #fff; border-radius: 13px; box-shadow: 0 8px 20px rgba(0,0,0,.2); font-family: Inter, sans-serif; font-size: 15px; animation: enter 480ms ease; }
      .square { border-radius: 0; box-shadow: none; }
    `, '/app/src/styles.css', contracts);
    expect(diagnostics.map(item => item.ruleId)).toEqual(['MDG003', 'MDG007', 'MDG008', 'MDG010', 'MDG011', 'MDG009']);
    expect(diagnostics.every(item => item.line === 3)).toBe(true);
  });

  it('scans supported files recursively and ignores build directories', async () => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'meridian-guard-'));
    temporaryDirectories.push(directory);
    await fs.mkdir(path.join(directory, 'src'));
    await fs.mkdir(path.join(directory, 'dist'));
    await fs.mkdir(path.join(directory, '.next'));
    await fs.mkdir(path.join(directory, '.turbo'));
    await fs.mkdir(path.join(directory, '__tests__'));
    await fs.writeFile(path.join(directory, 'src', 'valid.tsx'), "import { Icon } from '@efolusi/meridian'; export const A = () => <Icon name='check' />;");
    await fs.writeFile(path.join(directory, 'src', 'invalid.jsx'), "import { Icon } from '@efolusi/meridian'; export const B = () => <Icon name='missing-icon' />;");
    await fs.writeFile(path.join(directory, 'src', 'styles.css'), '.panel { border-radius: 13px; }');
    await fs.writeFile(path.join(directory, 'dist', 'ignored.jsx'), 'this is not valid jsx {{{');
    await fs.writeFile(path.join(directory, '.next', 'ignored.js'), 'this is not valid jsx {{{');
    await fs.writeFile(path.join(directory, '.turbo', 'ignored.ts'), 'this is not valid jsx {{{');
    await fs.writeFile(path.join(directory, '__tests__', 'ignored.jsx'), 'this is not valid jsx {{{');
    await fs.writeFile(path.join(directory, 'ignored.test.tsx'), 'this is not valid jsx {{{');
    await fs.writeFile(path.join(directory, 'vendor.min.mjs'), 'this is not valid jsx {{{');
    await fs.symlink(path.join(directory, 'does-not-exist'), path.join(directory, 'broken-link'));
    const result = await guard([directory]);
    expect(result.filesScanned).toBe(3);
    expect(result.diagnostics.map(item => item.ruleId)).toEqual(['MDG002', 'MDG007']);
  });

  it('emits stable human and machine-readable summaries', () => {
    const result = {
      filesScanned: 1,
      diagnostics: [{ file: '/app/src/A.jsx', line: 2, column: 3, ruleId: 'MDG002', severity: 'error', message: 'Missing icon.' }],
    };
    expect(formatPretty(result, '/app')).toContain('src/A.jsx:2:3 error MDG002');
    expect(JSON.parse(formatJson(result))).toMatchObject({ version: 1, filesScanned: 1, errors: 1, warnings: 0 });
  });

  it('uses CI-safe CLI exit codes for clean and invalid source', async () => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'meridian-guard-cli-'));
    temporaryDirectories.push(directory);
    const sourceFile = path.join(directory, 'Example.jsx');
    const binary = path.resolve('packages/guard/bin/meridian-guard.js');
    await fs.writeFile(sourceFile, "import { Icon } from '@efolusi/meridian'; export const A = () => <Icon name='check' />;");
    const clean = spawnSync(process.execPath, [binary, sourceFile, '--format', 'json'], { encoding: 'utf8' });
    expect(clean.status).toBe(0);
    expect(JSON.parse(clean.stdout)).toMatchObject({ errors: 0, warnings: 0 });

    await fs.writeFile(sourceFile, "import { Icon } from '@efolusi/meridian'; export const A = () => <Icon name='missing-icon' />;");
    const invalid = spawnSync(process.execPath, [binary, sourceFile], { encoding: 'utf8' });
    expect(invalid.status).toBe(1);
    expect(invalid.stdout).toContain('error MDG002');
  });

  it('fails closed when a CLI target contains no supported source files', async () => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'meridian-guard-empty-'));
    temporaryDirectories.push(directory);
    await fs.writeFile(path.join(directory, 'README.md'), '# No authored source here\n');
    const binary = path.resolve('packages/guard/bin/meridian-guard.js');

    const empty = spawnSync(process.execPath, [binary, directory], { encoding: 'utf8' });
    expect(empty.status).toBe(2);
    expect(empty.stderr).toContain('no supported JavaScript, TypeScript, or CSS source files found');

    const allowed = spawnSync(process.execPath, [binary, directory, '--allow-empty', '--format', 'json'], { encoding: 'utf8' });
    expect(allowed.status).toBe(0);
    expect(JSON.parse(allowed.stdout)).toMatchObject({ filesScanned: 0, errors: 0, warnings: 0 });
  });
});
