// Revision 17: 3Д6 drawing catalog (10 exploded views, Рис. 89-98) from the owner's Word file. Chromium + WebKit.
const { chromium, webkit } = require(require('path').join(__dirname, '../../v5-ab/node_modules/playwright'));
const assert = require('assert');
const U = (h = '') => `http://localhost:4340/c-r17/${h}`;
(async () => {
  for (const [name, eng] of [['chromium', chromium], ['webkit', webkit]]) {
    const b = await eng.launch(); const ctx = await b.newContext({ viewport: { width: 1360, height: 900 } }); const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('requestfailed', r => errs.push('failed ' + r.url()));
    await p.goto(U());
    // 1. data: one record per designation, 3Д6 count matches the parts list, other models untouched
    const d = await p.evaluate(() => ({ n: RR.catalog.length, u: new Set(RR.catalog.map(x => x.des)).size, p6: RR.parts['3d6'].length,
      c6: RR.catalog.filter(x => x.models.includes('3d6')).length, rr: RR.catalog.filter(x => x.models.includes('rr300')).length,
      rows: RR.nodes3d6.reduce((a, n) => a + n.rows.length, 0), figs: RR.nodes3d6.map(n => n.fig) }));
    assert.equal(d.n, d.u); assert.equal(d.p6, d.c6); assert.equal(d.rows, 169); assert.deepEqual(d.figs, [89, 90, 91, 92, 93, 94, 95, 96, 97, 98]);
    assert.ok(d.rr >= 205, 'РР-300 parts kept');
    // 2. the 3Д6 page: 10 drawing tiles with pictures + the full list
    await p.goto(U('#katalog/3d6')); await p.waitForSelector('.tiles .tile');
    assert.equal(await p.locator('.tile').count(), 11); assert.equal(await p.locator('.tile img').count(), 11, 'no placeholders left');
    // 3. every drawing page loads its picture and shows all rows; prev/next, select
    for (const n of [89, 90, 91, 92, 93, 94, 95, 96, 97, 98]) {
      await p.goto(U(`#m/3d6/ris-${n}`)); await p.waitForSelector('.node-fig img');
      await p.waitForFunction(() => { const i = document.querySelector('.node-fig img'); return i.complete && i.naturalWidth > 0; });
      const rows = await p.locator('.node-spec tbody tr').count();
      assert.equal(rows, await p.evaluate((n) => RR.nodes3d6.find(x => x.fig === n).rows.length, n), 'rows of Рис. ' + n);
      assert.match(await p.locator('[data-cat] h1').innerText(), new RegExp('Рис. ' + n));
    }
    // 4. variants: studs 550-07 belong to 3Д6С/3Д6СЛ only; the selector changes the quantity, compare shows all four
    await p.goto(U('#m/3d6/ris-89')); await p.waitForSelector('#isp');
    const q = async () => p.locator('tr[data-des="550-07"] .c-q').innerText();
    assert.equal((await p.locator('#isp option').allInnerTexts()).join(), '3Д6,3Д6Л,3Д6С,3Д6СЛ');
    assert.equal(await q(), '—'); await p.selectOption('#isp', '3Д6С'); await p.waitForSelector('tr[data-des="550-07"]:not(.na)'); assert.equal(await q(), '16');
    await p.click('[data-compare]'); await p.waitForSelector('table.cmp');
    assert.equal(await p.locator('table.cmp thead th.c-q').count(), 4);
    assert.deepEqual(await p.locator('tr[data-des="550-07"] .c-q').allInnerTexts(), ['—', '—', '16', '16']); await p.click('[data-compare]');
    // 5. gear ratio footnotes (Рис. 94 and 96)
    await p.goto(U('#m/3d6/ris-94')); await p.waitForSelector('.foot-notes');
    assert.match(await p.locator('.foot-notes').innerText(), /1:3,07/); assert.match(await p.locator('.foot-notes').innerText(), /1:2,02/);
    assert.equal(await p.locator('tr[data-des="525М-24"] sup').innerText(), '1'); assert.equal(await p.locator('tr[data-des="525М-24-1"] sup').innerText(), '2');
    // 6. the list links to the drawing, the select jumps, ordering works
    await p.goto(U('#katalog/3d6/spisok?q=525-23-2')); await p.waitForSelector('.ap-figs a');
    await p.click('.ap-figs a'); await p.waitForSelector('tr.hit'); assert.match(p.url(), /#m\/3d6\/ris-89/);
    await p.selectOption('[data-jump]', 'ris-93'); await p.waitForSelector('h1:has-text("Рис. 93")');
    await p.click('tr[data-des="525-64-1"] .btn-add'); await p.click('[data-cart-open]');
    assert.match(await p.locator('#cart').innerText(), /525-64-1/); assert.match(await p.locator('#cart').innerText(), /3Д6, рис\. 93/); await p.click('[data-cart-clear]'); await p.click('[data-cart-close]');
    // 7. documentation archive row is live
    await p.goto(U('#arhiv')); await p.waitForSelector('.ar-list');
    assert.equal(await p.locator('.ar-soon:has-text("3Д6")').count(), 0); await p.click('.ar-list a:has-text("Подбор по каталогу") >> nth=1');
    // 7b. РР-300 untouched
    await p.goto(U('#katalog/rr-300')); await p.waitForSelector('.tile img'); assert.equal(await p.locator('.tile img').count(), 28);
    // 8. phone width: no horizontal scroll on the new pages
    await p.setViewportSize({ width: 390, height: 800 });
    for (const h of ['#katalog/3d6', '#m/3d6/ris-90', '#m/3d6/ris-94']) { await p.goto(U(h)); await p.waitForSelector('.tiles .tile, .node'); await p.waitForTimeout(200);
      assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'overflow on ' + h); }
    // 9. iPhone Safari zooms the page when a focused field is under 16 px (it never zooms back): every field is 16 px on phones
    for (const h of ['#katalog/vse', '#katalog/3d6/spisok', '#m/3d6/ris-89', '#m/rr-300/ris-5']) {
      await p.goto(U(h)); await p.waitForSelector('[data-cat] h1'); await p.waitForTimeout(300);
      const small = await p.evaluate(() => [...document.querySelectorAll('input:not([type=hidden]),select,textarea')].filter(e => parseFloat(getComputedStyle(e).fontSize) < 16).length);
      assert.equal(small, 0, 'fields under 16 px on ' + h);
    }
    // 10. narrowest phones (320 px): no horizontal overflow on the catalog, archive and clutch pages
    await p.setViewportSize({ width: 320, height: 700 });
    for (const h of ['', '#katalog/vse', '#katalog/3d6', '#m/3d6/ris-89', '#katalog/mufta-ms', '#arhiv']) {
      await p.goto(U(h)); await p.waitForTimeout(300);
      assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), '320 px overflow on ' + (h || 'home'));
    }
    assert.deepEqual(errs, [], name + ' errors');
    await b.close(); console.log(name, 'ok');
  }
})().catch(e => { console.error(e); process.exit(1); });
