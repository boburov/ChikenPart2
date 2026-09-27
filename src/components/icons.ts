import {
  Bird,
  Cog,
  Dna,
  Drumstick,
  Egg,
  Factory,
  Hammer,
  Landmark,
  Wallet,
  Warehouse,
  Wheat,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import type { SectionId, CostKey, LineId } from '../data/types'

export const SECTION_ICON: Record<SectionId, LucideIcon> = {
  praroditel: Dna,
  roditel: Bird,
  broiler: Drumstick,
  nesushka: Egg,
}

/** Lines of the project summary: the sections, then the lines without a slide. */
export const LINE_ICON: Record<LineId, LucideIcon> = {
  ...SECTION_ICON,
  processing: Factory,
  feedReserve: Wheat,
  generator: Zap,
}

export const COST_META: Record<CostKey, { icon: LucideIcon; label: string }> = {
  construction: { icon: Hammer, label: 'Қурилиш' },
  equipment: { icon: Cog, label: 'Дастгоҳ' },
  chickens: { icon: Bird, label: 'Товуқ / жўжа' },
  feed: { icon: Wheat, label: 'Озуқа' },
}

export const FACILITY_ICON: Record<'farm' | 'hatchery', LucideIcon> = {
  farm: Warehouse,
  hatchery: Egg,
}

export const FUNDS = {
  bank: { icon: Landmark, label: 'Банк кредити', color: 'var(--color-bank)' },
  own: { icon: Wallet, label: 'Ўз маблағи', color: 'var(--color-own)' },
} as const
