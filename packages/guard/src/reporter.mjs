import path from 'node:path';

export function formatPretty(result, cwd = process.cwd()) {
  const lines = result.diagnostics.map(diagnostic => {
    const file = path.relative(cwd, diagnostic.file) || path.basename(diagnostic.file);
    return `${file}:${diagnostic.line}:${diagnostic.column} ${diagnostic.severity} ${diagnostic.ruleId}\n  ${diagnostic.message}`;
  });
  const errors = result.diagnostics.filter(item => item.severity === 'error').length;
  const warnings = result.diagnostics.length - errors;
  if (result.fixed) lines.push(`Meridian Guard fixed ${result.fixed} issue(s).`);
  const fixable = result.diagnostics.filter(item => item.fix).length;
  if (fixable) lines.push(`${fixable} of these can be fixed with --fix.`);
  lines.push(
    result.diagnostics.length
      ? `\nMeridian Guard found ${errors} error(s) and ${warnings} warning(s) in ${result.filesScanned} file(s).`
      : `Meridian Guard passed ${result.filesScanned} file(s).`,
  );
  return `${lines.join('\n')}\n`;
}

export function formatJson(result) {
  return `${JSON.stringify({
    version: 1,
    filesScanned: result.filesScanned,
    errors: result.diagnostics.filter(item => item.severity === 'error').length,
    warnings: result.diagnostics.filter(item => item.severity === 'warning').length,
    ...(result.fixed === undefined ? {} : { fixed: result.fixed }),
    diagnostics: result.diagnostics.map(({ fix, ...item }) => (fix ? { ...item, fixable: true } : item)),
  }, null, 2)}\n`;
}
