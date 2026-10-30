// Revision 13: real section drawings and manual data on the 3Д6 and 3Д12 pages. Server on :4340: node qa/test-c-r13-gears.cjs
const { chromium, webkit } = require(require('path').join(__dirname, '../../v5-ab/node_modules/playwright'));
const assert = require('assert');
const U = (h = '') => `http://localhost:4340/c-r13/${h}`;
(async () => {
  for (const [name, eng] of [['chromium', chromium], ['webkit', webkit]]) {
    const b = await eng.launch(); const p = await (await b.newContext({ viewport: { width: 1360, height: 900 } })).newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
    for (const [slug, figs, rows] of [['3d6', 2, [27, 18]], ['3d12', 1, [29]]]) {
      await p.goto(U(`#katalog/${slug}/spisok`)); await p.waitForSelector('.gfig');
      assert.equal(await p.locator('.gfig').count(), figs, slug + ' figures');
      for (const [i, n] of rows.entries()) assert.equal(await p.locator('.gfig').nth(i).locator('tbody tr').count(), n, slug + ' legend ' + i);
      assert.ok(await p.evaluate(() => [...document.querySelectorAll('.gfig img')].every(i => i.complete ? i.naturalWidth > 500 : true)), slug + ' images decode');
      await p.waitForFunction(() => [...document.querySelectorAll('.gfig img')].every(i => i.complete && i.naturalWidth > 500));
      assert.equal(await p.locator('.node-fig .ph-art').count(), 0, slug + ': no placeholder beside the list');
      await p.goto(U(`#katalog/${slug}`)); await p.waitForSelector('.tile img.dwg'); assert.equal(await p.locator('.tile img.dwg').count(), 1);
    }
    const sp = await p.evaluate(() => Object.fromEntries(['3d6', '3d12'].map(id => [id, Object.fromEntries(RR.models.find(m => m.id === id).specs)])));
    assert.match(sp['3d6']['Наибольший допустимый упор гребного винта'], /2500/); assert.match(sp['3d12']['Наибольший допустимый упор гребного винта'], /3500/);
    assert.match(sp['3d12']['Передаточное отношение, передний ход'], /1,33/);
    // models without a drawing keep the single placeholder
    await p.goto(U('#katalog/rr-238/spisok')); await p.waitForSelector('.node-fig .ph-art');
    assert.deepEqual(errs, [], 'console errors'); await b.close(); console.log(name, 'ok');
  }
})();
