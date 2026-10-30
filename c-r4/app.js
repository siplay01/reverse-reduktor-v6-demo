// Design C engine: one-page home (hero, model cards, services, certificate, ordering) and a parts catalog in the
// usual auto-parts structure: model switch, node select, global search, drawing beside the specification,
// variant (исполнение) selector with per-variant quantities, request list (mailto on a click only).
(() => {
  const D = window.RR, { groupsOf, schematic } = window.RRSchema;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const norm = (s) => String(s).toLowerCase().replace(/[\s\-–.]/g, "").replace(/ё/g, "е");
  const sku = (s) => `<span class="sku" translate="no">${String(s).split(" ").map((t) => `<span class="nw">${esc(t)}</span>`).join(" ")}</span>`;
  const model = (slug) => D.models.find((m) => m.slug === slug);
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const rr300 = D.models.find((m) => m.id === "rr300");
  const SECTIONS = ["produkciya", "uslugi", "dokumenty", "svidetelstvo", "kontakty"];

  // ---------- request list ----------
  const KEY = "rr-demo-cart-c";
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY)) || []; } catch { cart = []; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch {} renderCart(); };
  function add(des, name, where, q = 1) {
    const it = cart.find((c) => c.des === des && c.where === where);
    if (it) it.q += q; else cart.push({ des, name, where, q });
    save(); toast(`${des}: ${q} шт. в списке запроса`);
  }
  const cartText = () => cart.map((c, i) => `${i + 1}. ${c.des} ${c.name} (${c.where}), ${c.q} шт.`).join("\n");
  function renderCart() {
    const n = cart.reduce((s, c) => s + c.q, 0);
    $$("[data-cart-count]").forEach((el) => { el.textContent = n; });
    $("#cart-empty").hidden = cart.length > 0;
    $$("#cart [data-need-items]").forEach((b) => { b.disabled = !cart.length; });
    $("#cart-items").innerHTML = cart.map((c, i) => `<li><div>${sku(c.des)}<span>${esc(c.name)}</span><small>${esc(c.where)}</small></div>` +
      `<label class="sr" for="cq${i}">Количество, ${esc(c.des)}</label><input id="cq${i}" type="number" min="1" inputmode="numeric" value="${c.q}" data-q="${i}">` +
      `<button type="button" class="cart-x" data-x="${i}" aria-label="Убрать ${esc(c.des)}">×</button></li>`).join("");
  }
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 2400);
  }

  // ---------- home: model cards ----------
  const PIC = { rr300: [D.photos.hero900, 900, 675, "Реверс-редукторы РР-300 в цехе"], rr238: [D.photos.rr238, 1398, 1048, "Реверс-редукторы РР-238"], "3d12": [D.photos["3d12"], 472, 710, "Реверс-редуктор 3Д12"], "3d6": [D.photos["3d6"], 548, 921, "Реверс-редуктор 3Д6"] };
  function specTable(m) {
    const rows = m.specs.map(([l, v]) => `<tr><th scope="row">${esc(l)}</th><td>${esc(v)}</td></tr>`).join("");
    const vars = m.variants.length ? `<table class="vtab"><caption>Исполнения</caption><thead><tr><th scope="col">Исполнение</th><th scope="col">Вращение</th><th scope="col">л.с.</th><th scope="col">Вперёд</th><th scope="col">Назад</th><th scope="col">Муфта</th></tr></thead><tbody>` +
      m.variants.map(([c, rot, hp, f, r, fi]) => `<tr><td>${sku(m.designation + (c === "-" ? "" : c))}</td><td>${rot}</td><td>${hp}</td><td>${f}</td><td>${r}</td><td>${fi}-пальцевая</td></tr>`).join("") + `</tbody></table>` : "";
    return `<table class="stab"><tbody>${rows}</tbody></table>${vars}`;
  }
  // Placeholder where a photo or factory drawing will appear later (common shop pattern: neutral panel, soft product
  // silhouette, faint «СКОРО» watermark, short label). The silhouette is a generic reverse gearbox, not a real unit.
  function soonArt(label) {
    return `<svg class="ph-art" viewBox="0 0 600 400" role="img" aria-label="${esc(label)}">
      <rect width="600" height="400" class="ph-bg"/>
      <g class="ph-sil">
        <rect x="150" y="96" width="210" height="22" rx="4"/>
        <path d="M140 122h250v178H150a10 10 0 0 1-10-10z"/>
        <rect x="160" y="300" width="230" height="16" rx="3"/>
        <circle cx="415" cy="208" r="104"/>
        <circle cx="232" cy="88" r="12" class="ph-ring"/>
      </g>
      <circle cx="415" cy="208" r="74" class="ph-in"/>
      <circle cx="415" cy="208" r="24" class="ph-hub"/>
      <g class="ph-bolts">${Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return `<circle cx="${(415 + 89 * Math.cos(a)).toFixed(1)}" cy="${(208 + 89 * Math.sin(a)).toFixed(1)}" r="3.5"/>`; }).join("")}</g>
      <text x="300" y="232" class="ph-wm" transform="rotate(-14 300 210)">СКОРО</text>
      <g class="ph-pill"><rect x="170" y="340" width="260" height="36" rx="18"/>
        <path d="M198 351h6l2-3h8l2 3h6v14h-24z M210 352a5 5 0 1 0 0.01 0" class="ph-cam"/>
        <text x="312" y="363">${esc(label)}</text></g>
    </svg>`;
  }

  // «Наша продукция» per Dmitry 2026-10-29: РР-300, 3Д6, 3Д12, муфта сцепления МС, гидравлический NEW (в разработке)
  const PRODUCT_IDS = ["rr300", "rr238", "3d6", "3d12"]; // r4: РР-238 back (Dmitry: it was missing)
  const extraCards = () => `
      <article class="mcard" id="model-mufta-ms">
        <a class="mcard-pic is-soon" href="#katalog/mufta-ms" tabindex="-1" aria-hidden="true">${soonArt("Фото скоро появится")}</a>
        <div class="mcard-body">
          <p class="mcard-kind">Муфта сцепления</p>
          <h3 class="mcard-h"><a href="#katalog/mufta-ms">Муфта сцепления МС</a></h3>
          <p class="mcard-app">Гидравлическая ${sku("СБ525-01-14")}, механическая ${sku("СБ1226-00-2")}.</p>
          <p class="mcard-btns"><a class="btn btn-white btn-sm" href="#katalog/mufta-ms">Запчасти муфты сцепления</a></p>
        </div>
      </article>
      <article class="mcard mcard-new" id="model-new">
        <div class="mcard-pic is-soon" aria-hidden="true">${soonArt("Фото скоро появится")}</div>
        <div class="mcard-body">
          <p class="mcard-kind">Новая разработка</p>
          <h3 class="mcard-h">Гидравлический реверс-редуктор <span class="badge">В разработке</span></h3>
          <p class="mcard-app">Новая модель в линейке ООО «Дело». Характеристики и сроки выпуска сообщим по запросу.</p>
          <p class="mcard-btns"><a class="btn btn-line btn-sm" href="#kontakty">Узнать о сроках</a></p>
        </div>
      </article>`;
  function models() {
    return PRODUCT_IDS.map((id) => D.models.find((m) => m.id === id)).map((m) => {
      const n = D.parts[m.id].length, p = PIC[m.id];
      const pic = p ? `<img src="${p[0]}" width="${p[1]}" height="${p[2]}" alt="${esc(p[3])}" loading="lazy">`
        : `<span class="mcard-draw">${schematic(m.id, null)}<span class="mcard-draw-cap">Схема групп деталей</span></span>`;
      return `<article class="mcard" id="model-${m.slug}">
        <a class="mcard-pic${p ? "" : " is-draw"}" href="#katalog/${m.slug}" tabindex="-1" aria-hidden="true">${pic}</a>
        <div class="mcard-body">
          <p class="mcard-kind">${cap(m.kind)} реверс-редуктор</p>
          <h3 class="mcard-h"><a href="#katalog/${m.slug}">${esc(m.name)}</a> ${sku(m.designation)}</h3>
          <p class="mcard-app">${esc((m.specs.find(([l]) => l === "Применяемость") || ["", ""])[1])}</p>
          <dl class="mcard-spec">${m.key.map(([l, v]) => `<div><dt>${esc(l)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
          <p class="mcard-btns"><a class="btn btn-white btn-sm" href="#katalog/${m.slug}">Запчасти ${esc(m.name)} (${n})</a>` +
            `<button type="button" class="btn btn-line btn-sm" aria-expanded="false" aria-controls="more-${m.id}" data-more="${m.id}">Характеристики</button></p>
          <div class="mcard-more" id="more-${m.id}" hidden>${specTable(m)}</div>
        </div>
      </article>`;
    }).join("") + extraCards();
  }

  // ---------- catalog ----------
  let isp = "-"; // selected РР-300 variant code, kept while moving between nodes
  const varLabel = (code) => {
    const v = rr300.variants.find((x) => x[0] === code), full = rr300.designation + (code === "-" ? "" : code);
    return v ? `${full}: ${v[1]} вращение, ${v[2]} л.с., передний ход ${v[3]}, задний ${v[4]}, муфта ${v[5]}-пальцевая` : full;
  };

  function viewsOf(m) {
    if (m.id === "rr300") return [
      { key: "obshchiy", label: "Общий вид, разрез", n: D.section.legend.length, th: D.section.src },
      { key: "vse", label: "Все детали", n: D.parts.rr300.length, th: D.front },
      ...D.nodes.map((nd) => ({ key: `ris-${nd.fig}`, label: nd.title, n: nd.rows.length, th: nd.th, fig: nd.fig })),
    ];
    return [{ key: "vse", label: "Все детали", n: D.parts[m.id].length },
      ...groupsOf(m.id).map(([g, n], i) => ({ key: `gr-${i + 1}`, label: g, n, num: i + 1 }))];
  }

  // «Запасные части» per Dmitry 2026-10-29: four catalogs, РР-238 not listed
  const CATS = [
    { slug: "rr-300", short: "РР-300", title: "Для реверс-редуктора гидравлического РР-300", note: "26 узлов с чертежами и спецификациями" },
    { slug: "rr-238", short: "РР-238", title: "Для реверс-редуктора гидравлического РР-238", note: `${D.parts.rr238.length} позиции` },
    { slug: "3d6", short: "3Д6", title: "Для реверс-редуктора механического 3Д6", note: `${D.parts["3d6"].length} позиций по группам` },
    { slug: "3d12", short: "3Д12", title: "Для реверс-редуктора механического 3Д12", note: `${D.parts["3d12"].length} позиций по группам` },
    { slug: "mufta-ms", short: "Муфта МС", title: "Для муфты сцепления", note: "гидравлическая СБ525-01-14, механическая СБ1226-00-2" },
  ];
  const CAT_MODELS = ["rr300", "rr238", "3d6", "3d12"];
  function bar(m, key) {
    const vs = m ? viewsOf(m) : [], cur = m ? m.slug : "mufta-ms";
    return `<div class="cat-bar" role="search">
      <div class="seg" role="group" aria-label="Каталог">${CATS.map((c) => `<a href="#katalog/${c.slug}"${c.slug === cur ? ' aria-current="true"' : ""}>${esc(c.short)}</a>`).join("")}</div>
      ${m ? `<label class="fld"><span>${m.id === "rr300" ? "Узел каталога" : "Группа деталей"}</span>
        <select data-jump="${m.slug}"><option value="">${key ? "Все узлы" : "Выберите…"}</option>${vs.map((v) => `<option value="${v.key}"${v.key === key ? " selected" : ""}>${v.fig ? "Рис. " + v.fig + ". " : ""}${esc(v.label)} (${v.n})</option>`).join("")}</select></label>` : `<span></span>`}
      <label class="fld fld-q"><span>Поиск во всех каталогах</span><input type="search" placeholder="Обозначение или название" autocomplete="off" data-gq></label>
    </div>
    <div class="gres" data-gres hidden></div>`;
  }
  const crumbs = (items) => `<nav class="crumbs" aria-label="Путь"><a href="#">Главная</a>${items.map(([t, h]) => `<span aria-hidden="true">/</span>${h ? `<a href="${h}">${esc(t)}</a>` : `<span aria-current="page">${esc(t)}</span>`}`).join("")}</nav>`;

  // Revision 3 catalog: compact one-line headers, no repeated labels, price per unit + quantity + «В запрос» last,
  // no mass column, page scroll instead of an inner scroll box, the same layout for models without factory drawings.
  const nf = new Intl.NumberFormat("ru-RU");
  const price = (des) => (D.prices[des] ? `${nf.format(D.prices[des])}&nbsp;₽` : `<span class="muted">по запросу</span>`);
  const head1 = (title, aside = "", sub = "") => `<header class="cat-head compact"><div><h1 tabindex="-1">${title}</h1>${sub ? `<p class="muted">${sub}</p>` : ""}</div>${aside}</header>`;
  const soonFig = (what) => `<figure class="node-fig"><div class="sheet soon">${soonArt("Чертёж скоро появится")}</div><figcaption>${what}: заводской чертёж готовится к публикации. Подбор сейчас: по обозначению в перечне.</figcaption></figure>`;
  const PRICE_NOTE = "Цены за единицу по прайсу 2025 г., уточняйте при заказе.";

  function catsPage() {
    return crumbs([["Запасные части"]]) + head1("Запасные части") +
      `<ul class="cats">${CATS.map((c) => `<li><a href="#katalog/${c.slug}"><b>${esc(c.title)}</b><span>${esc(c.note)}</span></a></li>`).join("")}</ul>`;
  }
  function muftaPage() {
    return crumbs([["Запасные части", "#katalog"], ["Муфта сцепления"]]) + bar(null, "") + head1("Муфта сцепления МС") +
      `<div class="node">${soonFig("Муфты сцепления")}
        <section class="node-spec"><div class="panel-msg"><p>Муфты сцепления: гидравлическая ${sku("СБ525-01-14")} и механическая ${sku("СБ1226-00-2")}.</p>
          <p class="muted">Перечень деталей муфт готовится. Пришлите обозначение детали: подберём по каталогу.</p>
          <p class="mufta-contacts"><a class="btn btn-sm" href="mailto:${D.company.email}?subject=${encodeURIComponent("Запчасти для муфты сцепления")}">Написать на ${D.company.email}</a><a class="btn btn-line btn-sm" href="tel:${D.company.tel}">${D.company.phone}</a></p></div></section>
      </div>`;
  }

  function indexPage(m) {
    const vs = viewsOf(m);
    const tiles = vs.map((v) => `<a class="tile" href="#m/${m.slug}/${v.key}">` +
      (v.th ? `<img src="${v.th}" width="420" height="306" alt="" loading="lazy">` : `<span class="tile-ph">${soonArt("Чертёж скоро появится")}</span>`) +
      `<span class="tile-k">${v.fig ? "Рис. " + v.fig : v.num ? "Группа" : "Перечень"}<span>${v.n}&nbsp;поз.</span></span><span class="tile-t">${esc(v.label)}</span></a>`).join("");
    return crumbs([["Запасные части", "#katalog"], [m.name]]) + bar(m, "") +
      head1(`Запчасти ${esc(m.name)} ${sku(m.designation)}`) + `<div class="tiles">${tiles}</div>`;
  }

  function buyCell(des, name, where, off) {
    return `<td class="c-buy"><span class="buy"><label class="sr" for="q-${esc(des)}">Количество, ${esc(des)}</label>` +
      `<input id="q-${esc(des)}" type="number" min="1" value="1" inputmode="numeric" data-qty${off ? " disabled" : ""}>` +
      `<button type="button" class="btn-add" data-add="${esc(des)}" data-name="${esc(name)}" data-where="${esc(where)}"${off ? " disabled" : ""}>В запрос</button></span></td>`;
  }

  function nodePage(m, nd, compare, q) {
    const i = D.nodes.indexOf(nd), prev = D.nodes[i - 1], next = D.nodes[i + 1];
    if (!nd.vars.includes(isp)) isp = nd.vars[0];
    const vi = nd.vars.indexOf(isp);
    const head = compare
      ? `<th scope="col" class="c-pos">Поз.</th><th scope="col">Обозначение</th><th scope="col">Наименование</th>${nd.vars.map((c) => `<th scope="col" class="c-q">${esc(c)}</th>`).join("")}`
      : `<th scope="col" class="c-pos">Поз.</th><th scope="col">Обозначение</th><th scope="col">Наименование</th><th scope="col" class="c-q">В изделии</th><th scope="col" class="c-p">Цена за ед.</th><th scope="col" class="c-buy">Количество</th>`;
    const rows = nd.rows.map(([pos, des, name], r) => {
      const qa = nd.qa[r], mark = nd.note[r] ? `<sup>${esc(nd.note[r])}</sup>` : "";
      const cells = `<td class="c-pos">${pos}</td><td class="c-des">${sku(des)}${mark}</td><td class="c-name">${esc(name)}</td>`;
      if (compare) return `<tr data-des="${esc(des)}">${cells}${qa.map((x) => `<td class="c-q">${x ?? "—"}</td>`).join("")}</tr>`;
      const qn = qa[vi];
      return `<tr data-des="${esc(des)}"${qn == null ? ' class="na"' : ""}>${cells}<td class="c-q">${qn ?? "—"}</td><td class="c-p">${price(des)}</td>` +
        buyCell(des, name, `РР-300, рис. ${nd.fig}, поз. ${pos}, исп. ${isp}`, qn == null) + `</tr>`;
    }).join("");
    const notes = [...Object.entries(nd.foot).map(([k, t]) => `<li><sup>${esc(k)}</sup> ${esc(t)}</li>`),
      compare ? "" : `<li>«—» в графе «В изделии»: деталь не входит в выбранное исполнение. ${PRICE_NOTE}</li>`].join("");
    const pn = `<nav class="pn" aria-label="Соседние узлы">${prev ? `<a href="#m/rr-300/ris-${prev.fig}">← Рис. ${prev.fig}</a>` : ""}${next ? `<a href="#m/rr-300/ris-${next.fig}">Рис. ${next.fig} →</a>` : ""}</nav>`;
    return crumbs([["Запасные части", "#katalog"], ["РР-300", "#katalog/rr-300"], [`Рис. ${nd.fig}`]]) + bar(m, `ris-${nd.fig}`) +
      head1(`<span class="h-fig">Рис. ${nd.fig}</span> ${esc(nd.title)}`, pn) +
      `<div class="node">
        <figure class="node-fig"><a class="sheet zoom" href="${nd.img2}" target="_blank" rel="noopener"><img src="${nd.img}" srcset="${nd.img} 900w, ${nd.img2} 2000w" sizes="(min-width: 1000px) 34vw, 100vw" width="${nd.w}" height="${nd.h}" alt="Рис. ${nd.fig}. ${esc(nd.title)}"></a>
          <p class="links"><a class="ilink" href="${nd.img2}" target="_blank" rel="noopener"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 8V3h5M17 8V3h-5M3 12v5h5M17 12v5h-5"/></svg>Увеличить чертёж</a>` +
          (nd.spec ? `<a class="ilink" href="${nd.spec}" target="_blank" rel="noopener"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 2h7l4 4v12H5z M12 2v4h4M8 10h5M8 13h5"/></svg>Скан спецификации</a>` : "") + `</p></figure>
        <section class="node-spec" aria-label="Перечень деталей">
          <div class="tools">
            <label class="tool-isp"><span>Исполнение</span><select id="isp" data-isp${compare ? " disabled" : ""}>${nd.vars.map((c) => `<option value="${esc(c)}"${c === isp ? " selected" : ""}>${esc(varLabel(c))}</option>`).join("")}</select></label>
            <label class="tool-f"><span class="sr">Фильтр по перечню</span><input type="search" placeholder="Фильтр по перечню" value="${esc(q)}" data-filter autocomplete="off"></label>
            <button type="button" class="btn-ghost" data-compare aria-pressed="${compare}"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 3h14v14H3zM3 8h14M8 3v14"/></svg>${compare ? "Одно исполнение" : "Все исполнения"}</button>
          </div>
          <div class="tbl"><table class="spec${compare ? " cmp" : ""}"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>
            <p class="none" hidden>В этом узле такой позиции нет.</p></div>
          ${notes ? `<ul class="foot-notes">${notes}</ul>` : ""}
        </section>
      </div>`;
  }

  function overviewPage(m) {
    const s = D.section;
    return crumbs([["Запасные части", "#katalog"], ["РР-300", "#katalog/rr-300"], ["Общий вид"]]) + bar(m, "obshchiy") +
      head1("Общий вид, продольный разрез", "", `Нажмите строку перечня: номера отметятся на разрезе. Детали с ценами: в <a href="#katalog/rr-300">узлах каталога</a>.`) + `
      <div class="node node-wide">
        <figure class="node-fig"><div class="sheet pts"><img src="${s.src}" srcset="${s.src} 1200w, ${s.src2} 2400w" sizes="(min-width: 1000px) 55vw, 100vw" width="${s.w}" height="${s.h}" alt="Продольный разрез реверс-редуктора РР-300 с номерами позиций">` +
          s.callouts.map(([n, x, y]) => `<button type="button" class="pt" data-n="${n}" style="left:${x}%;top:${y}%" tabindex="-1" aria-hidden="true"></button>`).join("") + `</div></figure>
        <section class="node-spec"><div class="tbl"><table class="spec legend"><thead><tr><th scope="col" class="c-pos">Поз.</th><th scope="col">Наименование</th></tr></thead><tbody>` +
          s.legend.map(([nums, name]) => `<tr data-nums="${nums.join(" ")}" tabindex="0"><td class="c-pos nw">${nums.join(", ")}</td><td>${esc(name)}</td></tr>`).join("") +
        `</tbody></table></div></section>
      </div>`;
  }

  function listPage(m, key, q) {
    const vs = viewsOf(m), v = vs.find((x) => x.key === key) || vs[0], g = v.key === "vse" ? null : v.label;
    const list = D.parts[m.id].filter((p) => !g || p[2] === g);
    const fig = m.id === "rr300"
      ? `<figure class="node-fig"><div class="sheet"><img src="${D.front}" width="1200" height="1328" alt="Реверс-редуктор РР-300, вид по руководству по эксплуатации" loading="lazy"></div><figcaption>Подбор по позициям: <a href="#katalog/rr-300">узлы каталога</a>.</figcaption></figure>`
      : soonFig(m.name);
    const rows = list.map(([des, name, grp]) => `<tr data-des="${esc(des)}" data-g="${esc(grp)}"><td class="c-des">${sku(des)}</td><td class="c-name">${esc(name)}</td>${g ? "" : `<td class="c-g">${esc(grp)}</td>`}<td class="c-p">${price(des)}</td>` + buyCell(des, name, m.name) + `</tr>`).join("");
    return crumbs([["Запасные части", "#katalog"], [m.name, `#katalog/${m.slug}`], [v.label]]) + bar(m, v.key) +
      head1(`${esc(m.name)}: ${esc(v.label.toLowerCase())}`, `<span class="h-count">${list.length}&nbsp;поз.</span>`) +
      `<div class="node">${fig}
        <section class="node-spec" aria-label="Перечень деталей">
          <div class="tools"><label class="tool-f"><span class="sr">Фильтр по перечню</span><input type="search" placeholder="Фильтр по перечню" value="${esc(q)}" data-filter autocomplete="off"></label></div>
          <div class="tbl"><table class="spec"><thead><tr><th scope="col">Обозначение</th><th scope="col">Наименование</th>${g ? "" : `<th scope="col" class="c-g">Группа</th>`}<th scope="col" class="c-p">Цена за ед.</th><th scope="col" class="c-buy">Количество</th></tr></thead><tbody>${rows}</tbody></table>
          <p class="none" hidden>Ничего не найдено. Пришлите обозначение: <a href="mailto:${D.company.email}">${D.company.email}</a>.</p></div>
          <ul class="foot-notes"><li>${PRICE_NOTE}</li></ul>
        </section>
      </div>`;
  }

  // global search over every catalog; hits open the node where the part sits
  const INDEX = [];
  D.models.filter((m) => CAT_MODELS.includes(m.id)).forEach((m) => D.parts[m.id].forEach(([des, name]) => INDEX.push({ m, des, name, k: norm(des + " " + name) })));
  const nodeOf = (des) => { const nd = D.nodes.find((n) => n.rows.some((r) => r[1] === des)); return nd ? `ris-${nd.fig}` : "vse"; };
  function gsearch(box, q) {
    const out = $("[data-gres]", box), nq = norm(q);
    if (nq.length < 2) { out.hidden = true; out.innerHTML = ""; return; }
    const hits = INDEX.filter((x) => x.k.includes(nq));
    out.hidden = false;
    out.innerHTML = hits.length
      ? `<p class="gres-n">Найдено: ${hits.length}${hits.length > 40 ? ", показаны первые 40" : ""}</p><ul>` + hits.slice(0, 40).map((x) =>
        `<li><a href="#m/${x.m.slug}/${x.m.id === "rr300" ? nodeOf(x.des) : "vse"}?q=${encodeURIComponent(x.des)}">${sku(x.des)}<span>${esc(x.name)}</span><b>${esc(x.m.name)}</b></a></li>`).join("") + `</ul>`
      : `<p class="gres-n">По запросу «${esc(q)}» ничего нет. Пришлите обозначение на <a href="mailto:${D.company.email}">${D.company.email}</a> или позвоните ${D.company.phone}.</p>`;
  }

  function filterRows(box, q) {
    const nq = norm(q); let shown = 0;
    $$("table.spec tbody tr", box).forEach((tr) => { const hit = !nq || norm(tr.textContent).includes(nq); tr.hidden = !hit; shown += hit; });
    const none = $(".none", box); if (none) none.hidden = shown > 0;
  }

  let compare = false;
  // archive: scanned pages of the РР-300 parts catalog
  function scansPage() {
    return crumbs([["Техническая документация", "#dokumenty"], ["Каталог деталей РР-300"]]) +
      `<header class="cat-head compact"><h1 tabindex="-1">Каталог деталей РР-300: сканы страниц</h1><p class="muted">${D.scans.length} страниц. Нажмите страницу, чтобы открыть её в полном размере.</p></header>
      <ul class="scans">${D.scans.map((x) => `<li><a href="${x.f}" target="_blank" rel="noopener"><img src="${x.t}" width="420" height="305" alt="Страница ${x.n}: ${esc(x.title)}" loading="lazy"><span><b>${x.n}</b> ${esc(x.title)}</span></a></li>`).join("")}</ul>`;
  }

  function renderCat(path, q) {
    const box = $("[data-cat]"), [, slug, key] = path;
    const m = model(slug) || rr300;
    let html;
    if (path[0] === "arhiv") html = scansPage();
    else if (path[0] === "katalog" && !slug) html = catsPage();
    else if (slug === "mufta-ms") html = muftaPage();
    else if (path[0] === "katalog") html = indexPage(m);
    else if (key === "obshchiy" && m.id === "rr300") html = overviewPage(m);
    else if (key && key.startsWith("ris-") && m.id === "rr300") html = nodePage(m, D.nodes.find((n) => `ris-${n.fig}` === key) || D.nodes[0], compare, q);
    else html = listPage(m, key, q);
    box.innerHTML = html;
    if (q) { filterRows(box, q); const hit = $(`tr[data-des="${CSS.escape(q)}"]`, box); if (hit) { hit.classList.add("hit"); } }
    document.title = `${$("h1", box).textContent} · каталог запчастей · Реверс-редуктор`;
  }

  // ---------- routing ----------
  function route() {
    const h = decodeURIComponent(location.hash.slice(1)), [p, qs] = h.split("?");
    const q = new URLSearchParams(qs || "").get("q") || "", path = p.split("/");
    const isCat = path[0] === "katalog" || path[0] === "m" || path[0] === "arhiv";
    $("[data-view=home]").hidden = isCat; $("[data-view=cat]").hidden = !isCat;
    $$("[data-nav]").forEach((a) => a.toggleAttribute("aria-current", a.dataset.nav === (path[0] === "arhiv" ? "dokumenty" : isCat ? "katalog" : path[0])));
    $(".burger").open = false;
    if (isCat) {
      const sameKey = route.last === p;
      renderCat(path, q);
      if (!sameKey) { window.scrollTo(0, 0); const h1 = $("[data-cat] h1"); h1 && h1.focus?.({ preventScroll: true }); }
      route.last = p;
    } else {
      document.title = "Реверс-редуктор · ООО «Дело» · судовые реверс-редукторы";
      route.last = null;
      const el = SECTIONS.includes(path[0]) && document.getElementById(path[0]);
      requestAnimationFrame(() => (el ? el.scrollIntoView({ block: "start" }) : window.scrollTo(0, 0)));
    }
  }

  // ---------- events ----------
  $("[data-models]").innerHTML = models();
  document.addEventListener("click", (e) => {
    const t = e.target;
    const more = t.closest("[data-more]");
    if (more) { const box = document.getElementById(`more-${more.dataset.more}`); box.hidden = !box.hidden; more.setAttribute("aria-expanded", !box.hidden); }
    const a = t.closest("[data-add]");
    if (a && !a.disabled) { const qi = a.parentElement.querySelector("[data-qty]"); add(a.dataset.add, a.dataset.name, a.dataset.where, Math.max(1, parseInt(qi?.value, 10) || 1)); }
    if (t.closest("[data-compare]")) { compare = !compare; route.last = null; const y = scrollY; route(); scrollTo(0, y); }
    if (t.closest("[data-cart-open]")) { renderCart(); $("#cart").showModal(); }
    if (t.closest("[data-cart-close]") || t.id === "cart") $("#cart").close();
    const x = t.closest("[data-x]"); if (x) { cart.splice(+x.dataset.x, 1); save(); }
    if (t.closest("[data-cart-clear]")) { cart = []; save(); }
    if (t.closest("[data-cart-copy]")) navigator.clipboard.writeText(cartText()).then(() => toast("Список скопирован"), () => toast("Не удалось скопировать: выделите список вручную"));
    if (t.closest("[data-cart-mail]")) {
      const body = `Здравствуйте!\n\nПрошу сообщить наличие, цену и срок поставки:\n\n${cartText()}\n\nОрганизация:\nКонтактное лицо:\nТелефон:\n`;
      location.href = `mailto:${D.company.email}?subject=${encodeURIComponent("Запрос запчастей, реверс-редукторы")}&body=${encodeURIComponent(body)}`;
    }
    if (t.closest("[data-copy-req]")) {
      const txt = $$("#req div").map((d) => `${d.querySelector("dt").textContent}: ${d.querySelector("dd").textContent}`).join("\n");
      navigator.clipboard.writeText(txt).then(() => toast("Реквизиты скопированы"), () => toast("Не удалось скопировать: выделите реквизиты вручную"));
    }
    // overview: legend row or callout marks the matching positions
    const tr = t.closest("tr[data-nums]"), pt = t.closest(".pt");
    if (tr || pt) {
      const box = $("[data-cat]");
      let nums = tr ? tr.dataset.nums.split(" ").map(Number) : [+pt.dataset.n];
      if (pt) { const row = $$("tr[data-nums]", box).find((r) => r.dataset.nums.split(" ").map(Number).includes(+pt.dataset.n)); if (row) { nums = row.dataset.nums.split(" ").map(Number); row.scrollIntoView({ block: "nearest" }); } }
      $$(".pt", box).forEach((p) => p.classList.toggle("on", nums.includes(+p.dataset.n)));
      $$("tr[data-nums]", box).forEach((r) => r.classList.toggle("on", r.dataset.nums.split(" ").map(Number).some((n) => nums.includes(n))));
    }
    const z = t.closest(".pk-zone");
    if (z && $("[data-view=cat]").hidden === false) {
      const m = model(location.hash.split("/")[1]) || D.models[0], v = viewsOf(m).find((x) => x.label === z.dataset.g);
      if (v) location.hash = `m/${m.slug}/${v.key}`;
    }
  });
  document.addEventListener("keydown", (e) => {
    const tr = e.target.closest?.("tr[data-nums]"); if (tr && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); tr.click(); }
    if (e.key === "Escape" && e.target.matches?.("[data-gq]")) { e.target.value = ""; gsearch($("[data-cat]"), ""); }
  });
  document.addEventListener("input", (e) => {
    const t = e.target;
    if (t.matches("[data-gq]")) gsearch($("[data-cat]"), t.value);
    if (t.matches("[data-filter]")) filterRows($("[data-cat]"), t.value);
  });
  document.addEventListener("change", (e) => {
    const t = e.target;
    if (t.matches("[data-jump]")) location.hash = t.value ? `m/${t.dataset.jump}/${t.value}` : `katalog/${t.dataset.jump}`;
    if (t.matches("[data-isp]")) { isp = t.value; route.last = null; const y = scrollY; route(); scrollTo(0, y); $("[data-isp]").focus(); }
    if (t.matches("[data-q]")) { cart[+t.dataset.q].q = Math.max(1, parseInt(t.value, 10) || 1); save(); }
  });
  document.addEventListener("mouseover", (e) => {
    const tr = e.target.closest?.("tr[data-g]");
    $$(".pk-zone").forEach((z) => z.classList.toggle("hov", !!tr && z.dataset.g === tr.dataset.g));
  });

  renderCart();
  window.addEventListener("hashchange", route);
  route();
})();
