// axe-core WCAG 2.2 AA scan of key views, light and dark. Server on :4340.
const path = require('path'), nm = path.join(__dirname, '../../v5-ab/node_modules/');
const { chromium } = require(nm + 'playwright'); const { AxeBuilder } = require(nm + '@axe-core/playwright');
const A = ['', '#m/rr-300/obshchiy', '#m/rr-300/ris-5', '#m/3d6/gr-2', '#zapchasti', '#dokumenty'];
const C = ['', '#katalog/rr-300', '#katalog/3d6', '#m/rr-300/obshchiy', '#m/rr-300/ris-3', '#m/3d6/gr-2'];
(async () => {
  const b = await chromium.launch(); let bad = 0;
  for (const scheme of ['light', 'dark']) for (const [v, rs] of [['a', A], ['b', A], ['c', C], ['c-r1', C], ['c-r2', ['', '#katalog', '#katalog/mufta-ms', '#katalog/rr-300', '#m/rr-300/ris-3', '#m/3d6/gr-2']], ['c-r3', ['', '#katalog', '#katalog/mufta-ms', '#m/rr-300/ris-3', '#m/3d6/vse', '#arhiv/katalog-rr300']], ['c-r4', ['', '#katalog', '#katalog/3d6', '#m/3d6/vse', '#katalog/rr-238', '#katalog/mufta-ms']], ['c-r5', ['', '#katalog', '#katalog/rr-300', '#katalog/3d6?q=525', '#m/rr-300/ris-3', '#katalog/mufta-ms']], ['c-r6', ['#katalog', '#katalog/rr-300', '#katalog/3d6', '#katalog/3d6/spisok', '#katalog/vse?q=525', '#m/rr-300/ris-3']], ['c-r7', ['', '#katalog', '#arhiv', '#katalog/3d6/spisok', '#m/rr-300/ris-3']], ['c-r10', ['', '#katalog', '#katalog/mufta-ms', '#katalog/3d6', '#arhiv', '#katalog/3d6/spisok']], ['c-r11', ['', '#katalog', '#katalog/mufta-ms', '#katalog/3d6', '#arhiv', '#katalog/3d6/spisok', '#m/rr-300/ris-3']], ['c-r12', ['', '#katalog/mufta-ms', '#katalog/3d6', '#katalog/3d6/spisok']], ['c-r13', ['#katalog/3d6', '#katalog/3d6/spisok', '#katalog/3d12/spisok']], ['c-r14', ['', '#katalog', '#arhiv', '#katalog/3d6']], ['c-r15', ['', '#katalog', '#arhiv', '#katalog/3d6']], ['c-r16', ['#arhiv', '#katalog/3d6/spisok']]]) for (const r of rs) {
    const p = await (await b.newContext({ colorScheme: scheme })).newPage();
    await p.goto(`http://localhost:4340/${v}/${r}`); await p.waitForTimeout(300);
    const res = await new AxeBuilder({ page: p }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    for (const x of res.violations) { bad++; console.log(scheme, v, r || 'home', x.id, x.nodes.length, x.nodes[0].target.join(' '), x.nodes[0].failureSummary.split('\n')[1]); }
  }
  console.log('violations', bad); await b.close();
})();
