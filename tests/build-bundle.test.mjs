import { describe, expect, it } from 'vitest';
import { compileSource, depsOf, order } from '../scripts/build_bundle.mjs';

describe('bundle compiler', () => {
  it('sees multi-line relative imports as dependency edges', () => {
    const src = [
      "import React from 'react';",
      'import {',
      '  Dialog,',
      '  DialogContent,',
      "} from '../feedback/Dialog.jsx';",
      'export function Drawer() { return <Dialog />; }',
    ].join('\n');
    const known = new Set(['components/feedback/Dialog.jsx', 'components/overlay/Drawer.jsx']);
    expect(depsOf('components/overlay/Drawer.jsx', src, known)).toEqual(['components/feedback/Dialog.jsx']);
  });

  it('emits a unit after the units it imports, even when the import spans lines', () => {
    const graph = new Map([
      ['components/feedback/Dialog.jsx', []],
      ['components/overlay/Drawer.jsx', ['components/feedback/Dialog.jsx']],
      ['components/a/Aaa.jsx', ['components/overlay/Drawer.jsx']],
    ]);
    expect(order([...graph.keys()], graph)).toEqual([
      'components/feedback/Dialog.jsx',
      'components/overlay/Drawer.jsx',
      'components/a/Aaa.jsx',
    ]);
  });

  it('rejects an aliased relative import instead of reading the alias off the scope', () => {
    const src = "import { Button as Btn } from '../forms/Button.jsx';\nexport function X() { return <Btn />; }\n";
    expect(() => compileSource('components/x/X.jsx', src)).toThrow(/aliased import/);
  });

  it('rejects export forms whose names it would silently drop', () => {
    expect(() => compileSource('components/x/X.jsx', 'function A() {}\nexport { A };\n')).toThrow(/export \{/);
    expect(() => compileSource('components/x/X.jsx', 'export default function A() {}\n')).toThrow(/export default/);
    expect(() => compileSource('components/x/X.jsx', 'export const { a, b } = obj;\n')).toThrow(/destructured export/);
  });

  it('rejects relative default and namespace imports', () => {
    expect(() => compileSource('components/x/X.jsx', "import B from '../forms/Button.jsx';\n")).toThrow(/default or namespace import/);
    expect(() => compileSource('components/x/X.jsx', "import * as B from '../forms/Button.jsx';\n")).toThrow(/default or namespace import/);
  });

  it('still compiles the supported shape', () => {
    const { unit, exportNames } = compileSource(
      'components/x/X.jsx',
      "import { Button } from '../forms/Button.jsx';\nexport function X() { return <Button />; }\n",
    );
    expect(exportNames).toEqual(['X']);
    expect(unit).toContain('__ds_scope.Button');
  });
});

describe('bundle compiler shared scope', () => {
  it('rejects two units exporting the same name into __ds_scope', async () => {
    const { assertUniqueExports } = await import('../scripts/build_bundle.mjs');
    const exportsBySource = new Map([
      ['components/display/Card.jsx', ['Card']],
      ['showcases/crm/Screens.jsx', ['Card', 'CrmHome']],
    ]);
    expect(() => assertUniqueExports(exportsBySource)).toThrow(/Card.*components\/display\/Card\.jsx.*showcases\/crm\/Screens\.jsx/s);
  });
});
