// Part groups and the generic group diagram for models without a published factory drawing. Used by all designs.
(() => {
  const D = window.RR;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const GROUPS = ["Валы", "Шестерни", "Диски", "Муфты и полумуфты", "Подшипники", "Втулки и стаканы", "Крышки и корпуса",
    "Кольца", "Шайбы", "Гайки, болты, винты", "Пружины", "Прокладки и уплотнения", "Насосы", "Комплекты и ремкомплекты", "Прочие детали"];
  const groupsOf = (id) => GROUPS.map((g) => [g, D.parts[id].filter((p) => p[2] === g).length]).filter(([, n]) => n);

  // Zones of a generic reverse gearbox, keyed by part group. An explanatory picture, not a factory drawing.
  const ZONES = {
    "Крышки и корпуса": `<path d="M150 70h300l40 40v170l-30 30H160l-30-30V110z"/><path d="M450 70v240" stroke-dasharray="6 5"/>`,
    "Валы": `<rect x="30" y="168" width="250" height="26" rx="3"/><rect x="330" y="226" width="250" height="26" rx="3"/>`,
    "Муфты и полумуфты": `<rect x="34" y="128" width="40" height="106" rx="4"/><rect x="540" y="196" width="34" height="86" rx="4"/>`,
    "Диски": `<rect x="196" y="122" width="10" height="118"/><rect x="212" y="122" width="10" height="118"/><rect x="228" y="122" width="10" height="118"/><rect x="244" y="122" width="10" height="118"/>`,
    "Шестерни": `<circle cx="314" cy="181" r="46" stroke-dasharray="5 4"/><circle cx="398" cy="239" r="38" stroke-dasharray="5 4"/>`,
    "Подшипники": `<rect x="152" y="160" width="26" height="42"/><path d="M152 160l26 42M178 160l-26 42"/><rect x="452" y="218" width="26" height="42"/><path d="M452 218l26 42M478 218l-26 42"/>`,
    "Втулки и стаканы": `<rect x="138" y="150" width="54" height="62" rx="2"/><rect x="440" y="208" width="52" height="62" rx="2"/>`,
    "Кольца": `<ellipse cx="290" cy="181" rx="5" ry="20"/><ellipse cx="358" cy="239" rx="5" ry="20"/>`,
    "Шайбы": `<ellipse cx="520" cy="239" rx="4" ry="16"/><ellipse cx="96" cy="181" rx="4" ry="16"/>`,
    "Гайки, болты, винты": `<circle cx="180" cy="70" r="7"/><circle cx="260" cy="70" r="7"/><circle cx="340" cy="70" r="7"/><circle cx="420" cy="70" r="7"/><circle cx="180" cy="310" r="7"/><circle cx="420" cy="310" r="7"/>`,
    "Пружины": `<path d="M262 130l8 8-8 8 8 8-8 8 8 8-8 8"/>`,
    "Прокладки и уплотнения": `<path d="M130 112v166" stroke-width="5"/>`,
    "Насосы": `<rect x="300" y="276" width="70" height="30" rx="3"/>`,
  };
  const ZONE_LABEL = { "Крышки и корпуса": [470, 96], "Валы": [44, 214], "Муфты и полумуфты": [54, 118], "Диски": [225, 112],
    "Шестерни": [314, 128], "Подшипники": [165, 226], "Втулки и стаканы": [465, 196], "Кольца": [290, 214], "Шайбы": [520, 272],
    "Гайки, болты, винты": [220, 56], "Пружины": [276, 116], "Прокладки и уплотнения": [118, 290], "Насосы": [335, 324] };

  function schematic(id, active) {
    const gs = groupsOf(id).map(([g]) => g);
    const zones = gs.filter((g) => ZONES[g]).map((g) => {
      const n = gs.indexOf(g) + 1, [lx, ly] = ZONE_LABEL[g];
      return `<g class="pk-zone${g === active ? " on" : ""}" data-g="${esc(g)}"><title>${esc(g)}</title>${ZONES[g]}` +
        `<circle class="pk-zn" cx="${lx}" cy="${ly}" r="11"/><text x="${lx}" y="${ly + 4}">${n}</text></g>`;
    }).join("");
    return `<svg class="pk-svg" viewBox="0 0 610 340" role="img" aria-label="Схема групп деталей">` +
      `<g class="pk-axis"><path d="M10 181h290M320 239h285" stroke-dasharray="14 4 2 4"/></g>${zones}</svg>`;
  }

  window.RRSchema = { GROUPS, groupsOf, schematic };
})();
