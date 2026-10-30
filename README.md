# Реверс-редуктор V6: small demo, two designs

Plain static site (no build tool, no framework) asked for by the owner: company name, phone, address on the first page,
four tabs from the owner's sketch (Наша продукция, Запасные части, Услуги, Техническая документация), four gearbox cards,
each opening a parts picker like an auto-parts catalog (drawing on one side, parts list on the other), certificate and
ordering info at the bottom of the first page.

- `a/` «Деловой реестр»: masthead + horizontal tabs, Literata serif + Golos Text, navy and bronze on warm paper, 2x2 cards, picker in three columns (node index | drawing | list).
- `b/` «Инженерный пульт»: fixed left rail with tabs and contacts, IBM Plex Sans/Mono, steel and cobalt, blueprint search console as first screen, 4-across tiles, picker with a thumbnail filmstrip of the 26 nodes.
- `c/` «Морской штаб» (Dmitry's references, 2026-10-29): navy strip + white header with nav and «Список запроса», navy hero with the owner's РР-300 photo, horizontal model cards (photo | data | «Запчасти»/«Характеристики»), services, certificate panel, ordering/tenders/requisites/contacts, footer. Catalog in the auto-parts structure: filter bar (model switch, node/group select, search in all catalogs), node index with thumbnails, node page with drawing beside the specification, variant selector (quantity per исполнение, dashes = not included), «Сравнить все исполнения», mass, footnotes, prev/next. Own engine `c/app.js`.
- `c-r1/` C revision 1 (2026-10-29): C's markup and engine unchanged (`c-r1/index.html` loads `../c/app.js`), only `c-r1/style.css` differs: the «Naval Authority» skin from `~/Downloads/reduktor_v5_design_lab.html` (porcelain #f5f5f2, white panels, navy #102b3a strip and hero, bronze #b78e5a, action #174758, 15 px base, 13 px nav, 11 px tracked labels, 3 px radius). Light only, like the lab page (`color-scheme: light`), so a Mac in dark mode still shows the Naval palette. `c/` is kept as the previous state.
- `c-r2/` C revision 2 (2026-10-29): Dmitry's content corrections on top of revision 1 (own copies of markup, style and engine). Every step and the rollback commands: `CHANGELOG.md`.
- `c-r3/` C revision 3 (2026-10-29): second round of corrections (catalog with price and quantity, coming-soon illustration, services tiles, documentation archive with the catalog scans). Steps and rollback: `CHANGELOG.md`.
- `c-r4/` C revision 4 (2026-10-29): third round (РР-238 restored, neutral «скоро появится» placeholders, services as a vertical list, compact technical documentation). Steps and rollback: `CHANGELOG.md`.
- `c-r5/` C revision 5 (2026-10-29): one unified parts catalog (`RR.catalog`) with filters by gearbox and group, search and applicability labels. Steps, evidence and rollback: `CHANGELOG.md`.
- `c-r6/` C revision 6 (2026-10-29): r5 catalog with the r4 catalog page, picture tiles and list picture restored. `CHANGELOG.md`.
- `c-r7/` C revision 7 (2026-10-29): compact model cards on the catalog page, services band, documentation archive page. `CHANGELOG.md`.
- `index.html`: chooser between A, B, C and its revisions.
- `shared/schema.js`: part groups and the generic group diagram, used by all three.
- `shared/app.js`: one engine for both (hash routes, picker, drawing/list sync, search, request list). `shared/data.js` is generated.

Data comes from V5 (`../v5-ab/src/data`, `../v5-ab/public`): `python3 build.py` writes `shared/data.js` and copies 85 files into `assets/`.

## Picker content

- РР-300: «Общий вид, разрез» (manual fig. 1, clickable callouts synced with the legend), «Все детали» (205), 26 catalog nodes with the scanned drawing and the position table (pos, designation, name, qty, «+» to the request).
- РР-238, 3Д6, 3Д12: no factory drawings exist in the owner's material, so the picture is a generic **group diagram** of a reverse gearbox (zones for shafts, gears, discs, bearings...). It is labelled «Схема групп деталей», never as a drawing. Owner drawings would replace it.
- Request list: browser storage only; «Написать письмо» opens a mailto on click, nothing is sent by the site.

## Run and test

```
cd ~/Documents/Projects/Reductor/v6-demo
python3 -m http.server 4340          # open http://localhost:4340/
node qa/test.cjs                     # functional A and B, Chromium + WebKit
node qa/test-c.cjs                   # functional C, Chromium + WebKit
DESIGN=c-r1 node qa/test-c.cjs       # same checks on C revision 1
node qa/test-c-r2.cjs                # revision 2 (corrections + catalog), Chromium + WebKit
node qa/test-c-r3.cjs                # revision 3, Chromium + WebKit
node qa/test-c-r4.cjs                # revision 4, Chromium + WebKit
node qa/test-c-r5.cjs                # revision 5 (unified catalog), Chromium + WebKit
node qa/test-c-r6.cjs                # revision 6, Chromium + WebKit
node qa/test-c-r7.cjs                # revision 7, Chromium + WebKit
node qa/axe.cjs                      # axe WCAG 2.2 AA, light + dark
node qa/shots.cjs ab home,m/3d6      # screenshots + overflow check at 1440 and 390 into qa/shots/
```

Playwright and axe are borrowed from `../v5-ab/node_modules`.

## Known limits

- Callout circles on the РР-300 section are pointer-only (they sit 18 px apart on the drawing); the legend rows are the keyboard path to the same function.
- C photos: РР-300 = owner photo (no watermark, model per owner file name); РР-238 and 3Д12 = old-store photos with the owner's own revers-remont.ru watermark, model not confirmed by the owner; 3Д6 = old Tilda store photo (reconstruction tilda-img fe053e94e613210e, owner revers-remont.ru mark, model labelled 3Д6 by the old store). The revers-reduktor.ru 3Д6 shot stays out (СибФлотСервис watermark). No prices on cards (archive 2025 prices are not current).
- Not published anywhere. Hosting it needs Dmitry's go-ahead (same GitHub Pages pattern as V5).
