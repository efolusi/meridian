// Real Chromium regression: anchor buttons must match native buttons in both themes.
// Optional argv[2] is an installed playwright entrypoint; no server/network needed.
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const { chromium } = await import(process.argv[2] || 'playwright');
const root = new URL('../', import.meta.url);
const names = ['colors', 'typography', 'spacing', 'effects', 'base'];
const tokens = (await Promise.all(names.map(n=>readFile(new URL(`tokens/${n}.css`,root),'utf8')))).join('\n');
const source = await readFile(new URL('components/forms/Button.jsx',root),'utf8');
const css = source.match(/const CSS = `([\s\S]*?)`;/)?.[1];
assert.ok(css, 'Button source CSS must be present');
const browser = await chromium.launch(process.env.EXECUTABLE_PATH ? {executablePath:process.env.EXECUTABLE_PATH} : {});
try {
  const page = await browser.newPage({reducedMotion:'reduce'});
  await page.route('**/*',route=>route.abort());
  const variants=['primary','secondary','ghost','danger','brand','outline','destructive','link'];
  let checks=0;
  for(const theme of ['light','dark']) {
    await page.setContent(`<html data-theme="${theme}"><head><style>${tokens}\n@layer meridian{${css}}</style></head><body>${variants.map(v=>`<a id="a-${v}" href="#" class="ef-btn ef-btn--${v} ef-btn--md">Action</a><button id="b-${v}" class="ef-btn ef-btn--${v} ef-btn--md">Action</button>`).join('')}<a id="plain" href="#">Plain link</a></body></html>`);
    for(const variant of variants) for(const state of ['normal','hover','focus']) {
      const observed=[];
      for(const prefix of ['a','b']) {
        await page.mouse.move(0,0);
        await page.evaluate(()=>document.activeElement?.blur());
        const target=page.locator(`#${prefix}-${variant}`);
        if(state==='hover') await target.hover();
        if(state==='focus') await target.focus();
        await page.waitForTimeout(30);
        observed.push(await target.evaluate(el=>{const s=getComputedStyle(el);return Object.fromEntries(['color','backgroundColor','borderRadius','fontSize','padding','height'].map(k=>[k,s[k]]));}));
      }
      assert.deepEqual(observed[0],observed[1],`${theme}/${variant}/${state} anchor/native mismatch`);
      checks++;
    }
    assert.equal(await page.locator('#plain').evaluate(el=>getComputedStyle(el).color),await page.evaluate(()=>{const el=document.createElement('span');el.style.color='var(--text-link)';document.body.append(el);const color=getComputedStyle(el).color;el.remove();return color;}));
  }
  console.log(`button cascade: ${checks} theme/variant/state comparisons passed; plain links preserved`);
} finally { await browser.close(); }
