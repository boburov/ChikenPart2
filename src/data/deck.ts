// Turns kegeyli.json into slide-ready figures. Every figure keeps the cells it
// came from (`src`), which the S key shows on the slides.
import raw from './kegeyli.json'
import { formatNumber } from '../lib/format'
import { splitRound } from '../lib/round'
import type { Cell, CostKey, DeckData, Facility, Money, Section, SectionId, Summed, Totals, Unit } from './types'

export const data = raw as unknown as DeckData

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

function financing(total: Source, bank: Source, own: Source): Financing {
  const [b, o] = splitRound([val(bank), val(own)], MLN_STEP)
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
function costRows(cost: MoneyLike, bank: MoneyLike, own: MoneyLike): CostRow[] {
  const totals = splitRound(COST_KEYS.map((k) => val(cost[k])), MLN_STEP)
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
  rows: FacilityRow[]
  /** Exact, in thousand $: the facility cards are the "table" part of a slide. */
  cost: { total: Fig; bank: Fig; own: Fig }
}

const OUTPUT_ROW: Record<SectionId, { label: string; unit: string }> = {
  praroditel: { label: 'Ота-она жўжа', unit: 'дона / йил' },
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
  output: { label: string; fig: Fig; prefix: string; unit: string }
  revenue: Fig
  stats: Stat[]
  financing: Financing
  costs: CostRow[]
  facilities: FacilityView[]
  group?: GroupView
}

const OUTPUT_UNIT: Record<SectionId, string> = {
  praroditel: 'ота-она жўжа / йил',
  roditel: 'тухум / йил',
  broiler: 'гўшт (тирик вазнда) / йил',
  nesushka: 'тухум / йил',
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
    birds = { key: 'birds', label: 'Жами бош', fig: exact(val(t.birds), [t.birds!.ref]), unit: 'бош' }
  }

  return {
    id: section.id,
    slide,
    title: section.title,
    subtitle: section.subtitle,
    country: t.country.value ?? '',
    countrySrc: [t.country.ref],
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
        hint: hatcheries ? `${hatcheries} таси инкубатория` : undefined,
      },
    ],
    financing: financing(t.cost.total, t.bank.total, t.own.total),
    costs: costRows(t.cost, t.bank, t.own),
    facilities: section.facilities.map((f) => facilityView(section, f)),
    group: groupView(section),
  }
}

export const SECTIONS: SectionView[] = data.sections.map((sec, i) => sectionView(sec, i + 2))

const sum = data.summary
const sectionShares = splitRound(SECTIONS.map((x) => x.financing.exact.total), sum.cost.total.value / 100)

export const SUMMARY = {
  financing: financing(sum.cost.total, sum.bank.total, sum.own.total),
  costs: costRows(sum.cost, sum.bank, sum.own),
  /** Project cost per section, with its share of the four-section total. */
  bySection: SECTIONS.map((x, i) => ({
    id: x.id,
    title: x.title,
    total: x.financing.total,
    share: exact(sectionShares[i], [...x.financing.total.src, ...sum.cost.total.sumOf]),
    exact: x.financing.exact,
  })),
  buildings: exact(sum.buildings.value, sum.buildings.sumOf),
  hatcheries: exact(sum.hatcheries.value, sum.hatcheries.refs),
}

export type SlideId = 'cover' | SectionId | 'total'
export const SLIDES: { id: SlideId; title: string }[] = [
  { id: 'cover', title: 'Муқова' },
  ...SECTIONS.map((sec) => ({ id: sec.id as SlideId, title: sec.title })),
  { id: 'total', title: 'Жами' },
]
