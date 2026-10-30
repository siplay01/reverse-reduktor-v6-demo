// Functional checks for both designs. Run with a server on :4340 serving v6-demo/: node qa/test.cjs
const { chromium, webkit } = require(require('path').join(__dirname, '../../v5-ab/node_modules/playwright'));
const assert = require('assert');
const U = (v, h = '') => `http://localhost:4340/${v}/${h}`;
(async () => {
  let n = 0;
  for (const [name, eng] of [['chromium', chromium], ['webkit', webkit]]) {
    const b = await eng.launch();
    for (const v of ['a', 'b']) {
      const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
      const p = await ctx.newPage(); const errs = [];
      p.on('pageerror', e => errs.push(e.message));
      await p.goto(U(v));
      // home: 4 cards, tabs, phone, certificate
      assert.equal(await p.locator('.card').count(), 4, 'four model cards');
      assert.ok(await p.locator('a[href="tel:+79609665577"]').first().isVisible(), 'phone visible');
      assert.ok(await p.locator('[data-panel=home] img[alt*="06552"]').isVisible(), 'certificate on home');
      // tabs switch panels
      for (const t of ['zapchasti', 'uslugi', 'dokumenty', 'produkciya']) {
        await p.click(`[data-tab=${t}]`); await p.waitForFunction((t) => !document.querySelector(`[data-panel=${t}]`).hidden, t);
        assert.ok(await p.locator(`[data-panel=${t}]`).isVisible(), `tab ${t}`);
        assert.equal(await p.locator(`[data-tab=${t}]`).getAttribute('aria-current'), 'page');
      }
      assert.ok(!(await p.locator('[data-panel=home]').first().isHidden()), 'home blocks under produkciya');
      await p.click('[data-tab=uslugi]'); await p.waitForFunction(() => !document.querySelector('[data-panel=uslugi]').hidden);
      assert.ok(await p.locator('[data-panel=home]').first().isHidden(), 'home blocks only on the first tab');
      await p.click('[data-tab=produkciya]'); await p.waitForFunction(() => !document.querySelector('[data-panel=produkciya]').hidden);
      // card -> picker
      await p.click('.card[data-model=rr300] .card-go'); await p.waitForSelector('.pk-h1');
      assert.ok(await p.locator('.pk-h1').isVisible(), 'picker open');
      assert.ok(await p.locator('[data-panel=home]').first().isHidden(), 'home blocks hidden in picker');
      // overview: legend row <-> callouts
      await p.click('.pk-view[href$="/obshchiy"]'); await p.waitForSelector('.pk-view[aria-current][href$="/obshchiy"]');
      await p.click('tr[data-nums="3 13"]');
      assert.equal(await p.locator('.pk-pt.on').count(), await p.locator('.pk-pt[data-n="3"], .pk-pt[data-n="13"]').count(), 'row lights its callouts');
      await p.click('.pk-pt[data-n="22"]');
      assert.equal(await p.locator('tr.on').count(), 1); assert.match(await p.locator('tr.on').innerText(), /ведомый вал/);
      // node view: positions, filter, add to request
      await p.click('.pk-view[href$="/ris-5"]'); await p.waitForSelector('.pk-view[aria-current][href$="/ris-5"]');
      assert.equal(await p.locator('.pk-table tbody tr').count(), 18, 'fig 5 has 18 rows');
      await p.fill('[data-filter]', '525 16 110');
      assert.equal(await p.locator('.pk-table tbody tr:not([hidden])').count(), 1, 'filter ignores spaces/hyphens');
      await p.fill('[data-filter]', 'zzzz'); assert.ok(await p.locator('.pk-none').isVisible(), 'empty state');
      await p.fill('[data-filter]', '');
      await p.click('[data-add="525-542"]'); await p.click('[data-add="525-542"]'); await p.click('[data-add="525-547"]');
      assert.equal((await p.locator('[data-cart-count]').first().innerText()).trim(), '3');
      // models without drawing: schematic zone click selects the group
      await p.goto(U(v, '#m/3d6')); await p.waitForSelector('.pk-zone');
      await p.locator('.pk-zone[data-g="Шестерни"]').dispatchEvent('click');
      await p.waitForFunction(() => location.hash.includes('/gr-'));
      assert.match(await p.locator('#pk-lh').innerText(), /Шестерни/);
      assert.ok(await p.locator('.pk-zone.on[data-g="Шестерни"]').count() === 1, 'zone highlighted');
      // search tab: designation without hyphens -> result -> opens the right node with the row marked
      await p.goto(U(v, '#zapchasti'));
      await p.fill('[data-search]', '52516110');
      await p.locator('[data-results] a').first().click(); await p.waitForFunction(() => location.hash.startsWith('#m/')); await p.waitForSelector('tr.hit');
      assert.match(p.url(), /#m\/rr-300\/ris-\d+/); assert.equal(await p.locator('tr.hit').count(), 1);
      // request dialog: persisted, qty edit, remove, mailto text
      await p.reload();
      await p.locator('[data-cart-open]').first().click();
      assert.ok(await p.locator('#cart').isVisible());
      assert.equal(await p.locator('#cart-items li').count(), 2);
      assert.equal(await p.locator('#cq0').inputValue(), '2');
      await p.fill('#cq1', '5'); await p.locator('#cq1').dispatchEvent('change');
      const txt = await p.evaluate(() => JSON.parse(localStorage.getItem('rr-demo-cart')).map(c => c.des + ':' + c.q).join(','));
      assert.equal(txt, '525-542:2,525-547:5');
      await p.click('[data-x="0"]'); assert.equal(await p.locator('#cart-items li').count(), 1);
      await p.keyboard.press('Escape'); assert.ok(!(await p.locator('#cart').isVisible()), 'Esc closes dialog');
      // keyboard: tabs reachable, focus visible
      await p.goto(U(v));
      if (name === 'chromium') { await p.keyboard.press('Tab'); assert.equal(await p.evaluate(() => document.activeElement.className), 'skip'); } // WebKit skips links on Tab by default
      if (v === 'b') { await p.fill('#hq', '525-542'); await p.press('#hq', 'Enter'); await p.waitForSelector('[data-results] li', { timeout: 3000 });
        assert.ok((await p.locator('[data-results] li').count()) >= 1, 'hero search hands off'); }
      assert.deepEqual(errs, [], 'no page errors');
      n++; console.log('pass', name, v);
      await ctx.close();
    }
    await b.close();
  }
  console.log(`all ${n} runs passed`);
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
