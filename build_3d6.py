"""c-r17: 3Д6 drawing catalog from the owner's Word file (10 exploded views, Рис. 89-98, 10 part tables).

Usage: python3 build_3d6.py "<path to .docx>"
Writes c-r17/img/3d6/ris-N{,-420,-1400}.webp and c-r17/nodes3d6.js (window.RR3D6, merged into RR by app.js).
Only the four 3Д6-family columns carry data in the file (3Д6, 3Д6Л, 3Д6С, 3Д6СЛ); the other eight (1Д6..., 7Д6...) are
checked to be empty and dropped, as are the OKP codes (partly garbled by the scan).
"""
import json, re, subprocess, sys, tempfile, zipfile
from pathlib import Path

ROOT = Path(__file__).parent
OUT = ROOT / "c-r17"
LAT = dict(zip("ABCEHKMOPTXaceoprxy", "АВСЕНКМОРТХасеорху"))
TITLES = ["Корпус реверс-редуктора", "Реверсивная муфта", "Ролик включения", "Бугель шарикоподшипника",
          "Вилка включения реверс-редуктора", "Ведущая шестерня переднего хода", "Ведущая шестерня и крышка вала заднего хода",
          "Выходной вал и передняя крышка", "Задняя крышка выходного вала", "Шестерня промежуточная заднего хода"]
# scan typos fixed only where the right value is certain from the same file (same designation elsewhere) or the standard size
NAME_FIX = {"Шпилька Ш2х67": "Шпилька М12х67", "Болт М8х6": "Болт М8х16", "Болт M8XI6": "Болт М8х16", "Болт MI2X35": "Болт М12х35",
            "БОЛТ М10Х38": "Болт М10х38", "Шарик 5 им": "Шарик 5 мм", "Валка включения": "Вилка включения", "Болт М8x8": "Винт М8х8"}
VARS = ["3Д6", "3Д6Л", "3Д6С", "3Д6СЛ"]
GROUP = {"Вал": "Валы", "Валик": "Валы", "Шестерня": "Шестерни", "Диск": "Диски", "Подшипник": "Подшипники", "Шарикоподшипник": "Подшипники",
         "Роликоподшипник": "Подшипники", "Втулка": "Втулки и стаканы", "Стакан": "Втулки и стаканы", "Крышка": "Крышки и корпуса",
         "Корпус": "Крышки и корпуса", "Кольцо": "Кольца", "Шайба": "Шайбы", "Гайка": "Гайки, болты, винты", "Болт": "Гайки, болты, винты",
         "Винт": "Гайки, болты, винты", "Шпилька": "Гайки, болты, винты", "Заклепка": "Гайки, болты, винты", "Пружина": "Пружины",
         "Прокладка": "Прокладки и уплотнения", "Муфта": "Муфты и полумуфты"}


def cell(c):
    return "".join("".join(re.findall(r"<w:t[^>]*>([^<]*)</w:t>", r)) for r in re.findall(r"<w:r[ >].*?</w:r>", c, flags=re.S)).strip()


def des_of(raw):
    """designation + footnote mark: the scan renders a superscript 1 or 2 as a backslash («525М-48\\1»)"""
    d, _, mark = raw.strip().partition("\\")
    d = "".join(LAT.get(ch, ch) for ch in d)
    d = re.sub(r"^[Сс][Бб]\.?\s*", "СБ", d)
    return d, mark


def fix_name(n):
    n = " ".join(n.split())
    n = NAME_FIX.get(n, n)
    return n[0].upper() + n[1:]


def main(docx):
    tmp = Path(tempfile.mkdtemp())
    with zipfile.ZipFile(docx) as z:
        z.extractall(tmp)
    xml = (tmp / "word/document.xml").read_text(encoding="utf8")
    tables = [[[cell(c) for c in re.findall(r"<w:tc>.*?</w:tc>", tr, flags=re.S)] for tr in re.findall(r"<w:tr[ >].*?</w:tr>", t, flags=re.S)]
              for t in re.findall(r"<w:tbl>.*?</w:tbl>", xml, flags=re.S)]
    assert len(tables) == 10 == len(TITLES)
    (OUT / "img/3d6").mkdir(parents=True, exist_ok=True)
    nodes, catalog = [], {}
    for i, t in enumerate(tables):
        fig = 89 + i
        foot, rows, qa, note = {}, [], [], []
        for r in t[1:]:
            if len(r) == 1:
                m = re.match(r"(\d)\.\s*(.+?)\.?$", r[0]); foot[m.group(1)] = m.group(2) + "."
                continue
            assert len(r) == 17, (fig, r)
            q = [None if x in ("", "-") else int(x) for x in r[5:]]
            assert all(x is None for k, x in enumerate(q) if not 4 <= k <= 7), (fig, r)  # other families really are empty
            d, mark = des_of(r[2])
            if d.startswith("31 2"):  # row 12 of Рис. 94: designation lost in the scan, 525М-24 by the pair 525М-24-1 (ratio 1:2,02)
                d = "525М-24"
            if i == 5 and d == "525М-24-1": mark = "2"
            if i == 5 and d == "525М-24": mark = "1"
            name = fix_name(r[1])
            pos = int(r[0]) if r[0].isdigit() else 0
            rows.append([pos, d, name]); qa.append(q[4:8]); note.append(mark)
            c = catalog.setdefault(d, {"des": d, "name": name, "figs": []})
            if fig not in c["figs"]: c["figs"].append(fig)
        n = i + 1
        src = tmp / f"word/media/image{n}.jpeg"
        base = OUT / f"img/3d6/ris-{fig}"
        for suf, w in (("", 900), ("-420", 420), ("-1400", 1400)):
            sc = f"crop=iw-16:ih-16:8:8,scale={w}:-2"  # trims the black page frame of the scan
            png = tmp / "t.png"
            subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(src), "-vf", sc, str(png)], check=True)
            subprocess.run(["cwebp", "-quiet", "-q", "82", str(png), "-o", str(base) + suf + ".webp"], check=True)
        nodes.append({"fig": fig, "title": TITLES[i], "img": f"img/3d6/ris-{fig}.webp", "img2": f"img/3d6/ris-{fig}-1400.webp",
                      "th": f"img/3d6/ris-{fig}-420.webp", "w": 900, "h": 633, "vars": VARS, "rows": rows, "qa": qa, "note": note, "foot": foot})
    for c in catalog.values():
        c["type"] = "Прочие детали" if c["des"].startswith("СБ") else GROUP.get(c["name"].split()[0], "Прочие детали")
    data = {"nodes": nodes, "catalog": list(catalog.values())}
    (OUT / "nodes3d6.js").write_text("window.RR3D6=" + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf8")
    print(len(nodes), "nodes,", sum(len(n["rows"]) for n in nodes), "rows,", len(catalog), "designations")


if __name__ == "__main__":
    main(sys.argv[1])
