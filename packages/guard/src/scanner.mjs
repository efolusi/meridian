import fs from 'node:fs/promises';
import path from 'node:path';
import { parse } from '@babel/parser';
import { RULES } from './rules.mjs';
import defaultContracts from './generated/meridian-rules.json' with { type: 'json' };

const SOURCE_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx']);
const IGNORED_DIRECTORIES = new Set([
  '.git',
  '.next',
  '.nuxt',
  '.open-next',
  '.output',
  '.svelte-kit',
  '.turbo',
  '.vercel',
  '.wrangler',
  '__fixtures__',
  '__tests__',
  'build',
  'coverage',
  'dist',
  'fixtures',
  'node_modules',
  'out',
  'target',
  'vendor',
]);
const HEX_COLOR = /#[0-9a-fA-F]{3,8}\b/g;
const RADIUS_TOKEN = /var\(\s*--(radius-[a-z0-9-]+)\b/gi;

function ignoredSourceFile(target) {
  const name = path.basename(target);
  return /\.min\.(?:[cm]?[jt]sx?)$/i.test(name) || /\.(?:spec|test)\.[cm]?[jt]sx?$/i.test(name);
}

function diagnostic(file, node, rule, message) {
  return {
    file,
    line: node?.loc?.start?.line || 1,
    column: (node?.loc?.start?.column || 0) + 1,
    ruleId: rule.id,
    severity: rule.severity,
    message,
  };
}

async function collectFiles(targets) {
  const files = [];
  async function visit(target) {
    const stat = await fs.lstat(target);
    if (stat.isSymbolicLink()) return;
    if (stat.isFile()) {
      if (SOURCE_EXTENSIONS.has(path.extname(target)) && !ignoredSourceFile(target)) files.push(path.resolve(target));
      return;
    }
    if (!stat.isDirectory()) return;
    const entries = await fs.readdir(target, { withFileTypes: true });
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory() && IGNORED_DIRECTORIES.has(entry.name)) continue;
      await visit(path.join(target, entry.name));
    }
  }
  for (const target of targets) await visit(target);
  return [...new Set(files)].sort();
}

function jsxName(node) {
  if (!node) return null;
  if (node.type === 'JSXIdentifier') return node.name;
  if (node.type === 'JSXMemberExpression') return `${jsxName(node.object)}.${jsxName(node.property)}`;
  return null;
}

function attribute(element, name) {
  return element.openingElement.attributes.find(item =>
    item.type === 'JSXAttribute' && item.name?.name === name,
  );
}

function staticAttributeValue(item) {
  if (!item?.value) return null;
  if (item.value.type === 'StringLiteral') return item.value.value;
  if (item.value.type === 'JSXExpressionContainer' && item.value.expression.type === 'StringLiteral') {
    return item.value.expression.value;
  }
  return null;
}

function walk(node, visitor, ancestors = []) {
  if (!node || typeof node !== 'object') return;
  visitor(node, ancestors);
  const next = [...ancestors, node];
  for (const [key, value] of Object.entries(node)) {
    if (key === 'loc' || key === 'start' || key === 'end' || key === 'extra') continue;
    if (Array.isArray(value)) {
      for (const child of value) walk(child, visitor, next);
    } else if (value && typeof value === 'object' && typeof value.type === 'string') {
      walk(value, visitor, next);
    }
  }
}

function isMeridianImport(source) {
  return source === '@efolusi/meridian' || source.startsWith('@efolusi/meridian/');
}

function canonicalName(rawName, imports, namespaces) {
  if (imports.has(rawName)) return imports.get(rawName);
  const [namespace, member] = rawName.split('.');
  if (member && namespaces.has(namespace)) return member;
  return null;
}

function hasDescendant(element, expected, imports, namespaces) {
  let found = false;
  for (const child of element.children || []) {
    walk(child, node => {
      if (node.type !== 'JSXOpeningElement') return;
      if (canonicalName(jsxName(node.name), imports, namespaces) === expected) found = true;
    });
  }
  return found;
}

function rawColorContext(node, ancestors) {
  const jsxAttribute = [...ancestors].reverse().find(parent => parent.type === 'JSXAttribute');
  if (jsxAttribute) return ['style', 'color', 'background', 'fill', 'stroke'].includes(jsxAttribute.name?.name);
  if (node.type === 'TemplateElement') {
    if (ancestors.some(parent => parent.type === 'TaggedTemplateExpression')) return true;
    const declaration = [...ancestors].reverse().find(parent => parent.type === 'VariableDeclarator');
    const name = declaration?.id?.name || '';
    return /(?:css|style|theme)$/i.test(name);
  }
  const property = [...ancestors].reverse().find(parent => parent.type === 'ObjectProperty');
  if (property) {
    const key = property.key?.name || property.key?.value || '';
    return /color|background|border|shadow|fill|stroke|outline/i.test(String(key));
  }
  return false;
}

export function scanSource(source, file, contracts) {
  let ast;
  try {
    ast = parse(source, {
      sourceType: 'unambiguous',
      errorRecovery: false,
      plugins: ['jsx', 'typescript', 'importAttributes'],
    });
  } catch (error) {
    return [diagnostic(file, error, RULES.parse, `Could not parse source: ${error.message}`)];
  }

  const diagnostics = [];
  const validComponents = new Set(contracts.components.map(item => item.name));
  const validIcons = new Set(contracts.icons);
  const validTokens = new Set(contracts.tokens);
  const imports = new Map();
  const namespaces = new Set();

  for (const statement of ast.program.body) {
    if (statement.type !== 'ImportDeclaration' || !isMeridianImport(statement.source.value)) continue;
    for (const specifier of statement.specifiers) {
      if (statement.importKind === 'type' || specifier.importKind === 'type' || specifier.importKind === 'typeof') continue;
      if (specifier.type === 'ImportNamespaceSpecifier') {
        namespaces.add(specifier.local.name);
        continue;
      }
      const deepDefault = specifier.type === 'ImportDefaultSpecifier' && statement.source.value !== '@efolusi/meridian';
      const deepBasename = path.basename(statement.source.value);
      if (deepDefault && !/^[A-Z][A-Za-z0-9_$]*\.(?:jsx?|tsx?)$/.test(deepBasename)) continue;
      const imported = specifier.type === 'ImportDefaultSpecifier'
        ? deepBasename.replace(/\.(?:jsx?|tsx?)$/, '')
        : specifier.imported.name || specifier.imported.value;
      if (!validComponents.has(imported)) {
        diagnostics.push(diagnostic(file, specifier, RULES.unknownComponent,
          `"${imported}" is not a Meridian component. Check the component registry or the import path.`));
        continue;
      }
      imports.set(specifier.local.name, imported);
    }
  }

  const deprecated = new Map(contracts.deprecated.map(item => [`${item.component}:${item.prop}`, item]));
  walk(ast.program, (node, ancestors) => {
    if (node.type === 'StringLiteral' || node.type === 'TemplateElement') {
      const value = node.type === 'StringLiteral' ? node.value : node.value.raw;
      if (HEX_COLOR.test(value) && rawColorContext(node, ancestors)) {
        HEX_COLOR.lastIndex = 0;
        diagnostics.push(diagnostic(file, node, RULES.rawColor,
          `Raw color ${JSON.stringify(value.match(HEX_COLOR)?.[0])} bypasses Meridian semantic tokens. Use var(--token-name).`));
      }
      HEX_COLOR.lastIndex = 0;
      if (rawColorContext(node, ancestors)) {
        for (const match of value.matchAll(RADIUS_TOKEN)) {
          if (!validTokens.has(match[1])) {
            diagnostics.push(diagnostic(file, node, RULES.unknownToken,
              `Unknown Meridian token "--${match[1]}". Choose a radius token from the generated token contract.`));
          }
        }
      }
    }
    if (node.type !== 'JSXElement') return;
    const raw = jsxName(node.openingElement.name);
    const component = canonicalName(raw, imports, namespaces);
    if (!component) return;
    const [rawNamespace] = raw.split('.');
    if (raw.includes('.') && namespaces.has(rawNamespace) && !validComponents.has(component)) {
      diagnostics.push(diagnostic(file, node.openingElement, RULES.unknownComponent,
        `"${component}" is not a Meridian component. Check the component registry.`));
      return;
    }

    if (component === 'Icon' || component === 'IconButton') {
      const propName = component === 'Icon' ? 'name' : 'icon';
      const iconAttribute = attribute(node, propName);
      const iconName = staticAttributeValue(iconAttribute);
      if (iconName && !validIcons.has(iconName)) {
        diagnostics.push(diagnostic(file, iconAttribute, RULES.unknownIcon,
          `"${iconName}" is not a Meridian icon. Choose a name from the icon registry.`));
      }
    }

    for (const item of node.openingElement.attributes) {
      if (item.type !== 'JSXAttribute') continue;
      const contract = deprecated.get(`${component}:${item.name.name}`);
      if (!contract) continue;
      diagnostics.push(diagnostic(file, item, RULES.deprecatedApi,
        contract.replacement
          ? `<${component}> prop "${contract.prop}" is deprecated; use "${contract.replacement}".`
          : `<${component}> prop "${contract.prop}" is deprecated. ${contract.message}`));
    }

    if (component === 'IconButton' && !attribute(node, 'label')) {
      diagnostics.push(diagnostic(file, node.openingElement, RULES.accessibility,
        '<IconButton> requires a descriptive "label" prop for its accessible name.'));
    }
    if (component === 'Dialog' && !attribute(node, 'title') && !hasDescendant(node, 'DialogTitle', imports, namespaces)) {
      diagnostics.push(diagnostic(file, node.openingElement, RULES.accessibility,
        '<Dialog> requires a "title" prop or a <DialogTitle> descendant for its accessible name.'));
    }
    if (component === 'DialogContent' && !hasDescendant(node, 'DialogTitle', imports, namespaces)) {
      diagnostics.push(diagnostic(file, node.openingElement, RULES.accessibility,
        '<DialogContent> requires a <DialogTitle> descendant.'));
    }
    if (component === 'AlertDialogContent' && !hasDescendant(node, 'AlertDialogTitle', imports, namespaces)) {
      diagnostics.push(diagnostic(file, node.openingElement, RULES.accessibility,
        '<AlertDialogContent> requires an <AlertDialogTitle> descendant.'));
    }
  });

  return diagnostics;
}

export async function guard(targets, { contracts = defaultContracts } = {}) {
  const files = await collectFiles(targets);
  const diagnostics = [];
  for (const file of files) {
    const source = await fs.readFile(file, 'utf8');
    diagnostics.push(...scanSource(source, file, contracts));
  }
  diagnostics.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.column - b.column || a.ruleId.localeCompare(b.ruleId));
  return { filesScanned: files.length, diagnostics };
}
