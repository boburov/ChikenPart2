// Turns kegeyli.json into slide-ready figures. Every figure keeps the cells it
// came from (`src`), which the S key shows on the slides.
import raw from './kegeyli.json'
import { formatNumber } from '../lib/format'
import { splitRound } from '../lib/round'
import type { Cell, CostKey, DeckData, Facility, Land, LineId, Money, ProcessingGroup, ProcessingItem, ProcessingMoney, Section, SectionId, Summed, Totals, Unit } from './types'

export const data = raw as unknown as DeckData

/** The joint-venture banner from the client's picture (moved here from the Барака Ҳамкор deck). */
export const JOINT_VENTURE = {
  label: 'Қўшма корхона',
  partners: [
    { flag: 'uz', name: '“KEGEYLI BARAKA NASLLI PARRANDA” H.K' },
    { flag: 'cn', name: '“BEIJING HUA DU YOUKOU POULTRY CO., LTD”' },
  ],
}

export const DECK = {
  brand: 'Shuxrat ōgli',
  byline: 'By «Baraka hamkor parranda» XK',
  company: data.meta.company,
  plan: 'Кредитга бўлган талаб режаси',
  year: '2026',
  district: 'Кегейли тумани',
  source: 'Кегейли.xlsx',
}

/** A number ready to show, with the spreadsheet cells it came from. */
export interface Fig {
  value: number
  decimals: number
  /** Drop trailing zeros: 21,00 → 21, 21,50 → 21,5. */
  trim?: boolean
  src: string[]
}

type Source = Cell | Summed
const val = (c?: Source | null) => c?.value ?? 0
const refsOf = (c: Source) => ('ref' in c ? [c.ref] : c.sumOf)

// The sheets keep money in thousand $. Slides show million $ with two decimals,
// so one rounding step is 10 thousand $.
const MLN_STEP = 10
const mln = (steps: number, src: string[], trim = false): Fig => ({ value: steps / 100, decimals: 2, trim, src })
const exact = (value: number, src: string[]): Fig => ({ value, decimals: 0, src })

/** Land area, e.g. 8,4 га or 15 га. The source is the client, not the spreadsheet. */
const hectares = (land?: Land): Fig | undefined => (land ? { value: land.value, decimals: 1, trim: true, src: [land.ref] } : undefined)

const thousands = (cell: Cell, unit: Unit) => (unit === 'USD' ? val(cell) / 1000 : val(cell))

/** 3 000 000 → "3" + "млн", 6 300 000 → "6,3" + "млн"; below a million, the exact count. */
function short(count: number, src: string[]): { fig: Fig; prefix: string } {
  return count >= 1_000_000
    ? { fig: { value: Math.round(count / 10_000) / 100, decimals: 2, trim: true, src }, prefix: 'млн' }
    : { fig: exact(count, src), prefix: '' }
}

export interface Financing {
  total: Fig
  bank: Fig
  own: Fig
  bankPct: Fig
  ownPct: Fig
  exact: { total: number; bank: number; own: number }
}

/** `target`: the total in rounding steps when it is fixed elsewhere (see LINE_STEPS). */
function financing(total: Source, bank: Source, own: Source, target?: number): Financing {
  const [b, o] = splitRound([val(bank), val(own)], MLN_STEP, target)
  const [bp, op] = splitRound([val(bank), val(own)], val(total) / 100)
  return {
    total: mln(b + o, refsOf(total), true),
    bank: mln(b, refsOf(bank)),
    own: mln(o, refsOf(own)),
    bankPct: exact(bp, [...refsOf(bank), ...refsOf(total)]),
    ownPct: exact(op, [...refsOf(own), ...refsOf(total)]),
    exact: { total: val(total), bank: val(bank), own: val(own) },
  }
}

export const COST_KEYS: CostKey[] = ['construction', 'equipment', 'chickens', 'feed']

export interface CostRow {
  key: CostKey
  total: Fig
  bank: Fig
  own: Fig
  share: Fig
  exact: { total: number; bank: number; own: number }
}

type MoneyLike = Record<keyof Money, Source>

/** The four cost types, rounded so they add up to the rounded project cost. */
function costRows(cost: MoneyLike, bank: MoneyLike, own: MoneyLike, target?: number): CostRow[] {
  const totals = splitRound(COST_KEYS.map((k) => val(cost[k])), MLN_STEP, target)
  const shares = splitRound(COST_KEYS.map((k) => val(cost[k])), val(cost.total) / 100)
  return COST_KEYS.map((key, i) => {
    const [b, o] = splitRound([val(bank[key]), val(own[key])], MLN_STEP, totals[i])
    return {
      key,
      total: mln(totals[i], refsOf(cost[key])),
      bank: mln(b, refsOf(bank[key])),
      own: mln(o, refsOf(own[key])),
      share: exact(shares[i], [...refsOf(cost[key]), ...refsOf(cost.total)]),
      exact: { total: val(cost[key]), bank: val(bank[key]), own: val(own[key]) },
    }
  })
}

export interface FacilityRow {
  label: string
  fig: Fig
  unit: string
  hint?: string
}

export interface FacilityView {
  name: string
  kind: 'farm' | 'hatchery'
  size?: string
  district?: string
  capacity?: string
  nameSrc: string[]
  supplier: string
  supplierSrc: string[]
  buildings: Fig
  land?: Fig
  rows: FacilityRow[]
  /** Exact, in thousand $: the facility cards are the "table" part of a slide. */
  cost: { total: Fig; bank: Fig; own: Fig }
}

const OUTPUT_ROW: Record<SectionId, { label: string; unit: string }> = {
  praroditel: { label: 'Родитель жўжа', unit: 'бош / йил' },
  roditel: { label: 'Тухум', unit: 'дона / йил' },
  broiler: { label: 'Тирик вазн', unit: 'т / йил' },
  nesushka: { label: 'Тухум', unit: 'дона / йил' },
}

function facilityView(section: Section, f: Facility): FacilityView {
  const rows: FacilityRow[] = []
  if (f.birds?.value) {
    const per = f.birdsPerBuilding?.value
    rows.push({
      label: 'Бош сони',
      fig: exact(f.birds.value, [f.birds.ref]),
      unit: 'бош',
      hint: per ? `ҳар бинода ${formatNumber(per)}` : undefined,
    })
  }
  if (f.output.value) {
    rows.push({ ...OUTPUT_ROW[section.id], fig: exact(f.output.value, [f.output.ref]) })
  }
  if (f.revenue.value) {
    const revenue = thousands(f.revenue, section.units.revenue.unit)
    rows.push({ label: 'Тушум', fig: exact(revenue, [f.revenue.ref]), unit: 'минг $ / йил' })
  }
  return {
    name: f.name,
    kind: f.kind,
    size: f.size,
    district: f.district,
    capacity: f.capacity,
    nameSrc: [f.nameRef.ref],
    supplier: f.supplier.value ?? '',
    supplierSrc: [f.supplier.ref],
    buildings: exact(val(f.buildings), [f.buildings.ref]),
    land: hectares(f.land),
    rows,
    cost: {
      total: exact(val(f.cost.total), [f.cost.total.ref]),
      bank: exact(val(f.bank.total), [f.bank.total.ref]),
      own: exact(val(f.own.total), [f.own.total.ref]),
    },
  }
}

export interface GroupRow {
  label: string
  unit: string
  each: Fig
  total: Fig
  strong?: boolean
}

/** Бройлер: identical factories shown as one card, one factory next to all of them. */
export interface GroupView {
  count: number
  label: string
  size?: string
  district?: string
  supplier: string
  supplierSrc: string[]
  /** Buildings, birds, output, revenue. */
  production: GroupRow[]
  /** Project cost and how it is financed. */
  money: GroupRow[]
  exact: { bank: number; own: number }
}

function groupView(section: Section): GroupView | undefined {
  const fs = section.facilities
  const money = (m: Money) => Object.values(m).map((c) => c.value)
  const numbers = (f: Facility) =>
    JSON.stringify([f.buildings.value, f.birdsPerBatch?.value, f.birdsPerYear?.value, f.output.value, f.revenue.value,
      money(f.cost), money(f.own), money(f.bank), f.supplier.value])
  if (fs.length < 2 || new Set(fs.map(numbers)).size !== 1) return undefined

  const t = section.totals
  const row = (label: string, unit: string, pick: (b: Facility | Totals) => Cell | undefined, scale = 1, strong = false): GroupRow => ({
    label,
    unit,
    each: exact(val(pick(fs[0])) / scale, fs.map((f) => pick(f)!.ref)),
    total: exact(val(pick(t)) / scale, [pick(t)!.ref]),
    strong,
  })
  return {
    count: fs.length,
    label: `1–${fs.length}-фабрика`,
    size: fs[0].size,
    district: fs[0].district,
    supplier: fs[0].supplier.value ?? '',
    supplierSrc: fs.map((f) => f.supplier.ref),
    production: [
      ...(fs[0].land && t.land ? [row('Ер майдони', 'га', (b) => b.land)] : []),
      row('Бинолар', 'та', (b) => b.buildings),
      row('Бир боқишда', 'бош', (b) => b.birdsPerBatch),
      row('Йилига (6 боқиш)', 'бош', (b) => b.birdsPerYear),
      row('Тирик вазн', 'т / йил', (b) => b.output, 1000),
      row('Тушум', 'минг $ / йил', (b) => b.revenue, 1000),
    ],
    money: [
      row('Лойиҳа қиймати', 'минг $', (b) => b.cost.total, 1, true),
      row('банк кредити', 'минг $', (b) => b.bank.total),
      row('ўз маблағи', 'минг $', (b) => b.own.total),
    ],
    exact: { bank: val(t.bank.total), own: val(t.own.total) },
  }
}

export interface Stat {
  key: 'revenue' | 'birds' | 'buildings'
  label: string
  fig: Fig
  prefix?: string
  unit: string
  hint?: string
}

export interface SectionView {
  id: SectionId
  slide: number
  title: string
  subtitle: string
  country: string
  countrySrc: string[]
  land?: Fig
  output: { label: string; fig: Fig; prefix: string; unit: string }
  revenue: Fig
  stats: Stat[]
  financing: Financing
  costs: CostRow[]
  facilities: FacilityView[]
  group?: GroupView
}

const project = data.project

// The Жами slide splits the grand total across the project lines, and each section page rounds
// to that same share, so the figures on every slide add up to the cover's total.
const LINE_STEPS = splitRound(project.lines.map((l) => val(l.cost.total)), MLN_STEP)
const lineSteps = (id: LineId) => LINE_STEPS[project.lines.findIndex((l) => l.id === id)]

// Прародитель's product is родитель chicks: «3 млн бош родитель жўжа», never «3 млн» alone
// under the Прародитель title (the client read that as 3 млн прародитель birds).
const OUTPUT_UNIT: Record<SectionId, string> = {
  praroditel: 'бош родитель жўжа / йил',
  roditel: 'тухум / йил',
  broiler: 'гўшт (тирик вазнда) / йил',
  nesushka: 'тухум / йил',
}

const FLOCK_LABEL: Record<SectionId, string> = {
  praroditel: 'Прародитель галаси',
  roditel: 'Родитель галаси',
  broiler: 'Йилига парранда',
  nesushka: 'Тухум товуқлари',
}

function sectionView(section: Section, slide: number): SectionView {
  const t = section.totals
  const out = val(t.output)
  const output =
    section.units.output.unit === 'kg'
      ? { fig: exact(out / 1000, [t.output.ref]), prefix: 'т' }
      : short(out, [t.output.ref])

  const revenue = mln(Math.round(thousands(t.revenue, section.units.revenue.unit) / MLN_STEP), [t.revenue.ref], true)
  const hatcheries = section.facilities.filter((f) => f.kind === 'hatchery').length

  let birds: Stat
  if (t.birdsPerYear) {
    const { fig, prefix } = short(val(t.birdsPerYear), [t.birdsPerYear.ref])
    birds = { key: 'birds', label: 'Йилига парранда', fig, prefix, unit: 'бош', hint: `${formatNumber(val(t.birdsPerBatch))} × 6 боқиш` }
  } else {
    // The generation's own flock («Прародитель галаси 60 000 бош»), with the рем молодняк farms
    // (young replacement stock) beside it rather than folded into one «Жами бош 90 000».
    const farms = section.facilities.filter((f) => f.kind === 'farm' && f.birds?.value)
    const young = farms.filter((f) => f.name.includes('рем молодняк'))
    const main = farms.filter((f) => !young.includes(f))
    const heads = (fs: Facility[]) => fs.reduce((a, f) => a + val(f.birds), 0)
    birds = {
      key: 'birds',
      label: FLOCK_LABEL[section.id],
      fig: exact(heads(main), main.map((f) => f.birds!.ref)),
      unit: 'бош',
      hint: young.length ? `+ ${formatNumber(heads(young))} рем молодняк` : undefined,
    }
  }

  return {
    id: section.id,
    slide,
    title: section.title,
    subtitle: section.subtitle,
    country: t.country.value ?? '',
    countrySrc: [t.country.ref],
    land: hectares(t.land),
    output: { label: 'Йиллик ишлаб чиқариш', ...output, unit: OUTPUT_UNIT[section.id] },
    revenue,
    stats: [
      { key: 'revenue', label: 'Йиллик тушум', fig: revenue, prefix: 'млн', unit: '$' },
      birds,
      {
        key: 'buildings',
        label: 'Бинолар',
        fig: exact(val(t.buildings), [t.buildings.ref]),
        unit: 'та',
        hint: hatcheries ? `${hatcheries} таси инкубация цехи` : undefined,
      },
    ],
    financing: financing(t.cost.total, t.bank.total, t.own.total, lineSteps(section.id)),
    costs: costRows(t.cost, t.bank, t.own, lineSteps(section.id)),
    facilities: section.facilities.map((f) => facilityView(section, f)),
    group: groupView(section),
  }
}

// Slide 3 is the WOD-188-2 poster (WodSlide), so the sections after Прародитель move one down.
export const SECTIONS: SectionView[] = data.sections.map((sec, i) => sectionView(sec, i === 0 ? 2 : i + 3))

const sum = data.summary
const totalFinancing = financing(project.cost.total, project.bank.total, project.own.total)
const lineShares = splitRound(project.lines.map((l) => val(l.cost.total)), val(project.cost.total) / 100)
const feedReserve = project.lines.find((l) => l.id === 'feedReserve')

/** What a line without a slide of its own consists of (the дастгох sheet's items). */
const LINE_HINT: Partial<Record<LineId, string>> = { processing: 'сўйиш цехи, музлаткич, ем завод' }

export const SUMMARY = {
  /** The client's grand totals: the four sections, processing, the feed reserve and the generator. */
  financing: totalFinancing,
  costs: costRows(project.cost, project.bank, project.own),
  /** Every project line with its share of the grand total. */
  byLine: project.lines.map((l, i) => ({
    id: l.id,
    title: l.title,
    // «22 та», as counts read everywhere else (the sheet's text says «22 дона»)
    hint: l.count ? `${formatNumber(l.count.value)} та` : LINE_HINT[l.id],
    total: mln(LINE_STEPS[i], [l.cost.total.ref], true),
    share: exact(lineShares[i], [l.cost.total.ref, project.cost.total.ref]),
    exact: { total: val(l.cost.total), bank: val(l.bank.total), own: val(l.own.total) },
  })),
  /** Lines without a slide, named on the cover so that its total reads right. */
  extras: project.lines.filter((l) => !l.section).map((l) => l.title),
  buildings: exact(sum.buildings.value, sum.buildings.sumOf),
  hatcheries: exact(sum.hatcheries.value, sum.hatcheries.refs),
  land: hectares(sum.land),
  /** The feed reserve line: all bank credit. */
  feedReserve: feedReserve ? mln(lineSteps('feedReserve'), [feedReserve.cost.total.ref], true) : undefined,
  /** «Жами кредит» equals the bank credit total (extract.py checks it), so it reuses that rounding. */
  totalCredit: { ...totalFinancing.bank, trim: true, src: [project.totalCredit.ref] },
}

// ---------- Қайта ишлаш (the дастгох sheet), just before Жами ----------

const proc = data.processing
export const PROCESSING_GROUPS: ProcessingGroup[] = ['slaughter', 'cold', 'feedmill', 'transport']

/** Thousand $ as the sheet has it: 292,5 or 1 200. */
const kusd = (value: number, src: string[]): Fig => ({ value, decimals: 1, trim: true, src })
/** The first number in a capacity text: «3 000 бош/соат» → 3000, «20 т/соат» → 20. */
const leadingNumber = (text?: string | null) => Number((text ?? '').match(/^[\d\s]+/)?.[0].replace(/\s/g, '') ?? 0)

export interface ProcessingBar {
  key: string
  label: string
  total: Fig
  share: Fig
  exact: { total: number; bank: number; own: number }
}

/** Rows rounded to 0,01 млн $ so they add up to the page total, and shares to 100%. */
function processingBars(rows: { key: string; label: string; cost: Cell[]; bank: Cell[]; own: Cell[] }[], target: number): ProcessingBar[] {
  const sum = (cells: Cell[]) => cells.reduce((a, c) => a + val(c), 0)
  const totals = rows.map((r) => sum(r.cost))
  const steps = splitRound(totals, MLN_STEP, target)
  const shares = splitRound(totals, totals.reduce((a, b) => a + b, 0) / 100)
  return rows.map((r, i) => ({
    key: r.key,
    label: r.label,
    total: mln(steps[i], r.cost.map((c) => c.ref)),
    share: exact(shares[i], r.cost.map((c) => c.ref)),
    exact: { total: totals[i], bank: sum(r.bank), own: sum(r.own) },
  }))
}

function processingView() {
  // Rounded to the same 0,01 млн $ as the Қайта ишлаш line on the Жами slide (5 657 → 5,66).
  const steps = lineSteps('processing')
  const items = proc.items
  const inGroup = (g: ProcessingGroup) => items.filter((i) => i.group === g)
  const first = (g: ProcessingGroup) => inGroup(g)[0]
  const slaughter = first('slaughter')
  const feedmill = first('feedmill')
  const cold = first('cold')
  const transport = inGroup('transport')
  const countries = [...new Set(items.map((i) => i.country.value ?? '').filter(Boolean))]
  const pick = (key: 'cost' | 'bank' | 'own', col: keyof ProcessingMoney) => (list: ProcessingItem[]) => list.map((i) => i[key][col])

  return {
    title: 'Қайта ишлаш',
    subtitle: 'Сўйиш, музлаткич, ем завод ва транспорт',
    countries: countries.join(', '),
    countriesSrc: items.map((i) => i.country.ref),
    positions: items.length,
    hero: { label: 'Сўйиш цехи қуввати', fig: exact(leadingNumber(slaughter.capacity?.value), [slaughter.capacity?.ref ?? slaughter.name.ref]), unit: 'бош / соат' },
    stats: [
      { key: 'feedmill', label: 'Ем завод', fig: exact(leadingNumber(feedmill.capacity?.value), [feedmill.capacity?.ref ?? feedmill.name.ref]), unit: 'т / соат' },
      { key: 'cold', label: 'Музлаткич', fig: exact(leadingNumber(cold.capacity?.value), [cold.capacity?.ref ?? cold.name.ref]), unit: 'т' },
      { key: 'transport', label: 'Махсус транспорт', fig: exact(transport.reduce((a, i) => a + val(i.count), 0), transport.map((i) => i.count.ref)), unit: 'та' },
    ],
    financing: financing(proc.cost.total, proc.bank.total, proc.own.total, steps),
    costs: processingBars(
      (['construction', 'equipment'] as const).map((col) => ({
        key: col,
        label: col === 'construction' ? 'Қурилиш' : 'Дастгоҳ',
        cost: [proc.cost[col]],
        bank: [proc.bank[col]],
        own: [proc.own[col]],
      })),
      steps,
    ),
    groups: processingBars(
      PROCESSING_GROUPS.map((g) => ({
        key: g,
        label: proc.groups[g],
        cost: pick('cost', 'total')(inGroup(g)),
        bank: pick('bank', 'total')(inGroup(g)),
        own: pick('own', 'total')(inGroup(g)),
      })),
      steps,
    ),
    table: PROCESSING_GROUPS.map((g) => {
      const list = inGroup(g)
      const col = (key: 'cost' | 'bank' | 'own', c: keyof ProcessingMoney) => {
        const cells = pick(key, c)(list)
        return kusd(cells.reduce((a, x) => a + val(x), 0), cells.map((x) => x.ref))
      }
      return {
        key: g,
        label: proc.groups[g],
        subtotal: [col('cost', 'construction'), col('cost', 'equipment'), col('cost', 'total'), col('bank', 'total'), col('own', 'total')],
        rows: list.map((i) => ({
          key: String(i.row),
          name: i.name.value ?? '',
          nameSrc: [i.name.ref],
          count: exact(val(i.count), [i.count.ref]),
          capacity: i.capacity ? { text: i.capacity.value ?? '', src: [i.capacity.ref] } : null,
          country: { text: i.country.value ?? '', src: [i.country.ref] },
          money: [
            kusd(val(i.cost.construction), [i.cost.construction.ref]),
            kusd(val(i.cost.equipment), [i.cost.equipment.ref]),
            kusd(val(i.cost.total), [i.cost.total.ref]),
            kusd(val(i.bank.total), [i.bank.total.ref]),
            kusd(val(i.own.total), [i.own.total.ref]),
          ],
        })),
      }
    }),
    total: [
      kusd(val(proc.cost.construction), [proc.cost.construction.ref]),
      kusd(val(proc.cost.equipment), [proc.cost.equipment.ref]),
      kusd(val(proc.cost.total), [proc.cost.total.ref]),
      kusd(val(proc.bank.total), [proc.bank.total.ref]),
      kusd(val(proc.own.total), [proc.own.total.ref]),
    ],
    generator: project.lines.find((l) => l.id === 'generator'),
  }
}

export const PROCESSING = processingView()

export type SlideId = 'cover' | SectionId | 'company' | 'total' | 'processing' | 'processing-table'
export const SLIDES: { id: SlideId; title: string }[] = [
  { id: 'cover', title: 'Муқова' },
  ...SECTIONS.flatMap((sec, i) => [
    { id: sec.id as SlideId, title: sec.title },
    ...(i === 0 ? [{ id: 'company' as SlideId, title: 'WOD-188-2 товуқ зоти' }] : []),
  ]),
  { id: 'processing', title: 'Қайта ишлаш' },
  { id: 'processing-table', title: 'Қайта ишлаш: дастгоҳлар' },
  { id: 'total', title: 'Жами' },
]
