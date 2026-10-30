#!/usr/bin/env python3
"""Builds shared/data.js and assets/ for both demo designs from the V5 data (../v5-ab). Re-run after V5 data changes."""
import json, shutil
from pathlib import Path

HERE = Path(__file__).parent
V5 = HERE.parent / "v5-ab"
D = V5 / "src" / "data"
PUB = V5 / "public"
ASSETS = HERE / "assets"

load = lambda n: json.loads((D / n).read_text())
models, parts, nodes, cut = load("models.json"), load("parts.json"), load("assemblies.json"), load("cutaway.json")

copied = set()
def asset(src):
    """Copy a V5 public file into assets/ (flat) and return its path relative to a design folder."""
    p = PUB / src
    if p.name not in copied:
        shutil.copy2(p, ASSETS / p.name)
        copied.add(p.name)
    return "../assets/" + p.name

def asset_v3(src):
    p = HERE.parent / "v3" / "public" / src
    shutil.copy2(p, ASSETS / p.name)
    copied.add(p.name)
    return "../assets/" + p.name

def qty(q):
    vals = sorted({v for v in q if v is not None})
    return "" if not vals else str(vals[0]) if len(vals) == 1 else f"{vals[0]}–{vals[-1]}"

TITLES = {"rr300": "Реверс-редуктор РР-300", "rr238": "Реверс-редуктор РР-238",
          "3d6": "Реверс-редуктор для дизеля 3Д6", "3d12": "Реверс-редуктор для дизеля 3Д12"}
ORDER = ["rr300", "rr238", "3d6", "3d12"]
HIDE = {"Производитель", "Страна-производитель"}  # client: ООО «Дело» is the manufacturer on this site

out_models = []
for m in sorted(models, key=lambda m: ORDER.index(m["id"])):
    specs = [[s["label"], s["value"]] for s in m["specsClient"] if s["label"] not in HIDE]
    out_models.append({
        "id": m["id"], "slug": m["slug"], "name": m["name"], "title": TITLES[m["id"]],
        "designation": m["designation"], "kind": m["kind"],
        "key": [[s["label"], s["value"]] for s in m["keySpecs"]], "specs": specs,
        "variants": [[v["code"], v["rot"], v["hp"], v["fwd"], v["rev"], v["fingers"]] for v in m["variants"]],
    })

out_parts = {m["id"]: [] for m in models}
for p in sorted(parts, key=lambda p: p["designation"]):
    for mid in p["models"]:
        out_parts[mid].append([p["designation"], p["name"], p["type"]])

on_drawing = {c["n"] for c in cut["callouts"]}
section = {
    "src": asset("img/v5/rr300-section-1200.webp"), "src2": asset("img/v5/rr300-section-2400.webp"), "w": 1200, "h": 1120,
    "callouts": [[c["n"], c["x"], c["y"]] for c in cut["callouts"]],
    "legend": [[l["nums"], l["name"]] for l in cut["legend"] if any(n in on_drawing for n in l["nums"])],
}
out_nodes = [{
    "fig": n["figure"], "title": n["title"], "pages": n["catalogPages"],
    "img": asset(n["drawing"]["t"]["src"]), "img2": asset(n["drawing"]["f"]["src"]),
    "th": asset(n["drawing"]["t"]["src"].replace("-900.", "-420.")),
    "w": n["drawing"]["t"]["w"], "h": n["drawing"]["t"]["h"],
    "rows": [[r["pos"], r["designation"], r["name"], qty(r["qty"])] for r in n["rows"]],
    # design C: quantity per variant (null = not in that variant), mass, footnote mark, catalog spec scan
    "vars": n["variants"], "qa": [r["qty"] for r in n["rows"]], "mass": [r["mass"] for r in n["rows"]],
    "note": [r["note"] for r in n["rows"]], "foot": n.get("footnotes") or {},
    "spec": asset(n["spec"]["f"]["src"]) if n.get("spec") else None,
} for n in nodes]

data = {
    "company": {"brand": "Реверс-редуктор", "tagline": "Судовое оборудование", "operator": "ООО «Дело»",
                "inn": "2225060059", "kpp": "222501001", "ogrn": "1032202271309",
                "phone": "+7 960 966-55-77", "tel": "+79609665577", "email": "sudosnab_delo@mail.ru",
                "address": "656609, Алтайский край, г. Барнаул, р.п. Южный, ул. Зоотехническая, 24"},
    "cert": {"no": "06552", "from": "20.07.2026", "to": "20.07.2028", "issuer": "Российское Классификационное Общество",
             "img": asset("img/cert/rko-06552-600.webp"), "img2": asset("img/cert/rko-06552-1200.webp"),
             "pdf": asset("docs/svidetelstvo-rko-06552.pdf"),
             "scope": ["разработка технической документации на изделия судового машиностроения",
                       "дефектация и капитальный ремонт судовых реверс-редукторов",
                       "изготовление и ремонт изделий судового машиностроения"]},
    "manual": {"pdf": asset("docs/rr300-rukovodstvo.pdf"), "title": "Руководство по эксплуатации РР-300.РЭ", "pages": 24, "mb": 3.6},
    "front": asset("img/v5/rr300-front-1200.webp"),
    # design C photos: owner photo (no watermark); РР-238 and 3Д12 old-store photos carry the owner's own revers-remont.ru mark
    "photos": {"hero": asset("img/site/79a88550a41c-1400.webp"), "hero900": asset("img/site/79a88550a41c-900.webp"),
               "rr238": asset_v3("img/m/99135878458a-1398.webp"), "3d12": asset_v3("img/m/aa626a94adf3-472.webp"),
               # 3Д6: old Tilda store photo (reconstruction/media/images/tilda-img/fe053e94e613210e.jpg), owner's revers-remont.ru mark
               "3d6": "../assets/3d6-store-548.webp"},
    "models": out_models, "parts": out_parts, "section": section, "nodes": out_nodes,
    # revision 3: unit prices from the old store (2025 price list) by designation, and the РР-300 catalog scans for the archive
    "prices": {p["designation"]: p["price"] for p in parts if p.get("price")},
    "scans": [{"n": x["n"], "title": x["title"], "t": asset(x["t"]["src"]), "f": asset(x["f"]["src"])} for x in load("scans.json")],
}

ASSETS.mkdir(exist_ok=True)
(HERE / "shared" / "data.js").write_text("window.RR=" + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n")
print(f"models {len(out_models)}, parts {sum(map(len, out_parts.values()))} rows, nodes {len(out_nodes)}, assets {len(copied)}")
