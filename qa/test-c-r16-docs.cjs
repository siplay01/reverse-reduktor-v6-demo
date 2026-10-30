// Revision 16: the two engine/reverse-gear manuals are listed in the archive and open. Server on :4340: node qa/test-c-r16-docs.cjs
const { chromium, webkit } = require(require('path').join(__dirname, '../../v5-ab/node_modules/playwright'));
const assert = require('assert');
(async () => {
  for (const [name, eng] of [['chromium', chromium], ['webkit', webkit]]) {
    const b = await eng.launch(); const p = await (await b.newContext({ viewport: { width: 1360, height: 900 } })).newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.goto('http://localhost:4340/c-r16/#arhiv'); await p.waitForSelector('.ar-list');
    const rows = await p.locator('.ar-list li:not(.ar-soon)').allInnerTexts();
    assert.ok(rows.some(t => /3Д6 и 7Д6/.test(t)) && rows.some(t => /Д12 РЭ/.test(t)), 'both manuals listed');
    const links = await p.evaluate(() => [...document.querySelectorAll('.ar-a a[href$=".pdf"], .ar-a a[href*=".pdf#page="]')].map(a => a.href));
    assert.ok(links.length >= 5, 'pdf links: ' + links.length);
    for (const u of links) { const r = await p.evaluate(async (u) => (await fetch(u, { method: 'HEAD' })).status, u.split('#')[0]); assert.equal(r, 200, u); }
    for (const [slug, n] of [['3d6', 2], ['3d12', 1]]) { await p.goto(`http://localhost:4340/c-r16/#katalog/${slug}/spisok`); await p.waitForSelector('.gfig'); assert.ok(await p.locator('.gdoc').count() >= 1, slug + ' doc link'); const h = await p.locator('.gdoc').first().getAttribute('href'); assert.match(h, /\.pdf#page=\d+$/); }
    assert.deepEqual(errs, [], 'console errors'); await b.close(); console.log(name, 'ok');
  }
})();
