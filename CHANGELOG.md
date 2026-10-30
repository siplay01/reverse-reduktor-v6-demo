# Change log, v6-demo

Every revision lives in its own folder; older folders are never edited. Git history (local repo in this folder) records each step.

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
