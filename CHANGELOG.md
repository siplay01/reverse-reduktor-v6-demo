# Change log, v6-demo

Every revision lives in its own folder; older folders are never edited. Git history (local repo in this folder) records each step.

## 2026-10-29 · C revision 7 (`c-r7/`), catalog cards, services, documentation

Start: exact copy of `c-r6/`. Baseline tag `before-c-r7`.

| Step | What changed | Files |
| --- | --- | --- |
| 1 | «Запасные части» page: compact versions of the home-page model cards (photo or placeholder, kind, name + designation, count, «Каталог запчастей») for РР-300, РР-238, 3Д6, 3Д12 and the clutch; link «Все запчасти одним списком» kept. | `c-r7/app.js`, `c-r7/style.css` |
| 2, 2b | «Услуги» redesigned after references (ZF Marine aftersales brochure, Transmission Marine «Our Services»; search via Tavily): navy band with a faint РР-300 section drawing, heading «Ремонт, изготовление и техническое сопровождение», РКО line, «Позвонить» / «Написать», five equal cards (icon in a bronze circle, number, name). | `c-r7/index.html`, `c-r7/style.css` |
| 3, 3b | «Техническая документация» on the home page is one compact line «Техническая документация · Каталоги и руководства →». The tab and footer link open the archive page `#arhiv`: groups «Руководства по эксплуатации», «Каталоги деталей», «Инструкции по ремонту»; each row: document, product, format, actions (manual PDF, РР-300 catalog scans + interactive catalog); 3Д6, 3Д12, clutch catalogs and repair instructions «В подготовке». | `c-r7/index.html`, `c-r7/app.js`, `c-r7/style.css` |

Checks: `node qa/test-c-r7.cjs` passed (Chromium + WebKit); `node qa/axe.cjs` 0 violations; no horizontal overflow at 390 and 1024 (WebKit); revision 6 test still passes.

Rollback: older folders untouched; `git revert <commit>` or `git checkout before-c-r7 -- .`

## 2026-10-29 · C revision 6 (`c-r6/`), catalog and pictures restored

Dmitry: «картинки и каталог должны были остаться, а ты их удалил». Revision 5 had removed the «Запасные части» catalog page, the per-gearbox pages with picture tiles and the picture beside the parts list. Start: exact copy of `c-r5/`. Baseline tag `before-c-r6`.

| Step | What changed | Files |
| --- | --- | --- |
| 1 | Restored from r4: «Запасные части» page with the five catalogs (`#katalog`), per-gearbox pages with picture tiles (`#katalog/<model>`: РР-300 section, front view and 26 node drawings; «Чертёж скоро появится» tiles for РР-238, 3Д6, 3Д12), the picture beside the parts list (РР-300 drawing or the placeholder). Kept from r5: the unified list with filters, now at `#katalog/vse` (all) and `#katalog/<model>/spisok` (one gearbox, link «Все запчасти одним списком» on the catalog page); tiles «Все детали» and groups open that list. r5 list addresses redirect. | `c-r6/app.js`, `c-r6/style.css` |

Checks: `node qa/test-c-r6.cjs` passed (Chromium + WebKit); `node qa/axe.cjs` 0 violations; no horizontal overflow at 390 and 1024 (WebKit); revision 5 test still passes.

Rollback: older folders untouched; `git revert <commit>` or `git checkout before-c-r6 -- .`

## 2026-10-29 · C revision 5 (`c-r5/`), unified parts catalog

Start: exact copy of `c-r4/`. Baseline tag `before-c-r5`. Brief: consolidate the four gearbox catalogs into one catalog, keep the site's look.

| Step | What changed | Files |
| --- | --- | --- |
| data | `RR.catalog`: one record per designation (307), with `models` (associations as recorded), `src` (factory = РР-300 catalog table checked against the scan, ocr = РР-300 catalog index by OCR, old = revers-remont.ru store, sister = revers-reduktor.ru), `figs` (РР-300 catalog figures), `vardep` (quantity differs between РР-300 variants), and the existing description, photo reference and old URL. `RR.parts` stays for older revisions. | `build.py`, `shared/data.js` |
| 1, 1b | One catalog page `#katalog[/<model>][?g=&q=]` with filters «По редуктору» (Все, РР-300, РР-238, 3Д6, 3Д12), «По группе деталей» (only groups that have parts, with counts), «Поиск» (designation with or without hyphens, name), «Сбросить фильтры». Column «Применяемость»: model labels, links to the РР-300 drawing (рис. N), «зависит от исполнения», «уточните при заказе» for multi-model records. Product cards and the «Запасные части» tab open this page (cards pre-filtered); the chooser and per-model index pages are gone. РР-300 drawing pages kept; their search sends the query to the list; «Чертежи узлов РР-300» available as a collapsed strip on the РР-300 filter. Old `#m/<model>/vse` and `#m/<model>/gr-N` addresses redirect to the list. Clutch page unchanged. | `c-r5/app.js`, `c-r5/style.css` |

Evidence used: the РР-300 manual РР-300.РЭ (`v5-ab/public/docs/rr300-rukovodstvo.pdf`, byte-identical to the owner file «Руководство РР300 А4.pdf»), the РР-300 parts catalog tables (scans), the recovered data of revers-remont.ru and revers-reduktor.ru, and the earlier research notes (`~/Downloads/reducer_source_research_2026-10-29/research-findings.md`, which lists НЕВА-дизель as a reference; not re-fetched in this step).
No part-level interchangeability is confirmed by these documents: the 18 multi-model records keep their recorded associations and carry «уточните при заказе». The manual confirms whole-unit facts only (РР-300 for diesels 3Д6, 3Д12, ДРА150/Я1, ДРА300/Я2; mounting interchangeable with the discontinued mechanical gearboxes of 3Д6/3Д6Н/3Д12; 16- or 20-finger coupling by engine).

Checks: `node qa/test-c-r5.cjs` passed (Chromium + WebKit); `node qa/axe.cjs` 0 violations; no horizontal overflow at 390 and 1024 (WebKit); revision 4 test still passes.

Rollback: older folders untouched; one step: `git revert <commit>`; everything: `git checkout before-c-r5 -- .`

## 2026-10-29 · C revision 4 (`c-r4/`), Dmitry's third round

Start: exact copy of `c-r3/`. Baseline tag `before-c-r4`.

| Step | What changed | Files |
| --- | --- | --- |
| 1 | РР-238 back in «Наша продукция» (card with photo and specs), in «Запасные части» (chooser «Для реверс-редуктора гидравлического РР-238», switch, search) and in the footer. | `c-r4/app.js`, `c-r4/index.html` |
| 2, 2b | My drive-line drawing replaced by a neutral placeholder following the common shop pattern (research: Tavily; Exa was rate-limited): light grey panel, soft generic gearbox silhouette, faint diagonal «СКОРО» watermark, label «Фото скоро появится» (product cards: муфта, new model) or «Чертёж скоро появится» (catalog pages and group tiles of РР-238, 3Д6, 3Д12, муфта). Group tiles no longer show bare numbers. | `c-r4/app.js`, `c-r4/style.css` |
| 3, 3b | «Услуги» as a vertical numbered list (01-05, icon, name); heading and the РКО note on the left. | `c-r4/style.css` |
| 4 | Section renamed «Техническая документация» (same as the tab); certificate removed from that list; compact 2x2 list (manual, catalog РР-300, repair instructions «В подготовке», catalogs 3Д6/3Д12/муфт «В подготовке»). Certificate block on the home page unchanged. | `c-r4/index.html`, `c-r4/style.css` |

Checks: `node qa/test-c-r4.cjs` passed (Chromium + WebKit); `node qa/axe.cjs` 0 violations on all versions; no horizontal overflow at 390 and 1024 in WebKit; revision 3 test still passes.

Rollback: older folders untouched; one step: `git revert <commit>` (messages start with «c-r4 step N»); everything: `git checkout before-c-r4 -- .`

## 2026-10-29 · C revision 3 (`c-r3/`), Dmitry's second round

Start: exact copy of `c-r2/`. Baseline tag `before-c-r3`. Shared data gained two fields (`prices`, `scans`); older designs ignore them and their tests still pass.

| Step | What changed | Files |
| --- | --- | --- |
| data | Unit prices from the old store (2025 price list, 158 of 307 parts) and the 89 scanned pages of the РР-300 catalog. | `build.py`, `shared/data.js`, `assets/` |
| 1 | Product cards: clutch and the upcoming hydraulic model get one shared drawn illustration (drive line: двигатель, муфта, реверс-редуктор, валопровод) labelled «Фото готовится» / «Новая модель · скоро». Word NEW removed; the upcoming model is titled «Гидравлический реверс-редуктор», kind «Новая разработка», badge «В разработке», bronze frame; button «Узнать о сроках» kept. | `c-r3/app.js`, `c-r3/style.css` |
| 2 | Services: five equal tiles with a line icon and the name only (no descriptions that repeat the title, no single dark card); one shared note about РКО under the tiles. | `c-r3/index.html`, `c-r3/style.css` |
| 3 | «Техническая документация» opens «Архив технической документации»: руководство РР-300 (PDF), каталог деталей РР-300 (89 scanned pages in a viewer + the interactive catalog), свидетельство РКО; «Инструкции по ремонту реверс-редукторов» and «Каталоги деталей 3Д6, 3Д12 и муфт сцепления» marked «В подготовке». Certificate block kept, anchor now `#svidetelstvo`. | `c-r3/index.html`, `c-r3/app.js`, `c-r3/style.css` |
| 4 | Catalog: one-line compact headers (no big title, no kicker, no repeated designation), one tool row (исполнение, фильтр, все исполнения), columns Поз. / Обозначение / Наименование / В изделии / Цена за ед. / Количество + «В запрос» last; mass column removed; quantity goes into the request list; the page scrolls with a pinned table header instead of an inner scroll box. 3Д6, 3Д12 and the clutch use the same layout as РР-300 with the illustration «Чертёж в подготовке» instead of the group diagram. Price note «по прайсу 2025 г.» once under the table. | `c-r3/app.js`, `c-r3/style.css` |
| 4b, 4c | Illustration label position, regular weight for «по запросу», tighter rows; phone layout of the tool row and row cards. | `c-r3/app.js`, `c-r3/style.css` |

Checks: `node qa/test-c-r3.cjs` passed (Chromium + WebKit); `node qa/axe.cjs` 0 violations on all versions; no horizontal overflow at 390, 1024, 1440 (WebKit + Chromium); A, B, C-r1, C-r2 tests still pass.

Rollback: older folders untouched; one step: `git revert <commit>` (messages start with «c-r3 step N»); everything: `git checkout before-c-r3 -- .`

## 2026-10-29 · C revision 2 (`c-r2/`), Dmitry's corrections

Start: exact copy of `c-r1/` (markup, style) + `c/app.js` (commit `bc88039`). Baseline of everything before: tag `before-c-r2` (commit `04451f1`).

| Step | What changed | Files |
| --- | --- | --- |
| 1 | Tabs renamed: «Наша продукция», «Запасные части», «Услуги», «Техническая документация». Tab «Тендеры» removed (header, mobile menu). | `c-r2/index.html` |
| 2 | «Наша продукция» = РР-300, 3Д6, 3Д12, «Муфта сцепления МС» (гидравлическая СБ525-01-14, механическая СБ1226-00-2, from the old repair page), «Реверс-редуктор гидравлический NEW» with badge «Скоро · в разработке». РР-238 card no longer listed (not in Dmitry's list). | `c-r2/app.js`, `c-r2/style.css` |
| 3 | «Запасные части» opens a chooser of 4 catalogs: для гидравлического РР-300, для механического 3Д6, для механического 3Д12, для муфты сцепления. Catalog switch and «Поиск во всех каталогах» limited to these. Clutch page: designations + e-mail/phone, no catalog published. | `c-r2/app.js`, `c-r2/style.css` |
| 4 | «Услуги» = 5 services in Dmitry's order and wording; layout reorganised (dark lead card «Ремонт судовых реверс-редукторов» + 2x2 grid). | `c-r2/index.html`, `c-r2/style.css` |
| 5 | Removed: 3 tiles under the certificate (руководство, каталог, реквизиты) and the whole block «Как сделать заказ», «Тендеры и закупки», panels «Реквизиты» and «Контакты». Certificate block unchanged. | `c-r2/index.html` |
| 6 | Footer reorganised: contacts (phone, e-mail, address), «Разделы» (new tab names), «Запасные части» (4 catalogs), «Реквизиты» with «Скопировать реквизиты». Anchor `#kontakty`. | `c-r2/index.html`, `c-r2/style.css` |

Not changed (on purpose, awaiting Dmitry): hero text and page description still name РР-238; model names keep «РР-300» (the handwritten scheme says «РРП-300»); section heading «Модельный ряд».

Checks: `node qa/test-c-r2.cjs` (Chromium + WebKit) passed; `node qa/axe.cjs` 0 violations on A, B, C, C-r1, C-r2; no horizontal overflow at 1440 and 390.

### How to roll back

- Nothing to undo for the old versions: `c/`, `c-r1/`, `a/`, `b/` are untouched and still open at their own URLs.
- Undo one step inside revision 2: `git log --oneline -- c-r2` and `git revert <commit>` (each step above is one commit, message starts with «c-r2 edit N»).
- Drop revision 2 entirely: `git rm -r c-r2 && git commit -m "drop c-r2"`, or check out the baseline: `git checkout before-c-r2 -- .`

## Earlier

- C revision 1 (`c-r1/`): C layout with the «Naval Authority» skin; light only (fixes Naval colours on a Mac in dark mode); 3Д6 photo from the old store.
- C (`c/`): layout from Dmitry's four reference screenshots.
- A, B: first two demo styles.

## 2026-10-29 · C revision 8 (`c-r8/`), services section

Start: copy of `c-r7/` (tag `before-c-r8`). The navy services band and the separate documentation strip are replaced by one section `.sv8`: 35/65 panels, pale blue-gray intro (label, heading, gold rule, RKO text, faint РР-300 section drawing from the manual), five numbered link rows, and the «Техническая документация» line inside the right panel (links to the existing `#arhiv` page, which lists the real files). Rows link to `#kontakty` (no per-service pages exist). Contrast tweaks to the brief colours: eyebrow #8a5a1f, intro text #4f6378, numbers 19 px.
Checks: `node qa/test-c-r8.cjs` (Chromium + WebKit; 1920/1440/768/390/375 overflow, 35% split, links, archive file links 200, no console errors).
Rollback: `git rm -r c-r8` or `git checkout before-c-r8 -- .`

r8 fix: blueprint in the intro panel is now the drawing from the approved reference (`~/Downloads/engineering_services_blueprint_interface.png`, bottom of the left panel, cropped to its edges into `c-r8/blueprint.webp`), shown whole at panel width with a soft top fade. The first version used the manual section drawing with `object-fit: cover`, which cut it on every side.

## 2026-10-29 · C revision 9 (`c-r9/`), soft schematics instead of «скоро» placeholders

Start: copy of `c-r8/` (tag `before-c-r9`). The grey silhouette with a «СКОРО» watermark and pill is replaced by two light line schematics reusing the c-r3 drive-line drawing: `line` (engine, clutch, reverse gear, shafting) on the product cards, `gear` (reverse gearbox in section) everywhere spare parts have no photo or drawing (group tiles, node page, compact cards). Pale strokes, faint caption (hidden on small tiles, still read by screen readers). Generic schematics, not drawings of a real unit. Only `c-r9/app.js` (`soonArt`) and `c-r9/style.css` changed.
Checks: `node qa/shot9.cjs` (screenshots, no overflow at 1440/390, no page errors), axe.
Rollback: `git rm -r c-r9` or `git checkout before-c-r9 -- .`

## 2026-10-29 · C revision 10 (`c-r10/`), final polish

Start: copy of `c-r9/` (tag `before-c-r10`).
- Services section: rows 23 px (was 19), numbers 22 px, documentation line 19/16 px, lead 16 px, taller rows; colours moved from the one-off blues/golds to site tokens (`--ink`, `--sub`, `--line`, `--accent-text`); numbers and arrows #a67c3c to pass 3:1 on white.
- Rounder: `--r` 3 px to 6 px (buttons, inputs, badges, the nine hard-coded 2px rules now use the token), new `--r-lg` 12 px for cards, panels, tiles, dialogs, the services block.
- Schematic section drawings (generic, drawn, not factory drawings): clutch (МС card) and hydraulic reverse gear (fallback). Group tiles and the node page keep the gear schematic, now on a faint blueprint grid with a dimension line.
- TEST: the РР-300 manual section drawing is the main picture of the «Гидравлический реверс-редуктор» (new development) card. Switch off: `USE_RR300_DRAWING = false` at the top of the product section of `c-r10/app.js`, or open the page with `?rr300pic=0` (`?rr300pic=1` = on). Off shows the drawn hydraulic schematic.
Checks: `node qa/test-c-r10.cjs` (Chromium + WebKit, 1920/1440/768/390/375), `node qa/test-c-r10-catalog.cjs` (r7 regression: catalog, search, archive), axe light + dark 0 violations on 6 pages.
Rollback: `git rm -r c-r10` or `git checkout before-c-r10 -- .`

## 2026-10-29 · C revision 11 (`c-r11/`), type, one placeholder, phone

Start: copy of `c-r10/` (tag `before-c-r11`).
- Placeholder: ONE picture everywhere a photo or drawing is missing (product cards for the clutch and the new hydraulic reverse, spare-part group tiles, node pages, lists, compact cards): faint gear-box schematic on a blueprint grid with large «КАРТИНКА / СКОРО БУДЕТ». The drawn clutch and hydraulic schematics are gone. The РР-300 picture test is now OFF by default (`?rr300pic=1` turns it on).
- Type: every font-size under 15 px raised (10→12, 11→13, 12→14, 13→15, 14→15); header strip 14 px, brand 20 px, nav 16.5 px / 650, list button 16 px; burger menu now from 1240 px.
- Phone (iPhone Safari = WebKit, 390/375/360): compact header (no sub-line, short strip), card pictures 190 px high, 44 px touch targets for crumbs, links and small buttons, tiles grid `minmax(0,1fr)`, parts tables scroll inside their own box (a stray absolutely positioned cell was widening the page), node grid `min-width: 0`.
Checks: `node qa/test-c-r11.cjs`, `node qa/test-c-r11-catalog.cjs`, axe 0 violations on 7 pages light+dark, sweep of 10 pages x 10 widths (1920 to 360) in Chromium and WebKit: no horizontal overflow, no page errors.
Rollback: `git rm -r c-r11` or `git checkout before-c-r11 -- .`

## 2026-10-29 · C revision 12 (`c-r12/`), parts instead of a gearbox box

Start: copy of `c-r11/` (tag `before-c-r12`). Dmitry: the previous placeholder drawing read as «чемодан с ручкой». The one placeholder picture is now loose machine parts as line art on the blueprint grid: two meshing gears (one with lightening holes), a ball bearing, a toothed friction disc, a splined shaft with a nut, three bolts, and the large «КАРТИНКА СКОРО БУДЕТ» between them. Same picture everywhere (cards, tiles, node pages). Generic shapes. Changed: `soonArt` and the gear path helper in `c-r12/app.js`, a few rules at the end of `c-r12/style.css`.
Checks: `node qa/test-c-r12.cjs`, `node qa/test-c-r12-catalog.cjs`, axe, overflow sweep.
Rollback: `git rm -r c-r12` or `git checkout before-c-r12 -- .`

## 2026-10-29 · C revision 13 (`c-r13/`), real drawings for 3Д6 and 3Д12

Start: copy of `c-r12/` (tag `before-c-r13`). Dmitry: the two books are public operating documents supplied with the equipment, so they can be used.
- 3Д6 page: longitudinal section of the reverse gear (book fig. 11, 27 legend positions) and the friction clutch mechanism (fig. 14, 18 positions) in place of «Картинка скоро будет». 3Д12 page: longitudinal section (Д12 РЭ fig. 70, 29 positions). Crops of the native 1-bit scans, webp 1130-1300 px, in `c-r13/img/`. Legends transcribed by hand from the page images; positions open in a «Позиции на чертеже» list. The group tiles keep the one coming-soon picture; the «Все детали» tile shows the section.
- «Характеристики»: added type (non-coaxial, two-disc friction clutch, single-stage spur reducer), max propeller thrust (3Д6 2500 кгс, 3Д12 35 кН / 3500 кгс), flange connection; 3Д12 forward ratio now lists 1:1,33 (ordered), both ratios marked «оговаривается при заказе». The reverse ratios (2,96 and 2,18) were already in the specs.
- Parts table fits its box at 1301 px and wider (cell padding 6 px); was 28 px too wide since r11.
- Not applied: the clutch figure is not put on the «Муфта сцепления МС» card (whether it is the same clutch as СБ1226-00-2 is unconfirmed). No source notes on the pages (client rule); sources: 3Д6 book (Vershinina, Trumul, 1972) pp. 29 and 33, Д12 РЭ p. 104.
Checks: `node qa/test-c-r13.cjs`, `-catalog.cjs`, `-gears.cjs` (Chromium + WebKit), axe 0 violations on 3 pages, 10-page x 10-width sweep without overflow or errors.
Rollback: `git rm -r c-r13` or `git checkout before-c-r13 -- .`

## 2026-10-29 · C revision 14 (`c-r14/`), engineering accents

Start: copy of `c-r13/` (tag `before-c-r14`). One enhanced version, structure and content unchanged (the brief asked for 3-5 concepts in one paragraph and one enhanced version in the next; the later, stricter instruction was followed).
- Hero: the РР-300 section drawing from the manual, inverted and faded to 9 percent behind the headline (masked toward the photo), plus a drafting centre line, scale ticks and a registration mark below the buttons. Real asset: `assets/rr300-section-2400.webp`. Derived: `c-r14/img/draft-marks.svg`.
- Model range: the РР-300 front view (flange, bolt circle) as a large cropped accent at the top right of the section, 14 percent, multiply, fading out under the first card. Real asset: `assets/rr300-front-1200.webp`.
- Services: unchanged (propeller and reducer blueprint already approved).
- Documentation page header: the РР-300 section at the right of the header band, 20 percent. Spare parts landing header: a derived gear train (two meshing gears, pitch circles, centre lines, dimension lines without numbers) `c-r14/img/gear-train-dark.svg` (a white twin `gear-train-light.svg` is ready for dark areas).
- Headers `art-doc` and `art-gear` are 176 px minimum height so the drawings read; `head1()` takes an optional class. Phones: accents shrink and fade, no overflow.
Checks: `node qa/test-c-r14.cjs`, `-catalog.cjs`, `-gears.cjs`, axe 0 violations on 4 pages, 10-page x 10-width sweep in Chromium and WebKit.
Rollback: `git rm -r c-r14` or `git checkout before-c-r14 -- .`

## 2026-10-29 · C revision 15 (`c-r15/`), bolder engineering accents

Start: copy of `c-r14/` (tag `before-c-r15`). Dmitry: the hero is right and stays; the flange at the model range was too modest.
- Model range: the flange is replaced by one huge gear (derived `img/gear-giant.svg`: 40 teeth with chamfer line, rim, eight lightening holes, hub with keyway, bolt circle, pitch circle, centre lines, dimension line without numbers), 940 px, 32 percent, entering from the top right; section top padding 104 px.
- Certificate: the same gear again at the lower left, rotated 9 degrees, 20 percent.
- Footer (contacts and requisites): a propeller blueprint (derived `img/propeller.svg`: four blades with pitch lines, hub, tip and 0,7R circles, centre lines, dimension line) bleeding off the lower right, 20 percent.
- Spare parts landing header: the real 3Д6 reverse gear section (`img/3d6-razrez.webp`) instead of the gear train.
- Depth: layered soft shadow and a top highlight on model cards, certificate and tiles.
- Unchanged: hero (r14), services, documentation header.
Checks: `node qa/test-c-r15.cjs`, `-catalog.cjs`, `-gears.cjs`, axe 0 violations on 4 pages, 10-page x 10-width sweep (Chromium and WebKit) without overflow or errors.
Rollback: `git rm -r c-r15` or `git checkout before-c-r15 -- .`

## 2026-10-29 · C revision 16 (`c-r16/`), manuals in the documentation archive

Start: copy of `c-r15/` (tag `before-c-r16`). Dmitry: the books are public operating documents supplied with the equipment; publish them.
- «Техническая документация» → «Руководства по эксплуатации»: two new rows with PDF files copied to `assets/`: `3d6-7d6-sudovye-dizeli-1972.pdf` (88 scanned pages, 21,2 MB; «Реверс-редуктор» opens at PDF page 25) and `d12-rukovodstvo-po-ekspluatacii.pdf` (235 scanned pages, 11,6 MB; «Реверс-редуктор» opens at page 103). Product tags 3Д6 and 3Д12.
- Under the section drawings on the 3Д6 and 3Д12 pages: link «Чертёж в руководстве (PDF)» to the figure page (3Д6 book PDF p.28, Д12 РЭ p.104).
- Not added: the 3-page «Сборка разборка редуктора РР-300» (97 percent the same text as РР-300.РЭ, with typing errors) and the catalog СКО (industry catalog, none of our products). Both are in Downloads.
- The Д12 file has a third-party library stamp on its first page (kachegaroff-line.ru). Both PDFs are scans without a text layer, so no text search inside them.
Checks: `node qa/test-c-r16-docs.cjs` (both rows present, every PDF link answers 200), plus the r16 regression, catalog and gears tests; axe 0 violations; 10-page x 10-width sweep without overflow.
Rollback: `git rm -r c-r16` or `git checkout before-c-r16 -- .` (the two PDFs in `assets/` stay; delete them separately if needed).
