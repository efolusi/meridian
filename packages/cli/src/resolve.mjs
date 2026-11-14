import { assertItemName } from './paths.mjs';
import { dependencyName, RegistryError } from './registry.mjs';

export const MAX_ITEMS = 500;

/**
 * Loads the requested items and every item they depend on through
 * registryDependencies. Returns them dependencies first, each once. A cycle
 * is not an error (copying files has no order problem), it just stops there.
 * A dependency that is not in the registry fails with the chain that asked
 * for it, for example `icon (needed by button)`.
 */
export async function resolveItems(names, registry) {
  const ordered = [];
  const seen = new Set();
  const loaded = new Map();

  async function load(name, chain) {
    if (loaded.has(name)) return loaded.get(name);
    if (loaded.size >= MAX_ITEMS) throw new RegistryError(`more than ${MAX_ITEMS} items to install; the registry looks wrong`);
    try {
      const item = await registry.item(name);
      loaded.set(name, item);
      return item;
    } catch (error) {
      if (error instanceof RegistryError && chain.length) {
        error.message = `${error.message} (needed by ${chain.join(' <- ')})`;
      }
      throw error;
    }
  }

  async function visit(name, chain) {
    if (seen.has(name)) return;
    seen.add(name);
    const item = await load(name, chain);
    for (const entry of item.registryDependencies) {
      await visit(dependencyName(entry, registry), [name, ...chain]);
    }
    ordered.push(item);
  }

  for (const name of names) await visit(assertItemName(name.toLowerCase()), []);
  return ordered;
}

/** npm packages the resolved items need, deduplicated, in first-seen order. */
export function npmDependencies(items) {
  const specs = new Map();
  for (const item of items) {
    for (const spec of item.dependencies) {
      const at = spec.indexOf('@', 1);
      const pkg = at === -1 ? spec : spec.slice(0, at);
      // Keep the first spec that carries a version range.
      if (!specs.has(pkg) || (!specs.get(pkg).includes('@', 1) && at !== -1)) specs.set(pkg, spec);
    }
  }
  return [...specs.values()];
}
