// Revision 4 checks (Dmitry's corrections, 2026-10-29). Server on :4340: node qa/test-c-r3.cjs
const { chromium, webkit } = require(require('path').join(__dirname, '../../v5-ab/node_modules/playwright'));
const assert = require('assert');
const U = (h = '') => `http://localhost:4340/c-r4/${h}`;
const txt = (p, s) => p.locator(s).allInnerTexts();
(async () => {
  for (const [name, eng] of [['chromium', chromium], ['webkit', webkit]]) {
    const b = await eng.launch(); const p = await (await b.newContext({ viewport: { width: 1360, height: 900 } })).newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.goto(U());
    assert.deepEqual(await txt(p, '.nav a'), ['Наша продукция', 'Запасные части', 'Услуги', 'Техническая документация']);
    // products: clutch and upcoming model have the illustration; no «NEW» word; button kept
    assert.equal(await p.locator('#model-mufta-ms .ph-art, #model-new .ph-art').count(), 2);
    assert.ok(!/\bNEW\b/.test(await p.locator('#model-new').innerText()), 'no NEW word');
    assert.equal(await p.locator('#model-new a:has-text("Узнать о сроках")').count(), 1);
    // РР-238 is back: products and catalogs
    assert.equal(await p.locator('#model-rr-238').count(), 1, 'РР-238 card');
    // services: vertical numbered list, titles only
    assert.deepEqual(await txt(p, '.svc3 h3'), ['Ремонт судовых реверс-редукторов', 'Ремонт рулевых машин РГ-0,25', 'Техническая поддержка', 'Изготовление деталей судового машиностроения', 'Разработка технической документации судового машиностроения']);
    assert.equal(await p.locator('.svc3 li p').count(), 0, 'no repeating descriptions');
    // documentation tab -> archive
    await p.click('.nav a[href="#dokumenty"]'); await p.waitForTimeout(300);
    assert.ok(await p.locator('#dokumenty .arch').isVisible());
    assert.equal(await p.locator('.arch li').count(), 4); assert.equal(await p.locator('.arch:has-text("Свидетельство")').count(), 0, 'certificate not in the docs list'); assert.equal(await p.locator('#docs-h').innerText(), 'Техническая документация'); assert.equal(await p.locator('.arch .badge').count(), 2, 'two items marked В подготовке');
    await p.click('.arch a[href="#arhiv/katalog-rr300"]'); await p.waitForSelector('.scans');
    assert.equal(await p.locator('.scans li').count(), 89);
    assert.equal(await p.locator('.nav a[aria-current]').innerText(), 'Техническая документация');
    // catalog: compact, no mass, price before quantity + В запрос
    await p.goto(U('#m/rr-300/ris-3')); await p.waitForSelector('[data-isp]');
    assert.deepEqual(await txt(p, 'table.spec thead th'), ['Поз.', 'Обозначение', 'Наименование', 'В изделии', 'Цена за ед.', 'Количество']);
    assert.equal(await p.locator('.c-m, .kicker').count(), 0, 'no mass column, no repeated kicker');
    assert.equal(await p.locator('h1').count() >= 1, true);
    assert.match(await p.locator('tr[data-des="525-16-112"] .c-p').innerText(), /32\s000\s₽/);
    await p.fill('tr[data-des="525-16-112"] [data-qty]', '3'); await p.click('tr[data-des="525-16-112"] .btn-add');
    assert.equal((await p.locator('[data-cart-count]').innerText()).trim(), '3', 'quantity goes into the request list');
    // variant still switches rows
    await p.goto(U('#m/rr-300/ris-1')); await p.waitForSelector('[data-isp]');
    await p.selectOption('[data-isp]', '-'); await p.waitForFunction(() => document.querySelector('[data-isp]').value === '-');
    const b1 = await p.locator('tr.na').count(); await p.selectOption('[data-isp]', '-004'); await p.waitForFunction((n) => document.querySelectorAll('tr.na').length !== n, b1);
    await p.click('[data-compare]'); await p.waitForSelector('table.spec.cmp');
    await p.goto(U('#katalog')); await p.waitForSelector('.cats');
    assert.equal(await p.locator('.cats li').count(), 5, 'five catalogs incl. РР-238');
    await p.goto(U('#katalog/3d6')); await p.waitForSelector('.tile');
    assert.equal(await p.locator('.tile .tile-num').count(), 0, 'group tiles show the placeholder, not numbers');
    assert.ok(await p.locator('.tile .ph-art').count() > 5);
    assert.deepEqual(await txt(p, '.seg a'), ['РР-300', 'РР-238', '3Д6', '3Д12', 'Муфта МС']);
    // models without drawings: same layout with the coming-soon drawing, no group diagram
    for (const r of ['#katalog/3d6', '#m/3d6/vse', '#m/3d12/vse', '#katalog/mufta-ms']) {
      await p.goto(U(r)); await p.waitForSelector('[data-cat] h1');
      assert.equal(await p.locator('[data-cat] .pk-zone').count(), 0, r + ': no group diagram');
    }
    assert.equal(await p.locator('[data-cat] .ph-art').count(), 1, 'clutch page has the coming-soon drawing');
    await p.goto(U('#m/3d6/vse')); await p.waitForSelector('[data-cat] .ph-art');
    // search still limited and hands off
    await p.fill('[data-gq]', '52516112'); await p.waitForSelector('[data-gres] a'); await p.locator('[data-gres] a').first().click(); await p.waitForSelector('tr.hit');
    assert.deepEqual(errs, [], 'no page errors');
    console.log('pass', name); await b.close();
  }
  console.log('revision 4 passed');
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
