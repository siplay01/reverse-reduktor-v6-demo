// Design C engine: one-page home (hero, model cards, services, certificate, ordering) and a parts catalog in the
// usual auto-parts structure: model switch, node select, global search, drawing beside the specification,
// variant (исполнение) selector with per-variant quantities, request list (mailto on a click only).
(() => {
  const D = window.RR, { GROUPS, groupsOf, schematic } = window.RRSchema;
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
  // Soft line-art where a photo or factory drawing will appear later (Dmitry 2026-10-29: pretty, light, same picture
  // everywhere in a group). kind "line" = marine drive line (engine, clutch, reverse gear, shafting), used on the
  // product cards; kind "gear" = reverse gearbox in section, used wherever spare parts lack a drawing or photo.
  // Both are generic schematics, not drawings of any real unit; the label is read aloud and shown as a faint caption.
  const SOON_ART = {
    line: `<path class="sa-axis" d="M20 170H585"/>
      <rect x="40" y="100" width="160" height="124" rx="4"/><path d="M58 100V80h28v20M98 100V80h28v20M138 100V80h28v20M178 100V84h12v16"/>
      <path d="M54 138h132M54 158h132M54 178h132" class="sa-thin"/>
      <rect x="200" y="116" width="34" height="108" rx="3"/><path d="M206 128v84M228 128v84" class="sa-thin"/>
      <rect x="234" y="106" width="128" height="122" rx="6"/>
      <circle cx="278" cy="154" r="26" class="sa-dash"/><circle cx="320" cy="188" r="30" class="sa-dash"/><circle cx="278" cy="154" r="6"/><circle cx="320" cy="188" r="6"/>
      <path d="M362 170h178"/><rect x="430" y="160" width="22" height="20"/>
      <path d="M548 170c10-34 26-44 30-38s-14 30-30 38c22-4 34 6 28 12s-24-4-28-12c-4 22-18 36-24 30s4-24 24-30z"/>`,
    gear: `<path class="sa-axis" d="M30 170H570"/>
      <rect x="150" y="76" width="300" height="190" rx="10"/><path d="M240 76V56h30v20M330 76V60h20v16"/>
      <rect x="130" y="266" width="340" height="14" rx="3"/>
      <circle cx="270" cy="170" r="70" class="sa-dash"/><circle cx="270" cy="170" r="22"/><circle cx="270" cy="170" r="8"/>
      <circle cx="390" cy="170" r="48" class="sa-dash"/><circle cx="390" cy="170" r="16"/><circle cx="390" cy="170" r="6"/>
      <path d="M60 170h90M450 170h92"/><rect x="48" y="150" width="14" height="40" rx="2"/><rect x="540" y="150" width="14" height="40" rx="2"/>
      <path d="M175 96h40M175 244h40M345 96h50M345 244h50" class="sa-thin"/>`
  };
  function soonArt(label, kind = "gear") {
    return `<svg class="ph-art" viewBox="0 0 600 340" role="img" aria-label="${esc(label)}"><g class="sa-line">${SOON_ART[kind]}</g><text class="sa-cap" x="300" y="322">${esc(label)}</text></svg>`;
  }

  // «Наша продукция» per Dmitry 2026-10-29: РР-300, 3Д6, 3Д12, муфта сцепления МС, гидравлический NEW (в разработке)
  const PRODUCT_IDS = ["rr300", "rr238", "3d6", "3d12"]; // r4: РР-238 back (Dmitry: it was missing)
  const extraCards = () => `
      <article class="mcard" id="model-mufta-ms">
        <a class="mcard-pic is-soon" href="#katalog/mufta-ms" tabindex="-1" aria-hidden="true">${soonArt("Фото скоро появится", "line")}</a>
        <div class="mcard-body">
          <p class="mcard-kind">Муфта сцепления</p>
          <h3 class="mcard-h"><a href="#katalog/mufta-ms">Муфта сцепления МС</a></h3>
          <p class="mcard-app">Гидравлическая ${sku("СБ525-01-14")}, механическая ${sku("СБ1226-00-2")}.</p>
          <p class="mcard-btns"><a class="btn btn-white btn-sm" href="#katalog/mufta-ms">Запчасти муфты сцепления</a></p>
        </div>
      </article>
      <article class="mcard mcard-new" id="model-new">
        <div class="mcard-pic is-soon" aria-hidden="true">${soonArt("Фото скоро появится", "line")}</div>
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

  // r5: one parts catalog for all gearboxes (D.catalog, one record per designation). Filter state lives in the URL:
  // #katalog[/<model slug>][?g=<group>&q=<text>]. Gearbox cards open it pre-filtered; old #m/<model>/vse|gr-N redirect here.
  const FILTER_IDS = ["rr300", "rr238", "3d6", "3d12"];
  const byId = (id) => D.models.find((m) => m.id === id);
  const catHash = (st) => {
    const u = new URLSearchParams(); if (st.g) u.set("g", st.g); if (st.q) u.set("q", st.q);
    const s = u.toString(); return "#katalog/" + (st.m ? byId(st.m).slug + "/spisok" : "vse") + (s ? "?" + s : "");
  };
  const nodeSelect = (key) => `<label class="fld"><span>Чертёж узла РР-300</span><select data-jump="rr-300"><option value="">Выберите…</option>${viewsOf(rr300).filter((v) => v.key !== "vse").map((v) => `<option value="${v.key}"${v.key === key ? " selected" : ""}>${v.fig ? "Рис. " + v.fig + ". " : ""}${esc(v.label)}</option>`).join("")}</select></label>`;
  // mode "list": filters act in place; "page": drawing pages, the search jumps to the list; "none": the clutch page
  function bar(st, mode, key) {
    const pool = D.catalog.filter((p) => !st.m || p.models.includes(st.m));
    const groups = GROUPS.map((g) => [g, pool.filter((p) => p.type === g).length]).filter(([, n]) => n);
    const active = mode === "list" && (st.m || st.g || st.q);
    return `<div class="cat-bar cat-bar5" role="search">
      <div class="fld"><span>По редуктору</span><div class="seg" role="group" aria-label="По редуктору">` +
        `<a href="${mode === "list" ? "#katalog/vse" : "#katalog"}"${mode === "list" && !st.m ? ' aria-current="true"' : ""}>Все редукторы</a>` +
        FILTER_IDS.map((id) => `<a href="${mode === "list" ? catHash({ m: id }) : "#katalog/" + byId(id).slug}"${st.m === id ? ' aria-current="true"' : ""}>${esc(byId(id).name)}</a>`).join("") + `</div></div>
      ${mode === "list" ? `<label class="fld"><span>По группе деталей</span><select data-fg><option value="">Все группы (${pool.length})</option>${groups.map(([g, n]) => `<option value="${esc(g)}"${g === st.g ? " selected" : ""}>${esc(g)} (${n})</option>`).join("")}</select></label>`
        : st.m === "rr300" ? nodeSelect(key) : `<span></span>`}
      <label class="fld"><span>Поиск</span><input type="search" placeholder="Обозначение или название" value="${esc(mode === "list" ? st.q || "" : "")}" autocomplete="off" data-fq></label>
      <a class="reset" href="#katalog/vse" data-reset${active ? "" : " hidden"}>Сбросить фильтры</a>
    </div>`;
  }
  const crumbs = (items) => `<nav class="crumbs" aria-label="Путь"><a href="#">Главная</a>${items.map(([t, h]) => `<span aria-hidden="true">/</span>${h ? `<a href="${h}">${esc(t)}</a>` : `<span aria-current="page">${esc(t)}</span>`}`).join("")}</nav>`;

  // Revision 3 catalog: compact one-line headers, no repeated labels, price per unit + quantity + «В запрос» last,
  // no mass column, page scroll instead of an inner scroll box, the same layout for models without factory drawings.
  const nf = new Intl.NumberFormat("ru-RU");
  const price = (des) => (D.prices[des] ? `${nf.format(D.prices[des])}&nbsp;₽` : `<span class="muted">по запросу</span>`);
  const head1 = (title, aside = "", sub = "") => `<header class="cat-head compact"><div><h1 tabindex="-1">${title}</h1>${sub ? `<p class="muted">${sub}</p>` : ""}</div>${aside}</header>`;
  const soonFig = (what) => `<figure class="node-fig"><div class="sheet soon">${soonArt("Чертёж скоро появится")}</div><figcaption>${what}: заводской чертёж готовится к публикации. Подбор сейчас: по обозначению в перечне.</figcaption></figure>`;
  const PRICE_NOTE = "Цены за единицу по прайсу 2025 г., уточняйте при заказе.";

  // r6: restored from r4 (Dmitry: the catalog page and the pictures had to stay)
  const CATS = [
    { slug: "rr-300", short: "РР-300", title: "Для реверс-редуктора гидравлического РР-300", note: "26 узлов с чертежами и спецификациями" },
    { slug: "rr-238", short: "РР-238", title: "Для реверс-редуктора гидравлического РР-238", note: `${D.parts.rr238.length} позиции` },
    { slug: "3d6", short: "3Д6", title: "Для реверс-редуктора механического 3Д6", note: `${D.parts["3d6"].length} позиций по группам` },
    { slug: "3d12", short: "3Д12", title: "Для реверс-редуктора механического 3Д12", note: `${D.parts["3d12"].length} позиций по группам` },
    { slug: "mufta-ms", short: "Муфта МС", title: "Для муфты сцепления", note: "гидравлическая СБ525-01-14, механическая СБ1226-00-2" },
  ];
  // r7: the catalog page shows compact versions of the home-page model cards (same concept, smaller)
  function catsPage() {
    const card = (c) => {
      const m = model(c.slug), p = m && PIC[m.id];
      const pic = p ? `<img src="${p[0]}" width="${p[1]}" height="${p[2]}" alt="${esc(p[3])}" loading="lazy">` : soonArt("Фото скоро появится");
      const kind = m ? `${cap(m.kind)} реверс-редуктор` : "Муфта сцепления";
      const title = m ? `${esc(m.name)} ${sku(m.designation)}` : "Муфта сцепления МС";
      return `<article class="mcard mcard-sm">
        <a class="mcard-pic${p ? "" : " is-soon"}" href="#katalog/${c.slug}" tabindex="-1" aria-hidden="true">${pic}</a>
        <div class="mcard-body"><p class="mcard-kind">${kind}</p><h2 class="mcard-h"><a href="#katalog/${c.slug}">${title}</a></h2>
          <p class="mcard-app">${esc(c.note)}</p><p class="mcard-btns"><a class="btn btn-white btn-sm" href="#katalog/${c.slug}">Каталог запчастей</a></p></div>
      </article>`;
    };
    return crumbs([["Запасные части"]]) + head1("Запасные части", `<a class="all-link" href="#katalog/vse">Все запчасти одним списком (${D.catalog.length})</a>`) +
      `<div class="models-sm">${CATS.map(card).join("")}</div>`;
  }
  function indexPage(m) {
    const vs = viewsOf(m);
    const href = (v) => v.key === "vse" ? catHash({ m: m.id }) : v.key.startsWith("gr-") ? catHash({ m: m.id, g: v.label }) : `#m/${m.slug}/${v.key}`;
    const tiles = vs.map((v) => `<a class="tile" href="${href(v)}">` +
      (v.th ? `<img src="${v.th}" width="420" height="306" alt="" loading="lazy">` : `<span class="tile-ph">${soonArt("Чертёж скоро появится")}</span>`) +
      `<span class="tile-k">${v.fig ? "Рис. " + v.fig : v.num ? "Группа" : "Перечень"}<span>${v.n}&nbsp;поз.</span></span><span class="tile-t">${esc(v.label)}</span></a>`).join("");
    return crumbs([["Запасные части", "#katalog"], [m.name]]) + bar({ m: m.id }, "page") +
      head1(`Запчасти ${esc(m.name)} ${sku(m.designation)}`) + `<div class="tiles">${tiles}</div>`;
  }

  function muftaPage() {
    return crumbs([["Запасные части", "#katalog"], ["Муфта сцепления"]]) + bar({}, "none") + head1("Муфта сцепления МС") +
      `<div class="node">${soonFig("Муфты сцепления")}
        <section class="node-spec"><div class="panel-msg"><p>Муфты сцепления: гидравлическая ${sku("СБ525-01-14")} и механическая ${sku("СБ1226-00-2")}.</p>
          <p class="muted">Перечень деталей муфт готовится. Пришлите обозначение детали: подберём по каталогу.</p>
          <p class="mufta-contacts"><a class="btn btn-sm" href="mailto:${D.company.email}?subject=${encodeURIComponent("Запчасти для муфты сцепления")}">Написать на ${D.company.email}</a><a class="btn btn-line btn-sm" href="tel:${D.company.tel}">${D.company.phone}</a></p></div></section>
      </div>`;
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
    return crumbs([["Запасные части", "#katalog"], ["РР-300", "#katalog/rr-300"], [`Рис. ${nd.fig}`]]) + bar({ m: "rr300" }, "page", `ris-${nd.fig}`) +
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
    return crumbs([["Запасные части", "#katalog"], ["РР-300", "#katalog/rr-300"], ["Общий вид"]]) + bar({ m: "rr300" }, "page", "obshchiy") +
      head1("Общий вид, продольный разрез", "", `Нажмите строку перечня: номера отметятся на разрезе. Детали с ценами: в <a href="#katalog/rr-300">узлах каталога</a>.`) + `
      <div class="node node-wide">
        <figure class="node-fig"><div class="sheet pts"><img src="${s.src}" srcset="${s.src} 1200w, ${s.src2} 2400w" sizes="(min-width: 1000px) 55vw, 100vw" width="${s.w}" height="${s.h}" alt="Продольный разрез реверс-редуктора РР-300 с номерами позиций">` +
          s.callouts.map(([n, x, y]) => `<button type="button" class="pt" data-n="${n}" style="left:${x}%;top:${y}%" tabindex="-1" aria-hidden="true"></button>`).join("") + `</div></figure>
        <section class="node-spec"><div class="tbl"><table class="spec legend"><thead><tr><th scope="col" class="c-pos">Поз.</th><th scope="col">Наименование</th></tr></thead><tbody>` +
          s.legend.map(([nums, name]) => `<tr data-nums="${nums.join(" ")}" tabindex="0"><td class="c-pos nw">${nums.join(", ")}</td><td>${esc(name)}</td></tr>`).join("") +
        `</tbody></table></div></section>
      </div>`;
  }

  // r5: the unified list
  const modelNames = (ids) => ids.map((id) => byId(id).name);
  function applic(p) {
    const chips = p.models.map((id) => `<span class="ap">${esc(byId(id).name)}` +
      (id === "rr300" && p.figs ? ` <span class="ap-figs">${p.figs.slice(0, 3).map((f) => `<a href="#m/rr-300/ris-${f}?hl=${encodeURIComponent(p.des)}">рис.&nbsp;${f}</a>`).join(", ")}${p.figs.length > 3 ? "…" : ""}</span>` : "") + `</span>`).join("");
    const notes = [p.vardep ? "зависит от исполнения" : "", p.models.length > 1 ? "уточните при заказе" : ""].filter(Boolean);
    return chips + (notes.length ? `<span class="ap-note">${notes.join(" · ")}</span>` : "");
  }
  const filtered = (st) => {
    const nq = norm(st.q || "");
    return D.catalog.filter((p) => (!st.m || p.models.includes(st.m)) && (!st.g || p.type === st.g) && (!nq || norm(p.des + " " + p.name).includes(nq)));
  };
  const rowsHtml = (list) => list.map((p) => `<tr data-des="${esc(p.des)}" data-g="${esc(p.type)}"><td class="c-des">${sku(p.des)}</td><td class="c-name">${esc(p.name)}</td>` +
    `<td class="c-ap">${applic(p)}</td><td class="c-g">${esc(p.type)}</td><td class="c-p">${price(p.des)}</td>` + buyCell(p.des, p.name, modelNames(p.models).join(", ")) + `</tr>`).join("");
  const nodesStrip = () => `<details class="nodes5"><summary>Чертежи узлов РР-300 (${D.nodes.length + 1})</summary><div class="tiles">` +
    viewsOf(rr300).filter((v) => v.key !== "vse").map((v) => `<a class="tile" href="#m/rr-300/${v.key}"><img src="${v.th}" width="420" height="306" alt="" loading="lazy"><span class="tile-k">${v.fig ? "Рис. " + v.fig : "Разрез"}<span>${v.n}&nbsp;поз.</span></span><span class="tile-t">${esc(v.label)}</span></a>`).join("") + `</div></details>`;
  function catalogPage(st) {
    const list = filtered(st), m = st.m ? byId(st.m) : null;
    const fig = !m ? "" : m.id === "rr300"
      ? `<figure class="node-fig"><div class="sheet"><img src="${D.front}" width="1200" height="1328" alt="Реверс-редуктор РР-300, вид по руководству по эксплуатации" loading="lazy"></div><figcaption>Подбор по позициям: <a href="#katalog/rr-300">узлы каталога</a>.</figcaption></figure>`
      : soonFig(m.name);
    return crumbs(m ? [["Запасные части", "#katalog"], [m.name, `#katalog/${m.slug}`], [st.g || "Все детали"]] : [["Запасные части", "#katalog"], ["Все запчасти"]]) + bar(st, "list") +
      head1(`${m ? `Запасные части ${esc(m.name)} ${sku(m.designation)}` : "Все запчасти"}`, `<span class="h-count" data-count>${list.length}&nbsp;поз.</span>`) +
      (m ? `<div class="node node6">${fig}` : "") +
      `<section class="node-spec cat-list" aria-label="Перечень деталей"><div class="tbl"><table class="spec spec5"><thead><tr><th scope="col">Обозначение</th><th scope="col">Наименование</th><th scope="col" class="c-ap">Применяемость</th><th scope="col" class="c-g">Группа</th><th scope="col" class="c-p">Цена за ед.</th><th scope="col" class="c-buy">Количество</th></tr></thead><tbody data-rows>${rowsHtml(list)}</tbody></table>
        <p class="none" data-none${list.length ? " hidden" : ""}>Ничего не найдено. Проверьте обозначение или пришлите его: <a href="mailto:${D.company.email}">${D.company.email}</a>, ${D.company.phone}.</p></div>
        <ul class="foot-notes"><li>Применяемость: по каталогу деталей РР-300 (ссылка на рисунок) или по данным прежнего каталога. «Уточните при заказе»: связь с несколькими моделями документально не подтверждена. «Зависит от исполнения»: деталь входит не во все исполнения РР-300.</li><li>${PRICE_NOTE}</li></ul>
      </section>` + (m ? `</div>` : "");
  }
  let cstate = null;
  function refreshList() {
    const box = $("[data-cat]"), list = filtered(cstate);
    $("[data-rows]", box).innerHTML = rowsHtml(list);
    $("[data-count]", box).innerHTML = `${list.length}&nbsp;поз.`;
    $("[data-none]", box).hidden = list.length > 0;
    $("[data-reset]", box).hidden = !(cstate.m || cstate.g || cstate.q);
    history.replaceState(null, "", catHash(cstate));
    route.last = location.hash.slice(1).split("?")[0];
  }

  function filterRows(box, q) {
    const nq = norm(q); let shown = 0;
    $$("table.spec tbody tr", box).forEach((tr) => { const hit = !nq || norm(tr.textContent).includes(nq); tr.hidden = !hit; shown += hit; });
    const none = $(".none", box); if (none) none.hidden = shown > 0;
  }

  let compare = false;
  // r7: technical documentation archive, files grouped by type; each row: document, product, format, action
  const ARCHIVE = [
    ["Руководства по эксплуатации", [
      { t: "Руководство по эксплуатации РР-300.РЭ", p: "РР-300", f: "PDF · 24 с. · 3,6 МБ", a: [["Открыть", D.manual.pdf, 1]] },
    ]],
    ["Каталоги деталей", [
      { t: "Каталог деталей реверс-редуктора РР-300", p: "РР-300", f: `Сканы · ${D.scans.length} стр.`, a: [["Листать", "#arhiv/katalog-rr300"], ["Подбор по каталогу", "#katalog/rr-300"]] },
      { t: "Каталог деталей реверс-редуктора 3Д6", p: "3Д6", soon: 1 },
      { t: "Каталог деталей реверс-редуктора 3Д12", p: "3Д12", soon: 1 },
      { t: "Каталог деталей муфт сцепления", p: "Муфта МС", soon: 1 },
    ]],
    ["Инструкции по ремонту", [
      { t: "Инструкции по ремонту реверс-редукторов", p: "Реверс-редукторы", soon: 1 },
    ]],
  ];
  function archivePage() {
    const row = (d) => `<li${d.soon ? ' class="ar-soon"' : ""}><svg class="ar-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2.5h8l4.5 4.5v14.5H6z M14 2.5V7h4.5"/></svg>` +
      `<span class="ar-t">${esc(d.t)}</span><span class="ar-p">${esc(d.p)}</span><span class="ar-f">${d.soon ? '<span class="badge">В подготовке</span>' : esc(d.f)}</span>` +
      `<span class="ar-a">${(d.a || []).map(([l, h, ext]) => `<a class="btn ${ext ? "btn-line " : ""}btn-sm" href="${h}"${ext ? ' target="_blank" rel="noopener"' : ""}>${l}</a>`).join("")}</span></li>`;
    return crumbs([["Техническая документация"]]) + head1("Техническая документация", "", "Каталоги и руководства. Новые документы добавляются по мере подготовки.") +
      ARCHIVE.map(([g, items]) => `<section class="ar-group"><h2>${esc(g)}</h2><ul class="ar-list">${items.map(row).join("")}</ul></section>`).join("");
  }

  // archive: scanned pages of the РР-300 parts catalog
  function scansPage() {
    return crumbs([["Техническая документация", "#arhiv"], ["Каталог деталей РР-300"]]) +
      `<header class="cat-head compact"><h1 tabindex="-1">Каталог деталей РР-300: сканы страниц</h1><p class="muted">${D.scans.length} страниц. Нажмите страницу, чтобы открыть её в полном размере.</p></header>
      <ul class="scans">${D.scans.map((x) => `<li><a href="${x.f}" target="_blank" rel="noopener"><img src="${x.t}" width="420" height="305" alt="Страница ${x.n}: ${esc(x.title)}" loading="lazy"><span><b>${x.n}</b> ${esc(x.title)}</span></a></li>`).join("")}</ul>`;
  }

  function renderCat(path, qs) {
    const box = $("[data-cat]"), [, slug, key] = path, q = qs.get("q") || "", hl = qs.get("hl") || "";
    let html;
    if (path[0] === "arhiv") html = path[1] === "katalog-rr300" ? scansPage() : archivePage();
    else if (path[0] === "katalog" && !slug) html = catsPage();
    else if (path[0] === "katalog" && slug === "mufta-ms") html = muftaPage();
    else if (path[0] === "katalog" && slug !== "vse" && path[2] !== "spisok" && model(slug)) html = indexPage(model(slug));
    else if (path[0] === "katalog") { const m = model(slug); cstate = { m: m && FILTER_IDS.includes(m.id) ? m.id : null, g: qs.get("g") || "", q }; html = catalogPage(cstate); }
    else if (key === "obshchiy") html = overviewPage(rr300);
    else html = nodePage(rr300, D.nodes.find((n) => `ris-${n.fig}` === key) || D.nodes[0], compare, q);
    box.innerHTML = html;
    if (path[0] === "m" && q) filterRows(box, q);
    const mark = hl || (path[0] === "m" ? q : "");
    if (mark) { const hit = $(`tr[data-des="${CSS.escape(mark)}"]`, box); if (hit) { hit.classList.add("hit"); requestAnimationFrame(() => hit.scrollIntoView({ block: "center" })); } }
    document.title = `${$("h1", box).textContent} · каталог запчастей · Реверс-редуктор`;
  }

  // old catalog addresses (r1-r4) -> the unified list; drawing pages of РР-300 stay
  function legacyHash(path, qs) {
    // r5 list address #katalog/<slug>?g=&q= -> r6 list address
    if (path[0] === "katalog" && model(path[1]) && !path[2] && (qs.get("g") || qs.get("q"))) return catHash({ m: model(path[1]).id, g: qs.get("g") || "", q: qs.get("q") || "" });
    if (path[0] === "katalog" && !path[1] && (qs.get("g") || qs.get("q"))) return catHash({ g: qs.get("g") || "", q: qs.get("q") || "" });
    if (path[0] !== "m") return null;
    const m = model(path[1]), key = path[2] || "";
    if (m && m.id === "rr300" && (key.startsWith("ris-") || key === "obshchiy")) return null;
    if (!m) return "#katalog";
    const v = key.startsWith("gr-") ? viewsOf(m).find((x) => x.key === key) : null;
    return catHash({ m: FILTER_IDS.includes(m.id) ? m.id : null, g: v ? v.label : "", q: qs.get("q") || "" });
  }

  // ---------- routing ----------
  function route() {
    const h = decodeURIComponent(location.hash.slice(1)), [p, qs] = h.split("?");
    const params = new URLSearchParams(qs || ""), path = p.split("/");
    const legacy = legacyHash(path, params); if (legacy) { location.replace(legacy); return; }
    const isCat = path[0] === "katalog" || path[0] === "m" || path[0] === "arhiv";
    $("[data-view=home]").hidden = isCat; $("[data-view=cat]").hidden = !isCat;
    $$("[data-nav]").forEach((a) => a.toggleAttribute("aria-current", a.dataset.nav === (path[0] === "arhiv" ? "dokumenty" : isCat ? "katalog" : path[0])));
    $(".burger").open = false;
    if (isCat) {
      const sameKey = route.last === p;
      renderCat(path, params);
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
  });
  document.addEventListener("keydown", (e) => {
    const tr = e.target.closest?.("tr[data-nums]"); if (tr && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); tr.click(); }
    // on drawing pages the search box sends the query to the unified list
    if (e.key === "Enter" && e.target.matches?.("[data-fq]") && !$("[data-rows]")) location.hash = catHash({ q: e.target.value.trim() });
  });
  document.addEventListener("input", (e) => {
    const t = e.target;
    if (t.matches("[data-fq]") && $("[data-rows]")) { cstate.q = t.value; refreshList(); }
    if (t.matches("[data-filter]")) filterRows($("[data-cat]"), t.value);
  });
  document.addEventListener("change", (e) => {
    const t = e.target;
    if (t.matches("[data-jump]")) location.hash = t.value ? `m/${t.dataset.jump}/${t.value}` : `katalog/${t.dataset.jump}`;
    if (t.matches("[data-fg]")) { cstate.g = t.value; refreshList(); }
    if (t.matches("[data-isp]")) { isp = t.value; route.last = null; const y = scrollY; route(); scrollTo(0, y); $("[data-isp]").focus(); }
    if (t.matches("[data-q]")) { cart[+t.dataset.q].q = Math.max(1, parseInt(t.value, 10) || 1); save(); }
  });

  renderCart();
  window.addEventListener("hashchange", route);
  route();
})();
