// Shared engine for both demo designs: hash routing between the four tabs and the model parts picker,
// the drawing/table sync, part search and the request list (mailto on a click only, nothing is sent by the site).
(() => {
  const D = window.RR, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const norm = (s) => String(s).toLowerCase().replace(/[\s\-–.]/g, "").replace(/ё/g, "е");
  const model = (slug) => D.models.find((m) => m.slug === slug);
  const nf = new Intl.NumberFormat("ru-RU");
  // a designation never breaks at its hyphens; free-text "designations" from the old store may wrap at spaces
  const sku = (s) => `<span class="sku" translate="no">${String(s).split(" ").map((t) => `<span class="nw">${esc(t)}</span>`).join(" ")}</span>`;

  const { GROUPS, groupsOf, schematic } = window.RRSchema;

  // ---------- views ----------
  function views(m) {
    if (m.id === "rr300") return [
      { key: "obshchiy", label: "Общий вид, разрез", n: D.section.legend.length, th: D.section.src },
      { key: "vse", label: "Все детали", n: D.parts.rr300.length, th: D.front },
      ...D.nodes.map((nd) => ({ key: `ris-${nd.fig}`, label: nd.title, fig: nd.fig, n: nd.rows.length, th: nd.th })),
    ];
    return [{ key: "vse", label: "Все детали", n: D.parts[m.id].length },
      ...groupsOf(m.id).map(([g, n], i) => ({ key: `gr-${i + 1}`, label: g, n, num: i + 1 }))];
  }

  // ---------- request list ----------
  const CART_KEY = "rr-demo-cart";
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { cart = []; }
  const save = () => { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch {} renderCart(); };
  function addToCart(des, name, where) {
    const it = cart.find((c) => c.des === des);
    if (it) it.q += 1; else cart.push({ des, name, where, q: 1 });
    save();
    toast(`${des} добавлена в заявку`);
  }
  function cartText() {
    return cart.map((c, i) => `${i + 1}. ${c.des} ${c.name} (${c.where}), ${c.q} шт.`).join("\n");
  }
  function renderCart() {
    const n = cart.reduce((s, c) => s + c.q, 0);
    $$("[data-cart-count]").forEach((el) => { el.textContent = n; el.hidden = !n; });
    const box = $("#cart-items");
    if (!box) return;
    $("#cart-empty").hidden = cart.length > 0;
    $$("#cart [data-need-items]").forEach((b) => { b.disabled = !cart.length; });
    box.innerHTML = cart.map((c, i) => `<li><div>${sku(c.des)}<span>${esc(c.name)}</span><small>${esc(c.where)}</small></div>` +
      `<label class="sr" for="cq${i}">Количество, ${esc(c.des)}</label><input id="cq${i}" type="number" min="1" inputmode="numeric" value="${c.q}" data-q="${i}">` +
      `<button type="button" class="cart-x" data-x="${i}" aria-label="Убрать ${esc(c.des)}">×</button></li>`).join("");
  }
  function toast(msg) {
    const t = $("#toast"); if (!t) return;
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 2400);
  }

  // ---------- cards ----------
  function cards() {
    return D.models.map((m) => {
      const n = D.parts[m.id].length;
      return `<article class="card" data-model="${m.id}">
        <p class="card-kind">${esc(m.kind)}</p>
        <h3 class="card-name"><a href="#m/${m.slug}">${esc(m.name)}</a></h3>
        <p class="card-title">${esc(m.title)}</p>
        <p class="card-des">${sku(m.designation)}</p>
        <dl class="card-spec">${m.key.slice(0, 3).map(([l, v]) => `<div><dt>${esc(l)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
        <p class="card-foot"><a class="card-go" href="#m/${m.slug}">Подобрать запчасти</a><span class="card-n">${nf.format(n)}&nbsp;${plural(n, "позиция", "позиции", "позиций")}${m.id === "rr300" ? " · 26 узлов" : ""}</span></p>
      </article>`;
    }).join("");
  }
  const plural = (n, a, b, c) => (n % 10 === 1 && n % 100 !== 11 ? a : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? b : c);

  // ---------- picker ----------
  function picker(m, key, q) {
    const vs = views(m), v = vs.find((x) => x.key === key) || vs[0];
    const where = (extra) => `${m.name}${extra ? ", " + extra : ""}`;
    let fig, head, rows, cap, kind;

    if (v.key === "obshchiy") {
      kind = "legend";
      const s = D.section;
      fig = `<div class="pk-img"><img src="${s.src}" srcset="${s.src} 1200w, ${s.src2} 2400w" sizes="(min-width: 1100px) 55vw, 100vw" width="${s.w}" height="${s.h}" alt="Продольный разрез реверс-редуктора РР-300 с номерами позиций">` +
        s.callouts.map(([n, x, y]) => `<button type="button" class="pk-pt" data-n="${n}" style="left:${x}%;top:${y}%" tabindex="-1" aria-hidden="true"></button>`).join("") + `</div>`;
      cap = `Продольный разрез РР-300 по руководству по эксплуатации. Нажмите номер на чертеже или строку в перечне.`;
      head = `<tr><th scope="col" class="c-pos">Поз.</th><th scope="col">Наименование</th></tr>`;
      rows = s.legend.map(([nums, name]) => `<tr data-nums="${nums.join(" ")}" tabindex="0"><td class="c-pos c-nums nums">${nums.join(", ")}</td><td>${esc(name)}</td></tr>`).join("");
    } else if (v.fig) {
      kind = "node";
      const nd = D.nodes.find((x) => x.fig === v.fig);
      fig = `<a class="pk-img pk-zoom" href="${nd.img2}" target="_blank" rel="noopener" aria-label="Открыть рисунок ${nd.fig} в полном размере">` +
        `<img src="${nd.img}" srcset="${nd.img} 900w, ${nd.img2} 2000w" sizes="(min-width: 1100px) 55vw, 100vw" width="${nd.w}" height="${nd.h}" alt="Рис. ${nd.fig}. ${esc(nd.title)}"></a>`;
      cap = `Рис. ${nd.fig}. ${esc(nd.title)}. Каталог деталей РР-300${nd.pages ? ", с. " + nd.pages.join("–") : ""}. Номера позиций на рисунке соответствуют перечню.`;
      head = `<tr><th scope="col" class="c-pos">Поз.</th><th scope="col">Обозначение</th><th scope="col">Наименование</th><th scope="col" class="c-q">Кол.</th><th scope="col"><span class="sr">Заявка</span></th></tr>`;
      rows = nd.rows.map(([pos, des, name, qn]) => `<tr data-des="${esc(des)}"><td class="c-pos nums">${pos}</td><td class="c-des">${sku(des)}</td><td class="c-name">${esc(name)}</td><td class="c-q nums">${esc(qn)}</td>` +
        `<td><button type="button" class="pk-add" data-add="${esc(des)}" data-name="${esc(name)}" data-where="${esc(where("рис. " + nd.fig + ", поз. " + pos))}" aria-label="Добавить ${esc(des)} в заявку">+</button></td></tr>`).join("");
    } else {
      kind = "parts";
      const g = v.key === "vse" ? null : v.label;
      const list = D.parts[m.id].filter((p) => !g || p[2] === g);
      if (m.id === "rr300") {
        fig = `<div class="pk-img"><img src="${D.front}" width="1200" height="1328" alt="Реверс-редуктор РР-300, вид по руководству по эксплуатации" loading="lazy"></div>`;
        cap = `РР-300. Для подбора по позициям выберите узел каталога (рис. 1–26).`;
      } else {
        fig = `<div class="pk-img pk-schema">${schematic(m.id, g)}</div>`;
        cap = `Схема групп деталей ${esc(m.name)}. Номер на схеме соответствует группе в списке. Нет нужной детали: пришлите обозначение с таблички или из паспорта.`;
      }
      head = `<tr><th scope="col">Обозначение</th><th scope="col">Наименование</th>${g ? "" : `<th scope="col" class="c-g">Группа</th>`}<th scope="col"><span class="sr">Заявка</span></th></tr>`;
      rows = list.map(([des, name, grp]) => `<tr data-des="${esc(des)}" data-g="${esc(grp)}"><td class="c-des">${sku(des)}</td><td class="c-name">${esc(name)}</td>${g ? "" : `<td class="c-g">${esc(grp)}</td>`}` +
        `<td><button type="button" class="pk-add" data-add="${esc(des)}" data-name="${esc(name)}" data-where="${esc(where(""))}" aria-label="Добавить ${esc(des)} в заявку">+</button></td></tr>`).join("");
    }

    const nav = vs.map((x) => `<li><a class="pk-view" href="#m/${m.slug}/${x.key}"${x.key === v.key ? ' aria-current="true"' : ""}>` +
      (x.th ? `<img class="pk-vt" src="${x.th}" width="420" height="305" alt="" loading="lazy">` : "") + `<span class="pk-vn">${x.fig ? "Рис. " + x.fig : x.num ? x.num : ""}</span><span class="pk-vl">${esc(x.label)}</span><span class="pk-vc">${x.n}</span></a></li>`).join("");
    const specs = m.specs.map(([l, val]) => `<tr><th scope="row">${esc(l)}</th><td>${esc(val)}</td></tr>`).join("");
    const variants = m.variants.length ? `<table class="pk-var"><caption>Исполнения</caption><thead><tr><th scope="col">Исп.</th><th scope="col">Вращение</th><th scope="col">л.с.</th><th scope="col">Вперёд</th><th scope="col">Назад</th><th scope="col">Пальцев</th></tr></thead><tbody>` +
      m.variants.map((r) => `<tr>${r.map((c, i) => `<td${i ? ' class="nums"' : ""}>${i ? esc(c) : sku(c)}</td>`).join("")}</tr>`).join("") + `</tbody></table>` : "";
    const others = D.models.filter((x) => x.id !== m.id).map((x) => `<a href="#m/${x.slug}">${esc(x.name)}</a>`).join("");

    return `<div class="pk" data-kind="${kind}">
      <header class="pk-head">
        <nav class="pk-crumbs" aria-label="Путь"><a href="#produkciya">Продукция</a><span aria-hidden="true">/</span><span>${esc(m.name)}</span></nav>
        <h1 class="pk-h1" tabindex="-1">${esc(m.title)}</h1>
        <p class="pk-meta">${sku(m.designation)}<span>${esc(m.kind)}</span><span>${nf.format(D.parts[m.id].length)} ${plural(D.parts[m.id].length, "позиция", "позиции", "позиций")} в каталоге</span></p>
        <nav class="pk-others" aria-label="Другие редукторы">${others}</nav>
      </header>
      <details class="pk-specs"><summary>Технические характеристики</summary><div><table class="pk-spec"><tbody>${specs}</tbody></table>${variants}</div></details>
      <div class="pk-body">
        <nav class="pk-nav" aria-label="${m.id === "rr300" ? "Узлы каталога" : "Группы деталей"}">
          <p class="pk-nav-h">${m.id === "rr300" ? "Узлы по каталогу" : "Группы деталей"}</p>
          <ol>${nav}</ol>
        </nav>
        <figure class="pk-fig">${fig}<figcaption class="pk-cap">${cap}</figcaption></figure>
        <section class="pk-list" aria-labelledby="pk-lh">
          <div class="pk-tools">
            <h2 id="pk-lh">${esc(v.label)}</h2>
            ${kind === "legend" ? "" : `<label class="pk-filter"><span class="sr">Поиск в списке</span><input type="search" placeholder="Обозначение или название" value="${esc(q || "")}" data-filter autocomplete="off"></label>`}
          </div>
          <div class="pk-scroll"><table class="pk-table"><thead>${head}</thead><tbody>${rows}</tbody></table>
          <p class="pk-none" hidden>Ничего не найдено. Проверьте обозначение или <button type="button" class="linkish" data-cart-open>отправьте запрос по номеру</button>.</p></div>
        </section>
      </div>
    </div>`;
  }

  function filterRows(root, q) {
    const nq = norm(q);
    let shown = 0;
    $$(".pk-table tbody tr", root).forEach((tr) => { const hit = !nq || norm(tr.textContent).includes(nq); tr.hidden = !hit; shown += hit; });
    $(".pk-none", root).hidden = shown > 0;
  }

  function wirePicker(root, q) {
    const kind = $(".pk", root).dataset.kind;
    const f = $("[data-filter]", root);
    if (f) { f.addEventListener("input", () => filterRows(root, f.value)); if (q) filterRows(root, q); }
    if (q) { const tr = $(`tr[data-des="${CSS.escape(q)}"]`, root); if (tr) { tr.classList.add("hit"); } }
    if (kind === "legend") {
      const pick = (nums) => {
        $$(".pk-pt", root).forEach((p) => p.classList.toggle("on", nums.includes(+p.dataset.n)));
        $$("tr[data-nums]", root).forEach((tr) => { const on = tr.dataset.nums.split(" ").map(Number).some((n) => nums.includes(n)); tr.classList.toggle("on", on); tr.setAttribute("aria-selected", on); });
      };
      root.addEventListener("click", (e) => {
        const pt = e.target.closest(".pk-pt"), tr = e.target.closest("tr[data-nums]");
        if (pt) { const n = +pt.dataset.n; const row = $$("tr[data-nums]", root).find((r) => r.dataset.nums.split(" ").map(Number).includes(n)); pick(row ? row.dataset.nums.split(" ").map(Number) : [n]); row && row.scrollIntoView({ block: "nearest" }); }
        if (tr) pick(tr.dataset.nums.split(" ").map(Number));
      });
      root.addEventListener("keydown", (e) => { const tr = e.target.closest("tr[data-nums]"); if (tr && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); tr.click(); } });
    }
    if (kind === "parts") {
      const light = (g) => $$(".pk-zone", root).forEach((z) => z.classList.toggle("hov", z.dataset.g === g));
      root.addEventListener("mouseover", (e) => { const tr = e.target.closest("tr[data-g]"); light(tr ? tr.dataset.g : null); });
      root.addEventListener("click", (e) => {
        const z = e.target.closest(".pk-zone"); if (!z) return;
        const a = $$(".pk-view", root).find((x) => x.querySelector(".pk-vl").textContent === z.dataset.g); if (a) location.hash = a.getAttribute("href");
      });
    }
  }

  // ---------- part search (tab «Запасные части») ----------
  const INDEX = [];
  D.models.forEach((m) => D.parts[m.id].forEach(([des, name, grp]) => INDEX.push({ m, des, name, grp, k: norm(des + " " + name) })));
  function nodeOf(des) { const nd = D.nodes.find((n) => n.rows.some((r) => r[1] === des)); return nd ? `ris-${nd.fig}` : "vse"; }
  function search(q) {
    const out = $("[data-results]"); if (!out) return;
    const nq = norm(q);
    if (nq.length < 2) { out.innerHTML = ""; $("[data-results-n]").textContent = ""; return; }
    const hits = INDEX.filter((x) => x.k.includes(nq));
    $("[data-results-n]").textContent = hits.length ? `Найдено: ${hits.length}` : "";
    out.innerHTML = hits.length ? hits.slice(0, 60).map((x) => `<li><a href="#m/${x.m.slug}/${x.m.id === "rr300" ? nodeOf(x.des) : "vse"}?q=${encodeURIComponent(x.des)}">` +
      `${sku(x.des)}<span class="r-name">${esc(x.name)}</span><span class="r-model">${esc(x.m.name)}</span></a></li>`).join("")
      : `<li class="r-none">По запросу «${esc(q)}» ничего нет. Проверьте обозначение или отправьте запрос по номеру: ${esc(D.company.phone)}, ${esc(D.company.email)}.</li>`;
  }

  // ---------- routing ----------
  const s = $("[data-search]");
  const TABS = ["produkciya", "zapchasti", "uslugi", "dokumenty"];
  function route() {
    const h = decodeURIComponent(location.hash.slice(1));
    const [path, qs] = h.split("?");
    const q = new URLSearchParams(qs || "").get("q") || "";
    const parts = path.split("/");
    let tab = TABS.includes(parts[0]) ? parts[0] : "produkciya", m = null;
    if (parts[0] === "m") m = model(parts[1]);
    const panel = m ? "model" : tab;
    $$("[data-panel]").forEach((p) => { p.hidden = p.dataset.panel !== (p.dataset.panel === "home" ? "home" : panel) || (p.dataset.panel === "home" && panel !== "produkciya"); });
    $$("[data-tab]").forEach((a) => { if (a.dataset.tab === (m ? "produkciya" : tab)) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    document.body.dataset.view = m ? "model" : tab;
    if (m) {
      const box = $("[data-picker]");
      box.innerHTML = picker(m, parts[2], q);
      wirePicker(box, q);
      document.title = `${m.title} · запчасти по схеме · ${D.company.brand}`;
      if (route.prevModel !== m.slug) { window.scrollTo(0, 0); $(".pk-h1").focus({ preventScroll: true }); }
      route.prevModel = m.slug;
      // bring the current node into view inside the node list, without moving the page
      const cur = $(".pk-view[aria-current]"), ol = cur && cur.closest("ol");
      const sc = ol && [ol, ol.parentElement].find((e) => e.scrollHeight > e.clientHeight + 1 || e.scrollWidth > e.clientWidth + 1);
      if (sc) {
        const a = cur.getBoundingClientRect(), b = sc.getBoundingClientRect();
        if (a.right > b.right || a.left < b.left) sc.scrollLeft += a.left - b.left - 8;
        if (a.bottom > b.bottom || a.top < b.top) sc.scrollTop += a.top - b.top - 48;
      }
    } else {
      document.title = `${D.company.brand} · ${D.company.operator} · судовые реверс-редукторы`;
      if (route.prevModel || route.prevTab !== tab) { if (location.hash) $("[data-tabs]").scrollIntoView({ block: "start" }); }
      route.prevModel = null;
    }
    if (tab === "zapchasti" && q && s) { s.value = q; search(q); }
    route.prevTab = tab;
  }

  // ---------- boot ----------
  document.documentElement.classList.add("js");
  $$("[data-cards]").forEach((el) => { el.innerHTML = cards(); });
  $$("[data-fill]").forEach((el) => { const v = el.dataset.fill.split(".").reduce((o, k) => o[k], D); el.textContent = v; });
  if (s) s.addEventListener("input", () => search(s.value));
  $$("form[data-go]").forEach((f) => f.addEventListener("submit", (e) => {
    e.preventDefault(); const v = f.querySelector("input").value.trim(); location.hash = "zapchasti" + (v ? "?q=" + encodeURIComponent(v) : "");
  }));

  document.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    if (add) addToCart(add.dataset.add, add.dataset.name, add.dataset.where);
    if (e.target.closest("[data-cart-open]")) { renderCart(); $("#cart").showModal(); }
    if (e.target.closest("[data-cart-close]")) $("#cart").close();
    const x = e.target.closest("[data-x]");
    if (x) { cart.splice(+x.dataset.x, 1); save(); }
    if (e.target.closest("[data-cart-mail]")) {
      const body = `Здравствуйте!\n\nПрошу выставить счёт / сообщить наличие и сроки:\n\n${cartText()}\n\nОрганизация:\nКонтактное лицо:\nТелефон:\n`;
      location.href = `mailto:${D.company.email}?subject=${encodeURIComponent("Заявка на запчасти, реверс-редукторы")}&body=${encodeURIComponent(body)}`;
    }
    if (e.target.closest("[data-cart-copy]")) {
      navigator.clipboard.writeText(cartText()).then(() => toast("Список скопирован"), () => toast("Не удалось скопировать: выделите список вручную"));
    }
    if (e.target.closest("[data-cart-clear]")) { cart = []; save(); }
  });
  document.addEventListener("change", (e) => {
    const qi = e.target.closest("[data-q]");
    if (qi) { cart[+qi.dataset.q].q = Math.max(1, parseInt(qi.value, 10) || 1); save(); }
  });
  $("#cart")?.addEventListener("click", (e) => { if (e.target.id === "cart") e.target.close(); });

  renderCart();
  window.addEventListener("hashchange", route);
  route();
})();
