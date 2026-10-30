// Revision 16: services section (35/65 panels, five link rows, documentation line). Server on :4340: node qa/test-c-r16.cjs
const { chromium, webkit } = require(require('path').join(__dirname, '../../v5-ab/node_modules/playwright'));
const assert = require('assert');
const U = (h = '') => `http://localhost:4340/c-r16/${h}`;
(async () => {
  for (const [name, eng] of [['chromium', chromium], ['webkit', webkit]]) {
    const b = await eng.launch(); const errs = [];
    for (const w of [1920, 1440, 768, 390, 375]) {
      const p = await (await b.newContext({ viewport: { width: w, height: 900 } })).newPage();
      p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
      await p.goto(U()); await p.waitForSelector('.sv8');
      assert.equal(await p.locator('.sv8 li a').count(), 5);
      assert.equal(await p.locator('.sec5-svc, .docs7').count(), 0, 'old blocks gone');
      assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name} ${w}: no horizontal overflow`);
      if (w >= 1440) { const r = await p.evaluate(() => { const a = document.querySelector('.sv8-intro').offsetWidth, c = document.querySelector('.sv8-wrap').offsetWidth; return a / c; }); assert.ok(Math.abs(r - .35) < .01, 'intro is 35%: ' + r); }
      await p.locator('.sv8').screenshot({ path: `qa/shots/c-r16-${name}-${w}.png` });
      await p.close();
    }
    // every row and the docs line go somewhere real
    const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage(); await p.goto(U());
    for (const a of await p.locator('.sv8 li a').all()) assert.equal(await a.getAttribute('href'), '#kontakty');
    assert.ok(await p.locator('#kontakty').count() === 1);
    await p.click('.sv8-docs'); await p.waitForSelector('.ar-list'); assert.match(p.url(), /#arhiv$/);
    const dead = await p.evaluate(async () => (await Promise.all([...document.querySelectorAll('.ar-list a[href]')].map(a => a.getAttribute('href')).filter(h => !h.startsWith('#')).map(h => fetch(new URL(h, location.href)).then(r => r.status)))).filter(s => s !== 200));
    assert.deepEqual(dead, [], 'archive file links');
    assert.deepEqual(errs, [], 'console errors'); await b.close(); console.log(name, 'ok');
  }
})();
