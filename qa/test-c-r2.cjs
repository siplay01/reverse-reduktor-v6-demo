// Revision 2 checks: Dmitry's corrections of 2026-10-29 plus the catalog engine. Server on :4340: node qa/test-c-r2.cjs
const { chromium, webkit } = require(require('path').join(__dirname, '../../v5-ab/node_modules/playwright'));
const assert = require('assert');
const U = (h = '') => `http://localhost:4340/c-r2/${h}`;
const txt = (p, s) => p.locator(s).allInnerTexts();
(async () => {
  for (const [name, eng] of [['chromium', chromium], ['webkit', webkit]]) {
    const b = await eng.launch(); const p = await (await b.newContext({ viewport: { width: 1360, height: 900 } })).newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.goto(U());
    // 1. tabs
    assert.deepEqual(await txt(p, '.nav a'), ['Наша продукция', 'Запасные части', 'Услуги', 'Техническая документация']);
    // 2. products
    assert.deepEqual((await txt(p, '.mcard-h a, .mcard-new .mcard-h')).map(t => t.split(/\s+СБ|\n/)[0].replace(/\s+Скоро.*/i, '').trim()),
      ['РР-300', '3Д6', '3Д12', 'Муфта сцепления МС', 'Реверс-редуктор гидравлический NEW']);
    assert.match(await p.locator('#model-new .badge').innerText(), /в разработке/i);
    // 4. services
    assert.deepEqual(await txt(p, '.svc h3'), ['Ремонт судовых реверс-редукторов', 'Ремонт рулевых машин РГ-0,25', 'Техническая поддержка', 'Изготовление деталей судового машиностроения', 'Разработка технической документации судового машиностроения']);
    // 5. removed blocks, certificate kept
    assert.equal(await p.locator('.docs, .sec-order, #tendery').count(), 0, 'doc tiles, ordering, tenders removed');
    assert.ok(await p.locator('#dokumenty .cert').isVisible(), 'certificate kept');
    // 6. footer: contacts + requisites
    assert.ok(await p.locator('#kontakty a[href="tel:+79609665577"]').isVisible() && await p.locator('#kontakty #req').isVisible());
    // 3. spare parts: chooser with 4 catalogs
    await p.click('.nav a[href="#katalog"]'); await p.waitForSelector('.cats');
    assert.deepEqual(await txt(p, '.cats b'), ['Для реверс-редуктора гидравлического РР-300', 'Для реверс-редуктора механического 3Д6', 'Для реверс-редуктора механического 3Д12', 'Для муфты сцепления']);
    await p.click('.cats a[href="#katalog/rr-300"]'); await p.waitForFunction(() => document.querySelectorAll('.tile').length === 28);
    assert.deepEqual(await txt(p, '.seg a'), ['РР-300', '3Д6', '3Д12', 'Муфта МС']);
    await p.click('.seg a:has-text("Муфта МС")'); await p.waitForSelector('.mufta-contacts');
    assert.match(await p.locator('[data-cat] h1').innerText(), /муфты сцепления/);
    // catalog engine still works: node, variants, search, request list
    await p.goto(U('#m/rr-300/ris-1')); await p.waitForSelector('[data-isp]');
    const before = await p.locator('tr.na').count(); await p.selectOption('[data-isp]', '-004');
    await p.waitForFunction((n) => document.querySelectorAll('tr.na').length !== n, before);
    await p.fill('[data-gq]', '52516112'); await p.waitForSelector('[data-gres] a');
    assert.ok((await txt(p, '[data-gres] b')).every(m => m !== 'РР-238'), 'search limited to listed catalogs');
    await p.locator('[data-gres] a').first().click(); await p.waitForSelector('tr.hit');
    await p.fill('[data-filter]', ''); await p.locator('tr:not(.na) .btn-add').first().click();
    assert.equal((await p.locator('[data-cart-count]').innerText()).trim(), '1');
    await p.goto(U('#m/3d6/vse')); await p.waitForSelector('[data-cat] .pk-zone');
    await p.locator('[data-cat] .pk-zone[data-g="Подшипники"]').dispatchEvent('click'); await p.waitForSelector('[data-cat] .pk-zone.on');
    // footer section link returns to the home page
    await p.click('.foot a[href="#uslugi"]'); await p.waitForSelector('[data-view=home]:not([hidden])');
    assert.deepEqual(errs, [], 'no page errors');
    console.log('pass', name); await b.close();
  }
  console.log('revision 2 passed');
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
