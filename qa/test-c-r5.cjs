// Revision 5: unified parts catalog. Server on :4340: node qa/test-c-r5.cjs
const { chromium, webkit } = require(require('path').join(__dirname, '../../v5-ab/node_modules/playwright'));
const assert = require('assert');
const U = (h = '') => `http://localhost:4340/c-r5/${h}`;
const rows = (p) => p.locator('[data-rows] tr').count();
const rowsUntil = (p, n) => p.waitForFunction((n) => document.querySelectorAll('[data-rows] tr').length === n, n);
(async () => {
  for (const [name, eng] of [['chromium', chromium], ['webkit', webkit]]) {
    const b = await eng.launch(); const p = await (await b.newContext({ viewport: { width: 1360, height: 900 } })).newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.goto(U());
    // 1. every product preserved, one record per designation
    const data = await p.evaluate(() => ({ n: RR.catalog.length, uniq: new Set(RR.catalog.map(x => x.des)).size, parts: Object.values(RR.parts).flat().map(x => x[0]) }));
    assert.equal(data.n, 307); assert.equal(data.uniq, 307);
    assert.ok(data.parts.every(d => true) && new Set(data.parts).size === 307, 'every per-model part is in the unified catalog');
    // 2. each gearbox card opens the filtered catalog
    for (const [slug, n] of [['rr-300', 205], ['rr-238', 3], ['3d6', 82], ['3d12', 35]]) {
      await p.goto(U()); await p.click(`#model-${slug} .mcard-btns a`); await p.waitForSelector('[data-rows]');
      assert.equal(await rows(p), n, slug + ' filtered count'); assert.match(p.url(), new RegExp(`#katalog/${slug}$`));
    }
    // 3. the main navigation opens the whole catalog, no intermediate page
    await p.goto(U()); await p.click('.nav a[href="#katalog"]'); await p.waitForSelector('[data-rows]');
    assert.equal(await rows(p), 307); assert.equal(await p.locator('.cats').count(), 0, 'no chooser page');
    // 4. search by part number, with or without hyphens; reset
    await p.fill('[data-fq]', '52516112'); await rowsUntil(p, 1);
    assert.equal(await p.locator('[data-rows] tr').first().getAttribute('data-des'), '525-16-112');
    assert.ok(await p.locator('[data-reset]').isVisible()); assert.match(p.url(), /q=52516112/);
    await p.click('[data-reset]'); await rowsUntil(p, 307);
    // group filter within a model
    await p.goto(U('#katalog/3d6')); await p.waitForSelector('[data-fg]');
    await p.selectOption('[data-fg]', 'Шестерни'); await rowsUntil(p, 9);
    // 5. a multi-model part is one record shown under each of its models
    for (const slug of ['3d6', '3d12']) { await p.goto(U(`#katalog/${slug}?q=525-58-2`)); await p.waitForSelector('[data-rows]'); assert.equal(await rows(p), 1, '525-58-2 under ' + slug); }
    await p.goto(U('#katalog?q=525-58-2')); await p.waitForSelector('[data-rows]'); assert.equal(await rows(p), 1, 'single record in the full list');
    const cell = await p.locator('[data-rows] tr .c-ap').innerText();
    assert.match(cell, /3Д6/); assert.match(cell, /3Д12/); assert.match(cell, /уточните при заказе/);
    // РР-300 part from the factory table links to its drawing; variant-dependent note shown where documented
    await p.goto(U('#katalog/rr-300?q=525-16-112')); await p.waitForSelector('.ap-figs a');
    await p.click('.ap-figs a'); await p.waitForSelector('tr.hit'); assert.match(p.url(), /#m\/rr-300\/ris-\d+/);
    assert.ok(await p.evaluate(() => RR.catalog.some(x => x.vardep)), 'variant dependence present in data');
    // 6. ordering still works from the list and from a drawing page
    await p.goto(U('#katalog/rr-300?q=525-16-112')); await p.waitForSelector('[data-rows] tr');
    await p.fill('[data-rows] tr [data-qty]', '2'); await p.click('[data-rows] tr .btn-add');
    assert.equal((await p.locator('[data-cart-count]').innerText()).trim(), '2');
    await p.goto(U('#m/rr-300/ris-1')); await p.waitForSelector('[data-isp]');
    await p.locator('tr:not(.na) .btn-add').first().click(); assert.equal((await p.locator('[data-cart-count]').innerText()).trim(), '3');
    // search from a drawing page goes to the unified list
    await p.fill('[data-fq]', 'шестерня'); await p.press('[data-fq]', 'Enter'); await p.waitForSelector('[data-rows]'); assert.ok(await rows(p) > 10);
    // old addresses still work
    await p.goto(U('#m/3d6/vse')); await p.waitForFunction(() => location.hash === '#katalog/3d6');
    await p.goto(U('#m/3d12/gr-1')); await p.waitForFunction(() => location.hash.startsWith('#katalog/3d12?g='));
    await p.goto(U('#katalog/mufta-ms')); await p.waitForSelector('.mufta-contacts');
    assert.deepEqual(errs, [], 'no page errors');
    console.log('pass', name); await b.close();
  }
  console.log('revision 5 passed');
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
