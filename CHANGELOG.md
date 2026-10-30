# Change log, v6-demo

Every revision lives in its own folder; older folders are never edited. Git history (local repo in this folder) records each step.

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
