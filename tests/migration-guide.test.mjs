import { describe, expect, it } from 'vitest';
import { guideMentions, migrationProblems, runtimeDeprecations } from '../scripts/check_migration_guide.mjs';

const guide = '# Migration\n\n## 1.x to 2.0\n\n### Drawer `modal`\n\nDelete it.\n';

describe('migration guide gate', () => {
  it('reads the call site from a deprecation warning and ignores other warnings', () => {
    const source = `
      console.warn('[meridian] <Drawer modal={false}> is deprecated and ignored.');
      console.warn('[meridian] <Icon name="' + name + '"> is not a Meridian glyph.');
      console.warn("[meridian] <Tooltip position> is deprecated; use side.");
    `;
    expect(runtimeDeprecations(source)).toEqual({
      found: [{ component: 'Drawer', prop: 'modal' }, { component: 'Tooltip', prop: 'position' }],
      unparsed: [],
    });
    expect(runtimeDeprecations("console.warn('[meridian] this prop is deprecated');").unparsed).toHaveLength(1);
  });

  it('matches only a section heading for the exact component and prop', () => {
    expect(guideMentions(guide, { component: 'Drawer', prop: 'modal' })).toBe(true);
    expect(guideMentions(guide, { component: 'Drawer', prop: 'mod' })).toBe(false);
    expect(guideMentions('Drawer `modal` is mentioned in prose only.', { component: 'Drawer', prop: 'modal' })).toBe(false);
  });

  it('passes when type, warning and guide agree', () => {
    const item = { component: 'Drawer', prop: 'modal' };
    expect(migrationProblems({ typed: [item], runtime: [{ ...item, file: 'Drawer.jsx' }], guide })).toEqual([]);
  });

  it('fails when a component warns about a deprecation the guide does not mention', () => {
    const item = { component: 'Sheet', prop: 'side' };
    const problems = migrationProblems({ typed: [item], runtime: [{ ...item, file: 'Sheet.jsx' }], guide });
    expect(problems).toEqual(['guidelines/migration.md has no "### Sheet `side`" section for the Sheet.side deprecation']);
  });

  it('fails when the type and the runtime warning disagree', () => {
    const problems = migrationProblems({
      typed: [{ component: 'Drawer', prop: 'modal' }],
      runtime: [{ component: 'Drawer', prop: 'handleOnly', file: 'Drawer.jsx' }],
      guide,
    });
    expect(problems.join('\n')).toMatch(/does not mark Drawer.handleOnly @deprecated/);
    expect(problems.join('\n')).toMatch(/no component logs a development warning naming <Drawer modal/);
  });
});
