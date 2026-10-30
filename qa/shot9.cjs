const { chromium } = require(require('path').join(__dirname, '../../v5-ab/node_modules/playwright'));
(async () => { const b = await chromium.launch(); const errs=[]; 
 for (const [n,h,w] of [['home','#produkciya',1440],['katalog','#katalog',1440],['mufta','#katalog/mufta-ms',1440],['m390','#katalog',390]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: 900 } })).newPage(); p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:4340/c-r9/'+h); await p.waitForTimeout(600); await p.screenshot({ path: `qa/shots/c-r9-${n}.png` });
  console.log(n, await p.locator('.ph-art').count(), await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)); }
 console.log(errs); await b.close(); })();
