// Shape of src/data/kegeyli.json, written by scripts/extract.py.

export type Unit = 'kUSD' | 'USD' | 'kg' | 'pcs'

/** Land in hectares. Not in the spreadsheet: `ref` names the source (the client). */
export interface Land {
  value: number
  unit: 'ha'
  ref: string
  sumOf?: string[]
}

/** One spreadsheet cell: its value and where it came from. */
export interface Cell<T = number> {
  value: T | null
  ref: string
  formula?: string
  /** Set when the sheet's value was replaced (the typed-in I14 totals). */
  sheetValue?: number
  /** Set when the slide text differs from the sheet text. */
  sheetText?: string
  note?: string
  hidden?: boolean
}

export interface Money {
  total: Cell
  construction: Cell
  equipment: Cell
  chickens: Cell
  feed: Cell
}

export type CostKey = Exclude<keyof Money, 'total'>

interface Block {
  buildings: Cell
  output: Cell
  revenue: Cell
  cost: Money
  own: Money
  bank: Money
  birdsPerBuilding?: Cell
  birds?: Cell
  birdsPerBatch?: Cell
  birdsPerYear?: Cell
  land?: Land
}

export interface Facility extends Block {
  name: string
  kind: 'farm' | 'hatchery'
  size?: string
  district?: string
  capacity?: string
  nameRef: Cell<string>
  supplier: Cell<string>
}

export interface Totals extends Block {
  label: Cell<string>
  country: Cell<string>
}

export type SectionId = 'praroditel' | 'roditel' | 'broiler' | 'nesushka'

export interface Section {
  id: SectionId
  title: string
  subtitle: string
  sheet: string
  company: string
  units: {
    cost: { unit: Unit }
    revenue: { unit: Unit }
    output: { unit: Unit; what: string }
  }
  totals: Totals
  facilities: Facility[]
}

export interface Summed {
  value: number
  sumOf: string[]
}

/** A line of the client's project summary: the four sections, then the lines without a slide. */
export type LineId = SectionId | 'processing' | 'feedReserve' | 'generator'

export interface ProjectLine {
  id: LineId
  title: string
  /** True for the four lines that have their own slide. */
  section: boolean
  label: Cell<string>
  /** Taken from the line's text, e.g. «22 дона». */
  count?: { value: number; unit: string; ref: string }
  cost: Money
  own: Money
  bank: Money
}

/** «Жами Лойиҳа Кегели»: the whole project as the client totals it. */
export interface Project {
  sheet: string
  lines: ProjectLine[]
  cost: Money
  own: Money
  bank: Money
  totalCredit: Cell & { label: string }
}

export interface DeckData {
  meta: { source: string; sha256: string; extractedAt: string; company: string }
  sections: Section[]
  project: Project
  summary: {
    cost: Record<keyof Money, Summed>
    own: Record<keyof Money, Summed>
    bank: Record<keyof Money, Summed>
    buildings: Summed
    hatcheries: { value: number; refs: string[] }
    land: Land
  }
}
