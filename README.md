# Кегейли Барака Наслли Парранда: credit plan slides

Six 16:9 slides (React + Tailwind + GSAP) built from `data/Кегейли.xlsx`:
cover → Прародитель → Родитель → Бройлер → Несушка → Жами.

The four section slides come from their own sheets. The cover and Жами totals come from the
client's summary sheet «Жами Лойиҳа Кегели». That sheet adds three lines without a slide of
their own: processing (Дастгох), the feed reserve and the generator.

## Run

```bash
npm install
npm run dev          # http://localhost:5173
```

`npm run build` makes a static copy in `dist/` (`npm run preview` serves it).

## Presenting

| Key | Action |
|---|---|
| → ↓ Space PageDown | next slide |
| ← ↑ PageUp | previous slide |
| 1–6, Home, End | jump to a slide |
| F | fullscreen |
| S | show the spreadsheet cell behind every number |
| ⌘P / Ctrl+P | PDF: one slide per page, final numbers, no animation |

Keys work on a Cyrillic keyboard layout too. `#3` in the address bar opens slide 3;
`?print` shows the PDF layout on screen.

## Changing the numbers

Never edit numbers in the components. Change the spreadsheet, then:

```bash
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt   # first time only
npm run extract
```

`scripts/extract.py` reads the four section sheets and «Жами Лойиҳа Кегели», re-checks every
formula against the value Excel saved (including links between sheets), checks that the summary's
four section rows match their sheets cell for cell, and writes:

- `src/data/kegeyli.json`: every value with its sheet!cell, formula and notes
- `docs/verification.md`: the same values laid out like the sheet, to check against Excel

It stops with a message if the sheet layout changed or the file wasn't recalculated in Excel.
Summary lines are found by their text in column B, so adding rows there is fine.
If a money row's typed-in total doesn't match J+K+L+M, the extractor uses J+K+L+M and lists it
in the Flags table of `docs/verification.md` (the 27.09.2026 file has none).

To move money between bank credit and own funds without editing the sheet, add an entry to
`ADJUSTMENTS` in `scripts/extract.py`; every total on that sheet is recalculated.

## Photos

Put an image URL (or a file placed in `public/photos/`) in `src/data/photos.ts`.
Empty entries show a branded placeholder in the same spot.

## Where things are

- `src/data/deck.ts`: turns the JSON into slide figures (rounding keeps parts adding up to totals)
- `src/slides/`: the three slide layouts (cover, section, total)
- `src/components/`: charts, cards, header and footer
- `src/lib/motion.ts`: GSAP entrance animations
- Brand colours and fonts: `src/index.css` (`@theme`)
