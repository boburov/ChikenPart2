#!/usr/bin/env python3
"""Extract the four presentation sections of Кегейли.xlsx.

Writes
  src/data/kegeyli.json  every value with its sheet!cell, Excel formula and notes
  docs/verification.md   the same values laid out like the sheet, to check against Excel

Run: .venv/bin/python scripts/extract.py [path/to/Кегейли.xlsx]
"""
from __future__ import annotations

import datetime as dt
import hashlib
import json
import re
import sys
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
SOURCE = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "data" / "Кегейли.xlsx"
OUT_JSON = ROOT / "src" / "data" / "kegeyli.json"
OUT_MD = ROOT / "docs" / "verification.md"

# Cost columns, identical on all four sheets. Each facility uses three rows:
# the facility itself, then +1 own funds, then +2 bank credit.
COST_COLS = {"I": "total", "J": "construction", "K": "equipment", "L": "chickens", "M": "feed"}
MONEY_ROWS = {"cost": 0, "own": 1, "bank": 2}

# Presentation order: grandparent -> parent -> broiler, then the separate egg line.
SECTIONS = [
    {
        "id": "praroditel", "sheet": "Прородитель", "title": "Прародитель",
        "subtitle": "Бройлер йўналиши бўйича прародитель",
        "rows": [10, 13, 16], "birds": ("birdsPerBuilding", "birds"),
        "units": {
            "cost": {"unit": "kUSD", "source": "Прородитель!K3"},
            "revenue": {"unit": "kUSD", "note": "No unit in the sheet; read as thousand USD (3 000 000 chicks × $7), confirmed by the user"},
            "output": {"unit": "pcs", "what": "parent-stock chicks per year"},
        },
        "labels": {"D": "Бош (1 бинода)", "E": "Жами бош", "F": "Ота-она жўжа, дона/йил", "G": "Тушум, минг $", "L": "Товуқ"},
    },
    {
        "id": "roditel", "sheet": "Родилеь", "title": "Родитель",
        "subtitle": "Бройлер йўналиши бўйича ота-она галаси",
        "rows": [10, 13, 16], "birds": ("birdsPerBuilding", "birds"),
        "units": {
            "cost": {"unit": "kUSD", "note": "No unit in the sheet; read as thousand USD like броллер!K3 and Прородитель!K3"},
            "revenue": {"unit": "USD", "source": "Родилеь!G5"},
            "output": {"unit": "pcs", "what": "hatching eggs per year"},
        },
        "labels": {"D": "Бош (1 бинода)", "E": "Жами бош", "F": "Тухум, дона/йил", "G": "Тушум, $", "L": "Товуқ"},
    },
    {
        "id": "broiler", "sheet": "броллер", "title": "Бройлер",
        "subtitle": "Бройлер йўналиши",
        "rows": [10, 13, 16, 19, 22], "birds": ("birdsPerBatch", "birdsPerYear"),
        "units": {
            "cost": {"unit": "kUSD", "source": "броллер!K3"},
            "revenue": {"unit": "USD", "source": "броллер!G5"},
            "output": {"unit": "kg", "what": "live weight per year", "note": "Header says тн but F = E × 2.5 kg, so the values are kg; slides show tonnes"},
        },
        "labels": {"D": "1 боқишда, бош", "E": "Йилига (×6), бош", "F": "Тирик вазн, кг", "G": "Тушум, $", "L": "Жўжа"},
    },
    {
        "id": "nesushka", "sheet": "Несушка", "title": "Несушка",
        "subtitle": "Тухум йўналиши",
        "rows": [10, 13, 16], "birds": ("birdsPerBuilding", "birds"),
        "units": {
            "cost": {"unit": "kUSD", "note": "No unit in the sheet; read as thousand USD like броллер!K3 and Прородитель!K3"},
            "revenue": {"unit": "USD", "source": "Несушка!G5"},
            "output": {"unit": "pcs", "what": "table eggs per year"},
        },
        "labels": {"D": "Бош (1 бинода)", "E": "Жами бош", "F": "Тухум, дона/йил", "G": "Тушум, $", "L": "Товуқ"},
    },
]

# Sums of "birds per building" across facilities: not a real total, never shown.
HIDDEN = {"Прородитель!D7", "Родилеь!D7"}

# Spelling fixes applied to every text shown on the slides. The sheet's own text is
# kept next to it in the JSON as "sheetText".
WORD_FIXES = [
    ("Родилеь", "Родитель"), ("родилеь", "родитель"),
    ("Прородитель", "Прародитель"), ("прородитель", "прародитель"),
    ("Кеегейли", "Кегейли"), ("Трик вазнда", "Тирик вазнда"),
    ("ота на", "ота-она"), ("ота она", "ота-она"), ("доллрдан", "доллардан"),
    ("Дастгох", "Дастгоҳ"), ("хар бир", "ҳар бир"), ("Лойиха", "лойиҳа"),
    ("АКШ", "АҚШ"), ("2,5кг", "2,5 кг"),
]

# Header cells whose sheet text is misleading or too long for a slide.
HEADER_TEXT = {
    "I4": "Лойиҳа қиймати",
    "H4": "Дастгоҳ етказиб берувчи",
    "J4": "Харажатлар таркиби",  # the sheet repeats «Лойиҳа йўналиши» from B4 here
    "G5": "Тушум",
    "K3": "минг АҚШ доллари",
    "броллер!E5": "Йилига 6 маротаба боқилади",
    "броллер!F5": "Тирик вазнда (2,5 кг)",
    "Родилеь!F5": "Йиллик тухум, дона",
    "Несушка!F5": "Йиллик тухум, дона",
    "Прородитель!F5": "Йиллик ота-она ишлаб чиқариш қуввати, дона",
    "Родилеь!L5": "Товуқ қиймати (ҳар бир бош жўжа 7 доллардан)",
    "Родилеь!M5": "Озуқа ва вакцина (ҳар бир бошга ўртача 7 доллардан)",
}
HEADER_CELLS = ["C4", "D4", "E4", "E5", "F5", "G5", "H4", "I4", "J4", "J5", "K5", "L5", "M5", "K3"]

# Facility names: the sheet text (whitespace collapsed) and what the slides show.
# If the sheet text changes, the script warns and falls back to the sheet text.
FARM = {"kind": "farm", "district": "Кегейли тумани"}
FACILITIES = {
    "Прородитель!B10": ("Кегейли тумани 1-фабрика прородитель (бир бино ўлчами 100*18)",
                        {**FARM, "name": "1-фабрика — прародитель", "size": "100 × 18 м"}),
    "Прородитель!B13": ("Инкубатория прородитель қуввати йилиги 3 млн дона",
                        {"kind": "hatchery", "name": "Инкубатория", "capacity": "йиллик қуввати 3 млн дона"}),
    "Прородитель!B16": ("Кеегейли тумани 2-фабрика рем молодняк (бир бино ўлчами 90*14,5)",
                        {**FARM, "name": "2-фабрика — рем молодняк", "size": "90 × 14,5 м"}),
    "Родилеь!B10": ("Кегейли тумани 1-фабрика родилеь (рем молодняк) (бир бино ўлчами 100*18)",
                    {**FARM, "name": "1-фабрика — родитель (рем молодняк)", "size": "100 × 18 м"}),
    "Родилеь!B13": ("Кегейли тумани 2-фабрика родитель (бир бино ўлчами 100*18)",
                    {**FARM, "name": "2-фабрика — родитель", "size": "100 × 18 м"}),
    "Родилеь!B16": ("Инкубатория бройлер қуввати 12 млн бош",
                    {"kind": "hatchery", "name": "Инкубатория", "capacity": "бройлер қуввати 12 млн бош"}),
    **{
        f"броллер!B{row}": (f"Кегейли тумани {n}-фабрика (бир бино ўлчами 100*18)",
                            {**FARM, "name": f"{n}-фабрика", "size": "100 × 18 м"})
        for n, row in enumerate([10, 13, 16, 19, 22], start=1)
    },
    "Несушка!B10": ("Кегейли тумани 1-фабрика (бир бино ўлчами 110*18)",
                    {**FARM, "name": "1-фабрика", "size": "110 × 18 м"}),
    "Несушка!B13": ("Кегейли тумани 2-фабрика (бир бино ўлчами 110*18)",
                    {**FARM, "name": "2-фабрика", "size": "110 × 18 м"}),
    "Несушка!B16": ("Кегейли тумани 3-фабрика (рем молодняк) (бир бино ўлчами 110*18)",
                    {**FARM, "name": "3-фабрика — рем молодняк", "size": "110 × 18 м"}),
}

SUPPLIERS = {
    "Биг хердсман Хитой": "Биг Хердсман, Хитой",
    "Е-фарминг Хитой": "Е-Фарминг, Хитой",
    "Е-Фарминг Хитой": "Е-Фарминг, Хитой",
    "Гуанжу поултринг Хитой": "Гуанжу Поултринг, Хитой",
    "Гунажу поултринг Хитой": "Гуанжу Поултринг, Хитой",
}

# Findings that need a human decision; the automatic ones (typed-in totals) are added at runtime.
STATIC_FLAGS = [
    {"level": "unit", "refs": ["Родилеь!I7:M18", "Несушка!I7:M18"],
     "text": "No unit on the cost columns. броллер!K3 and Прородитель!K3 say «1000 АКШ доллари»; Родилеь!L13 = 180 000 birds × $7 = 1 260 agrees.",
     "resolution": "Read as thousand USD."},
    {"level": "unit", "refs": ["Прородитель!G7", "Прородитель!G10"],
     "text": "Revenue has no unit; the other sheets give revenue in whole dollars. 3 000 000 parent chicks × $7 = $21 000 000.",
     "resolution": "Read as thousand USD ($21 млн), confirmed by you."},
    {"level": "unit", "refs": ["броллер!F5", "броллер!F7", "броллер!F10:F22"],
     "text": "Header says тн, but F = E × 2.5 kg per bird, so the values are kg. G = F × 1.8 ($ per kg) agrees.",
     "resolution": "Kept as kg in the JSON; slides show tonnes (15 750 т)."},
    {"level": "total", "refs": sorted(HIDDEN),
     "text": "Adds up «birds per building» across facilities; not a real total.",
     "resolution": "Not shown. Slides use E7 (Родитель 300 000, Прародитель 90 000)."},
    {"level": "total", "refs": ["Родилеь!C7", "Прородитель!C7"],
     "text": "Building count includes the incubator.",
     "resolution": "Shown with that note."},
    {"level": "minor", "refs": ["Родилеь!F7", "Несушка!F7", "Прородитель!F7"],
     "text": "Formula skips row 22, which is empty.", "resolution": "No effect."},
    {"level": "minor", "refs": ["броллер!J10"],
     "text": "Formula is =+J11++J12 (double plus).", "resolution": "No effect."},
    {"level": "minor", "refs": ["броллер!D13", "броллер!D16", "броллер!D19", "броллер!D22"],
     "text": "Typed-in 210 000, while D10 is =C10*70000.", "resolution": "Same value; no effect."},
    {"level": "minor", "refs": ["броллер!A23", "броллер!A24"],
     "text": "Numbered 6 and 7 instead of 5.1 and 5.2.", "resolution": "Numbering not used."},
    {"level": "minor", "refs": ["Родилеь!A19:M24", "Несушка!A19:M24", "Прородитель!A19:M24", "броллер!A25:M27", "броллер!B35"],
     "text": "Empty placeholder rows, and a stray «Жами» in броллер!B35.", "resolution": "Skipped."},
    {"level": "text", "refs": ["*!J4"],
     "text": "The cost group header repeats «Лойиҳа йўналиши» from B4.",
     "resolution": "Shown as «Харажатлар таркиби»."},
    {"level": "text", "refs": ["B10:B22"],
     "text": "Building sizes (100*18, 90*14,5, 110*18) have no unit.",
     "resolution": "Shown in metres (100 × 18 м)."},
    {"level": "text", "refs": ["sheet names", "B2", "B7", "B10:B22", "F5", "H10:H22", "M5"],
     "text": "Spelling: Родилеь, броллер, Прородитель, Кеегейли, Гунажу, Трик вазнда, ота на, доллрдан, Дастгох, Лойиха.",
     "resolution": "Fixed on the slides; the sheet's text is kept in the JSON as sheetText."},
]


def norm(text):
    return re.sub(r"\s+", " ", str(text)).strip()


def fix_words(text):
    for wrong, right in WORD_FIXES:
        text = text.replace(wrong, right)
    return text


def fmt(value):
    if value is None:
        return "—"
    if isinstance(value, float) and value.is_integer():
        value = int(value)
    return f"{value:,}".replace(",", " ") if isinstance(value, (int, float)) else str(value)


class Sheet:
    """One worksheet opened twice: formulas and the values Excel saved."""

    def __init__(self, wb_formulas, wb_values, name):
        self.name, self.f, self.v = name, wb_formulas[name], wb_values[name]
        self.corrected = {}

    def ref(self, cell):
        return f"{self.name}!{cell}"

    def formula(self, cell):
        raw = self.f[cell].value
        return raw if isinstance(raw, str) and raw.startswith("=") else None

    def value(self, cell):
        return self.corrected.get(cell, self.v[cell].value)

    def num(self, cell):
        item = {"value": self.value(cell), "ref": self.ref(cell)}
        if self.formula(cell):
            item["formula"] = self.formula(cell)
        if cell in self.corrected:
            item["sheetValue"] = self.v[cell].value
            item["note"] = "Typed-in value in the sheet; using J+K+L+M of the same row"
        if self.ref(cell) in HIDDEN:
            item["hidden"] = True
            item["note"] = "Sum of birds per building across facilities; not shown"
        return item

    def text(self, cell, shown=None):
        raw = self.v[cell].value
        shown = fix_words(norm(raw)) if shown is None else shown
        item = {"value": shown, "ref": self.ref(cell)}
        if raw is not None and shown != raw:
            item["sheetText"] = raw
        return item


def check_cached_values(sheet):
    """Recompute every formula from the saved inputs; a mismatch means the file wasn't recalculated."""
    problems, count = [], 0
    for row in sheet.f.iter_rows():
        for c in row:
            if not sheet.formula(c.coordinate):
                continue
            count += 1
            expr = re.sub(r"[A-Z]+\d+", lambda m: str(sheet.v[m.group(0)].value or 0), c.value[1:])
            if not re.fullmatch(r"[\d.+\-*/() ]+", expr):
                problems.append(f"{sheet.ref(c.coordinate)}: can't recompute {c.value}")
                continue
            if abs(eval(expr) - (sheet.v[c.coordinate].value or 0)) > 1e-9:  # noqa: S307 (digits and operators only)
                problems.append(f"{sheet.ref(c.coordinate)}: saved {sheet.v[c.coordinate].value}, formula gives {eval(expr)}")
    return count, problems


def find_typed_in_totals(sheet, rows):
    """I must equal J+K+L+M on every money row. Typed-in values that don't are corrected."""
    found = []
    for base in rows:
        for offset in MONEY_ROWS.values():
            r = base + offset
            parts = sum(sheet.v[f"{c}{r}"].value or 0 for c in "JKLM")
            if not sheet.formula(f"I{r}") and (sheet.v[f"I{r}"].value or 0) != parts:
                sheet.corrected[f"I{r}"] = parts
                found.append({"ref": sheet.ref(f"I{r}"), "sheetValue": sheet.v[f"I{r}"].value, "value": parts})
    return found


def check_sums(sheet, rows):
    """After corrections every money row, facility and total must add up."""
    v, bad = sheet.value, []
    money_rows = [7, 8, 9] + [base + o for base in rows for o in MONEY_ROWS.values()]
    for r in money_rows:
        if (v(f"I{r}") or 0) != sum(v(f"{c}{r}") or 0 for c in "JKLM"):
            bad.append(f"row {r}: I ≠ J+K+L+M")
    for c in COST_COLS:
        for base in rows:
            if (v(f"{c}{base}") or 0) != (v(f"{c}{base + 1}") or 0) + (v(f"{c}{base + 2}") or 0):
                bad.append(f"{c}{base} ≠ own + bank")
        for total_row, offset in ((7, 0), (8, 1), (9, 2)):
            if (v(f"{c}{total_row}") or 0) != sum(v(f"{c}{base + offset}") or 0 for base in rows):
                bad.append(f"{c}{total_row} ≠ sum of facilities")
    for c in "CEFG":
        if (v(f"{c}7") or 0) != sum(v(f"{c}{base}") or 0 for base in rows):
            bad.append(f"{c}7 ≠ sum of facilities")
    return bad


def money(sheet, row):
    return {key: sheet.num(f"{col}{row}") for col, key in COST_COLS.items()}


def facility(sheet, section, base, warnings):
    ref = sheet.ref(f"B{base}")
    expected, shown = FACILITIES[ref]
    raw = norm(sheet.v[f"B{base}"].value)
    if raw != expected:
        warnings.append(f"{ref} text changed in the sheet; showing the sheet text. Review FACILITIES in extract.py.")
        shown = {"name": fix_words(raw)}
    supplier_raw = norm(sheet.v[f"H{base}"].value)
    if supplier_raw not in SUPPLIERS:
        warnings.append(f"{sheet.ref(f'H{base}')} supplier «{supplier_raw}» is new; showing it as written.")
    per_building, total = section["birds"]
    return {
        **shown,
        "nameRef": sheet.text(f"B{base}", shown["name"]),
        "buildings": sheet.num(f"C{base}"),
        per_building: sheet.num(f"D{base}"),
        total: sheet.num(f"E{base}"),
        "output": sheet.num(f"F{base}"),
        "revenue": sheet.num(f"G{base}"),
        "supplier": sheet.text(f"H{base}", SUPPLIERS.get(supplier_raw, supplier_raw)),
        **{key: money(sheet, base + offset) for key, offset in MONEY_ROWS.items()},
    }


def section_json(sheet, section, warnings):
    per_building, total = section["birds"]
    headers = {}
    for cell in HEADER_CELLS:
        if sheet.v[cell].value is not None:
            shown = HEADER_TEXT.get(sheet.ref(cell), HEADER_TEXT.get(cell))
            headers[cell] = sheet.text(cell, shown)
    title_raw = sheet.v["B2"].value
    company = re.search(r'"([^"]+)"', title_raw).group(1)
    return {
        "id": section["id"],
        "title": section["title"],
        "subtitle": section["subtitle"],
        "sheet": section["sheet"],
        "company": company,
        "sheetTitle": {"value": norm(title_raw), "ref": sheet.ref("B2")},
        "units": section["units"],
        "headers": headers,
        "totals": {
            "label": sheet.text("B7"),
            "buildings": sheet.num("C7"),
            per_building: sheet.num("D7"),
            total: sheet.num("E7"),
            "output": sheet.num("F7"),
            "revenue": sheet.num("G7"),
            "country": sheet.text("H7"),
            **{key: money(sheet, 7 + offset) for key, offset in MONEY_ROWS.items()},
        },
        "facilities": [facility(sheet, section, base, warnings) for base in section["rows"]],
    }


def summary_json(sections):
    def total(path):
        items = [s["totals"][path[0]][path[1]] if len(path) == 2 else s["totals"][path[0]] for s in sections]
        return {"value": sum(i["value"] or 0 for i in items), "sumOf": [i["ref"] for i in items]}

    hatcheries = [f["nameRef"]["ref"] for s in sections for f in s["facilities"] if f.get("kind") == "hatchery"]
    return {
        "note": "Computed from the four section sheets only. Revenue is listed, not summed: part of one section's output is another section's input.",
        **{key: {col: total((key, col)) for col in COST_COLS.values()} for key in MONEY_ROWS},
        "buildings": total(("buildings",)),
        "hatcheries": {"value": len(hatcheries), "refs": hatcheries},
        "outputs": [{"section": s["id"], **s["totals"]["output"], "unit": s["units"]["output"]["unit"]} for s in sections],
        "revenues": [{"section": s["id"], **s["totals"]["revenue"], "unit": s["units"]["revenue"]["unit"]} for s in sections],
    }


# ---------- verification.md ----------

def cell_md(item):
    if item is None or item.get("value") is None:
        return "—"
    text = fmt(item["value"])
    if "sheetValue" in item:
        return f"**{text}** ⚠ (sheet: {fmt(item['sheetValue'])})"
    if item.get("hidden"):
        return f"~~{text}~~"
    return f"*{text}*" if "formula" in item else text


def matrix_md(sec, section):
    per_building, total = section["birds"]
    lab = {"C": "Бино", "I": "Жами", "J": "Қурилиш", "K": "Дастгоҳ", "M": "Озуқа", **section["labels"]}
    cols = "CDEFGIJKLM"
    lines = ["| Row | B | " + " | ".join(f"{c} · {lab[c]}" for c in cols) + " |",
             "|---:|---|" + "---:|" * len(cols)]

    def row(r, label, item_for):
        lines.append(f"| {r} | {label} | " + " | ".join(cell_md(item_for(c)) for c in cols) + " |")

    def top(t):
        keyed = {"C": t.get("buildings"), "D": t.get(per_building), "E": t.get(total),
                 "F": t.get("output"), "G": t.get("revenue")}
        return lambda c: keyed[c] if c in keyed else t["cost"][COST_COLS[c]]

    def sub(t, key):
        return lambda c: t[key][COST_COLS[c]] if c in COST_COLS else None

    t = sec["totals"]
    row(7, "**" + t["label"]["value"] + "**", top(t))
    row(8, "↳ ўз маблағи", sub(t, "own"))
    row(9, "↳ банк кредити", sub(t, "bank"))
    for base, f in zip(section["rows"], sec["facilities"]):
        row(base, "**" + f["name"] + "**", top(f))
        row(base + 1, "↳ ўз маблағи", sub(f, "own"))
        row(base + 2, "↳ банк кредити", sub(f, "bank"))
    return lines


def text_md(sec):
    lines = ["| Cell | In the sheet | On the slides |", "|---|---|---|"]
    items = [sec["sheetTitle"] | {"shown": f"{sec['title']} — {sec['subtitle']}"}, sec["totals"]["label"], sec["totals"]["country"]]
    for f in sec["facilities"]:
        extra = " · ".join(x for x in (f.get("size"), f.get("capacity"), f.get("district")) if x)
        items.append(f["nameRef"] | {"shown": f["name"] + (f" · {extra}" if extra else "")})
        items.append(f["supplier"])
    for it in items:
        sheet_text = norm(it.get("sheetText", it["value"]))
        lines.append(f"| {it['ref'].split('!')[1]} | {sheet_text} | {it.get('shown', it['value'])} |")
    return lines


def full_list_md(sections):
    lines = ["| # | Section | What | Value | Cell | Formula | Note |", "|---:|---|---|---:|---|---|---|"]
    n = 0
    names = {"total": "Лойиҳа қиймати", "construction": "Қурилишга", "equipment": "Дастгоҳга", "chickens": "Товуқ/жўжа", "feed": "Озуқа"}
    parts = {"cost": "", "own": " · ўз маблағи", "bank": " · банк кредити"}

    def add(section, what, item):
        nonlocal n
        n += 1
        formula = f"`{item['formula']}`" if item.get("formula") else ""
        note = item.get("note", "")
        if "sheetValue" in item:
            note = f"sheet has {fmt(item['sheetValue'])}; {note}"
        lines.append(f"| {n} | {section} | {what} | {fmt(item['value'])} | {item['ref']} | {formula} | {note} |")

    bird_names = {"birdsPerBuilding": "бош (1 бинода)", "birds": "жами бош",
                  "birdsPerBatch": "бош (1 боқишда)", "birdsPerYear": "бош (йилига)"}
    for s in sections:
        pb, tb = s["birds_keys"]
        for owner, prefix in [(s["totals"], "Жами")] + [(f, f["name"]) for f in s["facilities"]]:
            add(s["title"], f"{prefix} · бино сони", owner["buildings"])
            add(s["title"], f"{prefix} · {bird_names[pb]}", owner[pb])
            add(s["title"], f"{prefix} · {bird_names[tb]}", owner[tb])
            add(s["title"], f"{prefix} · маҳсулот", owner["output"])
            add(s["title"], f"{prefix} · тушум", owner["revenue"])
            for key, suffix in parts.items():
                for col, name in names.items():
                    add(s["title"], f"{prefix}{suffix} · {name}", owner[key][col])
    return lines


def write_markdown(data, checks, flags, merged, warnings):
    order = {s["id"]: s for s in SECTIONS}
    md = [
        "# Кегейли.xlsx → kegeyli.json: check table",
        "",
        f"Source `{data['meta']['source']}` · SHA-256 `{data['meta']['sha256'][:16]}…` · extracted {data['meta']['extractedAt']}",
        "",
        "Regenerate with `.venv/bin/python scripts/extract.py`. Every number below comes from the JSON the slides use.",
        "",
        "**How to read the tables:** the cell address is the column letter plus the row number (column `I` in row `7` is `I7`).",
        "*Italic* = the cell holds a formula in Excel · **bold ⚠** = changed from the sheet · ~~struck~~ = not shown on slides · — = empty cell.",
        "",
        "## Automatic checks",
        "",
        *[f"- {line}" for line in checks],
        *([f"- ⚠ {w}" for w in warnings] or []),
        "",
        "## Flags",
        "",
        "| # | Kind | Cells | Problem | What we do |",
        "|---:|---|---|---|---|",
        *[f"| {i} | {f['level']} | {', '.join(f['refs'])} | {f['text']} | {f['resolution']} |" for i, f in enumerate(flags, 1)],
        "",
        "## Merged cells",
        "",
        "Only titles and column headers are merged; no number sits inside a merged range. The text lives in the top-left cell.",
        "",
        "| Sheet | Merged ranges |",
        "|---|---|",
        *[f"| {name} | {', '.join(ranges)} |" for name, ranges in merged.items()],
        "",
    ]
    for i, sec in enumerate(data["sections"], 2):
        section = order[sec["id"]]
        u = sec["units"]
        md += [
            f"## Slide {i} · {sec['title']} — sheet `{sec['sheet']}`",
            "",
            f"Units: I–M in **{u['cost']['unit']}** · G revenue in **{u['revenue']['unit']}** · F output in **{u['output']['unit']}** ({u['output']['what']})",
            "",
            *text_md(sec),
            "",
            *matrix_md(sec, section),
            "",
        ]
    s = data["summary"]
    md += [
        "## Slide 6 · Жами (computed from the four sheets)",
        "",
        "| What | Value, thousand $ | Sum of |",
        "|---|---:|---|",
        *[f"| {part} · {col} | {fmt(s[part][col]['value'])} | {', '.join(s[part][col]['sumOf'])} |"
          for part in MONEY_ROWS for col in COST_COLS.values()],
        f"| buildings | {fmt(s['buildings']['value'])} | {', '.join(s['buildings']['sumOf'])} |",
        f"| incubators among them | {s['hatcheries']['value']} | {', '.join(s['hatcheries']['refs'])} |",
        "",
        "## Full list (one line per value)",
        "",
        *full_list_md([{**sec, "birds_keys": order[sec["id"]]["birds"]} for sec in data["sections"]]),
        "",
    ]
    OUT_MD.parent.mkdir(parents=True, exist_ok=True)
    OUT_MD.write_text("\n".join(md), encoding="utf-8")


def main():
    if not SOURCE.exists():
        sys.exit(f"Spreadsheet not found: {SOURCE}")
    wb_f = openpyxl.load_workbook(SOURCE, data_only=False)
    wb_v = openpyxl.load_workbook(SOURCE, data_only=True)

    checks, flags, warnings, merged, sections = [], [], [], {}, []
    for section in SECTIONS:
        sheet = Sheet(wb_f, wb_v, section["sheet"])
        for cell, expected in (("B8", "ўз маблағи"), ("B9", "банк кредити"), ("I4", "Лойиҳани қиймати")):
            if norm(sheet.v[cell].value) != expected:
                sys.exit(f"{sheet.ref(cell)} is «{sheet.v[cell].value}», expected «{expected}». The layout changed; update extract.py.")
        count, stale = check_cached_values(sheet)
        if stale:
            sys.exit("Saved values don't match the formulas. Open the file in Excel, save it, and run again:\n" + "\n".join(stale))
        checks.append(f"`{sheet.name}`: all {count} formulas give the value Excel saved.")
        for fix in find_typed_in_totals(sheet, section["rows"]):
            flags.append({"level": "error", "refs": [fix["ref"]],
                          "text": f"Typed-in {fmt(fix['sheetValue'])} where J+K+L+M of the same row gives {fmt(fix['value'])}; the two sub-rows then don't add up to the facility row.",
                          "resolution": f"Using {fmt(fix['value'])}. Section totals (rows 7–9) are built from J–M, so they don't change."})
        bad = check_sums(sheet, section["rows"])
        fixed = f" (after the fix in {', '.join(sheet.corrected)})" if sheet.corrected else ""
        checks.append(f"`{sheet.name}`: own + bank = facility, facilities = total, I = J+K+L+M on every row{fixed}: "
                      + ("all pass." if not bad else "FAIL — " + "; ".join(bad)))
        merged[sheet.name] = [f"{r} («{norm(sheet.v[str(r).split(':')[0]].value or '')[:40]}»)"
                              for r in sorted(sheet.f.merged_cells.ranges, key=str)]
        sections.append(section_json(sheet, section, warnings))

    companies = {s["company"] for s in sections}
    if len(companies) != 1:
        warnings.append(f"Company name differs between sheets: {companies}")
    data = {
        "meta": {
            "source": str(SOURCE.relative_to(ROOT)) if SOURCE.is_relative_to(ROOT) else str(SOURCE),
            "sha256": hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
            "extractedAt": dt.datetime.now().isoformat(timespec="seconds"),
            "company": sections[0]["company"],
            "units": {"kUSD": "thousand US dollars", "USD": "US dollars", "kg": "kilograms", "pcs": "pieces"},
        },
        "sections": sections,
        "summary": summary_json(sections),
        "flags": flags + STATIC_FLAGS,
    }
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    write_markdown(data, checks, data["flags"], merged, warnings)
    print(f"Wrote {OUT_JSON.relative_to(ROOT)} and {OUT_MD.relative_to(ROOT)}")
    for line in checks + [f"WARNING: {w}" for w in warnings]:
        print(" -", line)


if __name__ == "__main__":
    main()
