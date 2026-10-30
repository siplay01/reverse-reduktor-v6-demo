# Change log, v6-demo

Every revision lives in its own folder; older folders are never edited. Git history (local repo in this folder) records each step.

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
