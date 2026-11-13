import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

// Form controls reach the 44px touch target on phones because tokens/spacing.css
// raises --control-h-* to --tap-min under (pointer: coarse). These hit
// targets were fixed at 24 to 38px and stayed that size on touch screens.
// jsdom cannot evaluate media queries, so each component's stylesheet is read.
const coarse = file => {
  const src = readFileSync(`components/${file}`, 'utf8');
  const css = src.slice(src.indexOf('const CSS = `'), src.indexOf('`;')).replace(/\s+/g, '');
  const at = css.indexOf('@media(pointer:coarse){');
  if (at < 0) return '';
  let depth = 0;
  for (let i = at; i < css.length; i += 1) {
    if (css[i] === '{') depth += 1;
    if (css[i] === '}' && --depth === 0) return css.slice(css.indexOf('{', at) + 1, i);
  }
  return '';
};

describe('hit targets honour --tap-min on coarse pointers', () => {
  it.each([
    ['overlay/DropdownMenu.jsx', ['.ef-dropdown-menu__item']],
    ['overlay/ContextMenu.jsx', ['.ef-context-menu__item']],
    ['overlay/Command.jsx', ['.ef-command__item']],
    ['navigation/Menubar.jsx', ['.ef-menubar__trigger']],
    ['navigation/NavigationMenu.jsx', ['.ef-navigation-menu__trigger', '.ef-navigation-menu__link']],
    ['navigation/Tabs.jsx', ['.ef-tabs__tab']],
    ['navigation/Pagination.jsx', ['.ef-pagination__link']],
    ['navigation/PageControl.jsx', ['.ef-dots__dot']],
    ['navigation/SideNav.jsx', ['.ef-sidenav__item']],
    ['navigation/SegmentedControl.jsx', ['.ef-seg__opt']],
    ['navigation/Sidebar.jsx', ['.ef-sidebar-menu-button[data-size=sm]', '.ef-sidebar-menu-sub-button', '.ef-sidebar-input', '.ef-sidebar-trigger', '.ef-sidebar-group-action', '.ef-sidebar-menu-action']],
    ['feedback/Banner.jsx', ['.ef-banner__action']],
    ['feedback/Toast.jsx', ['.ef-toast__action']],
  ])('%s', (file, selectors) => {
    const block = coarse(file);
    expect(block, 'a (pointer: coarse) block').not.toBe('');
    for (const selector of selectors) {
      const rule = block.split('}').find(r => r.split('{')[0].split(',').includes(selector));
      expect(rule, selector).toMatch(/(height|min-height):var\(--tap-min\)/);
    }
  });
});
