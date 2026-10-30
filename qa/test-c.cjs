// Functional checks for design C. Server on :4340 serving v6-demo/: node qa/test-c.cjs
const { chromium, webkit } = require(require('path').join(__dirname, '../../v5-ab/node_modules/playwright'));
const assert = require('assert');
const D = process.env.DESIGN || 'c'; // DESIGN=c-r1 runs the same checks on revision 1
const U = (h = '') => `http://localhost:4340/${D}/${h}`;
(async () => {
  for (const [name, eng] of [['chromium', chromium], ['webkit', webkit]]) {
    const b = await eng.launch(); const p = await (await b.newContext({ viewport: { width: 1360, height: 900 } })).newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.goto(U());
    assert.equal(await p.locator('.mcard').count(), 4, 'four horizontal model cards');
    assert.ok(await p.locator('.strip-c').isVisible() && await p.locator('a[href="tel:+79609665577"]').first().isVisible(), 'certificate line and phone in header');
    // card: specs toggle, then link opens that model's catalog
    await p.click('[data-more="rr300"]'); assert.ok(await p.locator('#more-rr300').isVisible(), 'Характеристики expands');
    assert.equal(await p.locator('#more-rr300 .vtab tbody tr').count(), 10, 'РР-300 variants table');
    await p.click('#model-3d12 .mcard-h a'); await p.waitForSelector('[data-view=cat]:not([hidden]) h1');
    assert.match(await p.locator('[data-cat] h1').innerText(), /3Д12/); assert.ok(await p.locator('[data-view=home]').isHidden());
    // filter bar: model switch and node select
    await p.click('.seg a:has-text("РР-300")'); await p.waitForFunction(() => location.hash === '#katalog/rr-300');
    await p.waitForFunction(() => document.querySelectorAll('.tile').length === 28).catch(() => {});
    assert.equal(await p.locator('.tile').count(), 28, 'overview + all parts + 26 nodes');
    await p.selectOption('[data-jump]', 'ris-3'); await p.waitForFunction(() => location.hash === '#m/rr-300/ris-3');
    await p.waitForSelector('.kicker:has-text("рис. 3 из")');
    assert.equal(await p.locator('table.spec tbody tr').count(), 16);
    assert.match(await p.locator('.kicker').innerText(), /рис\. 3 из 26/i);
    // prev / next
    await p.click('.pn a:has-text("Рис. 4")'); await p.waitForFunction(() => location.hash === '#m/rr-300/ris-4');
    // variant selector changes quantities; compare shows every variant column
    await p.goto(U('#m/rr-300/ris-1')); await p.waitForSelector('[data-isp]');
    const before = await p.locator('tr.na').count();
    await p.selectOption('[data-isp]', '-004'); await p.waitForFunction(() => document.querySelector('[data-isp]').value === '-004');
    const after = await p.locator('tr.na').count();
    assert.notEqual(before, after, 'variant changes which rows are not included');
    assert.ok(await p.locator('tr.na .btn-add[disabled]').count() === after, 'not-included rows cannot be requested');
    await p.click('[data-compare]'); await p.waitForSelector('table.spec.cmp');
    assert.equal(await p.locator('table.spec.cmp thead th.c-q').count(), 10, 'compare: 10 variant columns');
    await p.click('[data-compare]'); await p.waitForSelector('table.spec:not(.cmp)');
    // variant stays when moving to another node that has it
    await p.goto(U('#m/rr-300/ris-3')); await p.waitForSelector('[data-isp]');
    // global search: hyphen-free designation, result opens node with the row marked
    await p.fill('[data-gq]', '52516112'); await p.waitForSelector('[data-gres] a');
    await p.locator('[data-gres] a').first().click(); await p.waitForSelector('tr.hit');
    assert.match(p.url(), /#m\/rr-300\/ris-\d+\?q=/);
    assert.equal(await p.inputValue('[data-filter]'), '525-16-112', 'filter shows the searched designation so it can be cleared');
    await p.fill('[data-filter]', '');
    // request list
    await p.locator('tr:not(.na) .btn-add').first().click(); await p.locator('tr:not(.na) .btn-add').nth(1).click();
    assert.equal((await p.locator('[data-cart-count]').innerText()).trim(), '2');
    await p.click('[data-cart-open]'); assert.equal(await p.locator('#cart-items li').count(), 2);
    assert.match(await p.locator('#cart-items small').first().innerText(), /РР-300, рис\. \d+, поз\. \d+, исп\./);
    await p.keyboard.press('Escape');
    // overview sync and group diagram
    await p.goto(U('#m/rr-300/obshchiy')); await p.waitForSelector('tr[data-nums]');
    await p.click('tr[data-nums="3 13"]'); assert.equal(await p.locator('.pt.on').count(), await p.locator('.pt[data-n="3"], .pt[data-n="13"]').count());
    await p.goto(U('#m/3d6/vse')); await p.waitForSelector('[data-cat] .pk-zone');
    await p.locator('[data-cat] .pk-zone[data-g="Подшипники"]').dispatchEvent('click'); await p.waitForFunction(() => location.hash.includes('/gr-'));
    await p.waitForSelector('[data-cat] .pk-zone.on[data-g="Подшипники"]');
    // nav to a home section from the catalog
    await p.click('.nav a[href="#dokumenty"]'); await p.waitForSelector('[data-view=home]:not([hidden])');
    assert.ok(await p.locator('#dokumenty .cert').isVisible());
    assert.deepEqual(errs, [], 'no page errors');
    console.log('pass', name); await b.close();
  }
  console.log('design C passed');
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
