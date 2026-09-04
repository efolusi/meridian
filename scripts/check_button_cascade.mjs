// Real Chromium regression: anchor buttons must match native buttons in both themes.
// Optional argv[2] is an installed playwright entrypoint; no server/network needed.
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { contrast } from './contrast.mjs';
const { chromium } = await import(process.argv[2] || 'playwright');
const root = new URL('../', import.meta.url);
const names = ['colors', 'typography', 'spacing', 'effects', 'base'];
const tokens = (await Promise.all(names.map(n=>readFile(new URL(`tokens/${n}.css`,root),'utf8')))).join('\n');
const source = await readFile(new URL('components/forms/Button.jsx',root),'utf8');
const css = source.match(/const CSS = `([\s\S]*?)`;/)?.[1];
assert.ok(css, 'Button source CSS must be present');
// Equal anchor/native styles are insufficient: both can be unreadable.
// Filled variants have opaque computed colors; reject an unexpected format
// instead of silently treating a transparent background as white.
const browser = await chromium.launch(process.env.EXECUTABLE_PATH ? {executablePath:process.env.EXECUTABLE_PATH} : {});
try {
  let page;
  const variants=['primary','secondary','ghost','danger','brand','outline','destructive','link'];
  let checks=0;
  for(const theme of ['light','dark']) {
    const fixture=`<html data-theme="${theme}"><head><style>${tokens}\n@layer meridian{${css}}</style></head><body>${variants.map(v=>`<a id="a-${v}" href="#" class="ef-btn ef-btn--${v} ef-btn--md">Action</a><button id="b-${v}" class="ef-btn ef-btn--${v} ef-btn--md">Action</button>`).join('')}<a id="plain" href="#">Plain link</a></body></html>`;
    for(const variant of variants) for(const state of ['normal','hover','focus','active']) {
      const observed=[];
      for(const prefix of ['a','b']) {
        // Each measurement starts with a fresh browsing context: no previous
        // pressed anchor, focus, selection or pointer capture can leak into it.
        await page?.close();
        page=await browser.newPage({reducedMotion:'reduce'});
        await page.route('**/*',route=>route.abort());
        await page.setContent(fixture);
        await page.evaluate(()=>document.addEventListener('click',event=>event.preventDefault()));
        await page.mouse.move(0,0);
        await page.evaluate(()=>document.activeElement?.blur());
        const target=page.locator(`#${prefix}-${variant}`);
        if(state==='hover') await target.hover();
        if(state==='focus') await target.focus();
        if(state==='active') {
          await page.evaluate(()=>{
            window.__pointerEvidence=[];
            for(const name of ['pointerdown','mousedown','focusin','pointerup','mouseup']) document.addEventListener(name,event=>window.__pointerEvidence.push({type:event.type,target:event.target.id,active:[...document.querySelectorAll(':active')].map(el=>el.id||el.tagName)}),{once:true});
          });
          await target.hover(); await page.mouse.down();
        }
        await page.waitForTimeout(30);
        try {
          if(state==='active') assert.equal(await target.evaluate(el=>el.matches(':active')),true,`${theme}/${variant}/${prefix}: pointer must actually activate the tested control; ${JSON.stringify(await page.evaluate(()=>window.__pointerEvidence))}`);
          observed.push(await target.evaluate(el=>{const s=getComputedStyle(el);return Object.fromEntries(['color','backgroundColor','borderRadius','fontSize','padding','height'].map(k=>[k,s[k]]));}));
        } finally {
          if(state==='active') await page.mouse.up();
        }
      }
      assert.deepEqual(observed[0],observed[1],`${theme}/${variant}/${state} anchor/native mismatch`);
      if (['primary','brand','danger','destructive'].includes(variant)) {
        for (const styles of observed) {
          const ratio = contrast(styles.color, styles.backgroundColor);
          assert.ok(ratio >= 4.5, `${theme}/${variant}/${state} text contrast ${ratio.toFixed(2)}:1 is below 4.5:1`);
        }
      }
      checks++;
    }
    assert.equal(await page.locator('#plain').evaluate(el=>getComputedStyle(el).color),await page.evaluate(()=>{const el=document.createElement('span');el.style.color='var(--text-link)';document.body.append(el);const color=getComputedStyle(el).color;el.remove();return color;}));
  }
  console.log(`button cascade: ${checks} theme/variant/state comparisons passed; plain links preserved`);
} finally { await browser.close(); }
