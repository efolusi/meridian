import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path) => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('guide-only compatibility families', () => {
  it('keeps Data Table as a Table-based application recipe with the full behavior map', () => {
    const recipe = read('site/examples/data-table.jsx');
    expect(recipe).toContain("dependency: '@tanstack/react-table'");
    for (const primitive of ['TableHeader', 'TableBody', 'TableRow', 'TableHead', 'TableCell', 'Checkbox', 'Input', 'Button', 'DropdownMenu']) {
      expect(recipe).toContain(`'${primitive}'`);
    }
    for (const behavior of ['sorting', 'filtering', 'pagination', 'visibility', 'selection', 'row-actions']) {
      expect(recipe).toContain(`'${behavior}'`);
    }
  });

  it('keeps Typography as semantic HTML plus tokens without a fabricated runtime export', () => {
    const recipe = read('site/examples/typography.jsx');
    for (const element of ['h1', 'h2', 'h3', 'h4', 'p', 'blockquote', 'table', 'ul', 'code', 'small']) {
      expect(recipe).toContain(`'${element}'`);
    }
    expect(recipe).toContain("'--font-display'");
    expect(recipe).toContain("'--font-body'");
  });

  it('pins deprecated Toast to the proven Sonner migration path', () => {
    const prompt = read('components/feedback/Toast.prompt.md');
    expect(prompt).toContain('New product code should use `Toaster` plus `toast`.');
    expect(read('tests/sonner-compatibility.test.jsx')).toContain('toast.promise');
  });
});
