// Screenshots of both designs. Usage: node qa/shots.cjs [a|b|ab] [route,...]  (server on :4340 serving v6-demo/)
const { chromium, webkit } = require(require('path').join(__dirname, '../../v5-ab/node_modules/playwright'));
const [vs = 'abc', routes = 'home,m/rr-300/ris-5,m/3d6,m/rr-300/obshchiy,zapchasti', engine = 'chromium', scheme = 'light'] = process.argv.slice(2);
(async () => {
  const b = await (engine === 'webkit' ? webkit : chromium).launch();
  for (const v of vs.split('')) for (const w of [1440, 390]) {
    const ctx = await b.newContext({ viewport: { width: w, height: w > 500 ? 900 : 844 }, colorScheme: scheme, deviceScaleFactor: 1, isMobile: w < 500 && engine !== 'firefox' });
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
    for (const r of routes.split(',')) {
      await p.goto(`http://localhost:4340/${v}/${r === 'home' ? '' : '#' + r}`); await p.waitForTimeout(400);
      const sw = await p.evaluate(() => document.documentElement.scrollWidth);
      const f = `qa/shots/${v}-${w}-${scheme}-${r.replace(/\//g, '_')}.png`;
      await p.screenshot({ path: f, fullPage: true });
      console.log(f, 'scrollWidth', sw, sw > w ? 'OVERFLOW' : 'ok');
    }
    if (errs.length) console.log('ERRORS', v, w, errs);
    await ctx.close();
  }
  await b.close();
})();
