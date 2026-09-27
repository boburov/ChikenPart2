import { Cog, Layers, MapPin } from 'lucide-react'
import { DECK, PROCESSING } from '../data/deck'
import { PHOTOS } from '../data/photos'
import { Card, IconTile, PhotoSlot } from '../components/Blocks'
import { Donut, FundsLegend, StackedBars } from '../components/Charts'
import { COST_META, FUNDS, PROCESSING_ICON } from '../components/icons'
import { Num, Src } from '../components/Num'

/** Қайта ишлаш at a glance: capacities, bank vs own funds, and where the money goes (the дастгох sheet). */
export function ProcessingSlide({ slide }: { slide: number }) {
  const p = PROCESSING
  const f = p.financing
  return (
    <div className="absolute inset-x-16 top-[124px] bottom-[76px] grid grid-cols-12 grid-rows-[150px_292px_minmax(0,1fr)] gap-6">
      <div className="col-span-8 flex flex-col justify-end pb-1">
        <div data-anim="rise" className="eyebrow">
          {String(slide).padStart(2, '0')} · {p.subtitle}
        </div>
        <h1 data-anim="rise" className="mt-2 text-[88px] font-[780] leading-[0.98] tracking-[-0.035em] text-ink">
          {p.title}
        </h1>
        <div data-anim="rise" className="mt-3 flex items-center gap-5 text-[18px] font-medium text-ink-2">
          <span className="flex items-center gap-2">
            <MapPin size={19} className="text-brand-blue" /> {DECK.district}
          </span>
          <span className="flex items-center gap-2">
            <Cog size={19} className="text-brand-blue" /> Дастгоҳлар: {p.countries}
            <Src refs={p.countriesSrc} />
          </span>
          <span className="flex items-center gap-2">
            <Layers size={19} className="text-brand-blue" /> {p.positions} та позиция
          </span>
        </div>
      </div>

      <PhotoSlot className="col-span-4 row-span-2" src={PHOTOS.processing} icon={PROCESSING_ICON.slaughter} alt="Қайта ишлаш: сурат" />

      <Card className="col-span-4 flex flex-col">
        <div className="flex items-center gap-3 text-[17px] font-semibold text-ink-2">
          <IconTile icon={PROCESSING_ICON.slaughter} size={40} tone="blue" />
          {p.hero.label}
        </div>
        <div className="mt-3 flex items-baseline gap-3">
          <Num fig={p.hero.fig} className="text-[84px] font-[780] leading-none tracking-[-0.03em] text-ink" />
        </div>
        <div className="mt-1.5 text-[18px] font-medium text-ink-2">{p.hero.unit}</div>
        <div className="mt-auto grid grid-cols-3 gap-4 border-t border-hairline pt-3.5">
          {p.stats.map((st) => (
            <div key={st.key} className="min-w-0">
              <div className="truncate text-[14px] font-medium text-ink-2">{st.label}</div>
              <div className="mt-0.5 whitespace-nowrap">
                <Num fig={st.fig} className="text-[25px] font-[740] tracking-[-0.01em] text-ink" />{' '}
                <span className="text-[15px] font-semibold text-ink-2">{st.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="col-span-4 flex items-center gap-7">
        <Donut
          size={196}
          thickness={24}
          parts={[
            { fund: 'bank', exact: f.exact.bank, pct: f.bankPct.value },
            { fund: 'own', exact: f.exact.own, pct: f.ownPct.value },
          ]}
        >
          <div>
            <div className="text-[36px] font-[780] leading-none tracking-[-0.02em] text-ink">
              <Num fig={f.bankPct} animate={false} />%
            </div>
            <div className="mt-1 text-[14px] font-semibold text-ink-2">банк кредити</div>
          </div>
        </Donut>
        <div className="min-w-0 flex-1">
          <div className="text-[17px] font-semibold text-ink-2">Лойиҳа қиймати</div>
          <div className="mt-1 flex items-baseline gap-2 whitespace-nowrap">
            <Num fig={f.total} className="text-[54px] font-[780] leading-none tracking-[-0.03em] text-ink" />
            <span className="text-[20px] font-semibold text-ink-2">млн $</span>
          </div>
          <div className="mt-5 grid gap-2.5">
            {(['bank', 'own'] as const).map((k) => (
              <div key={k} className="flex items-center gap-2.5 text-[16px]">
                <i className="size-3 shrink-0 rounded-[3px]" style={{ background: FUNDS[k].color }} />
                <span className="flex-1 font-medium text-ink-2">{FUNDS[k].label}</span>
                <span className="whitespace-nowrap font-[720] text-ink">
                  <Num fig={f[k]} /> <span className="text-[14px] font-semibold text-ink-2">млн $</span>
                </span>
                <span className="w-11 text-right font-semibold text-ink-3">
                  <Num fig={k === 'bank' ? f.bankPct : f.ownPct} animate={false} />%
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="col-span-5" title="Харажатлар таркиби" aside={<FundsLegend />}>
        <StackedBars
          labelWidth={196}
          valueWidth={176}
          rowGap={28}
          rows={p.costs.map((row) => ({ ...row, icon: COST_META[row.key as 'construction' | 'equipment'].icon }))}
        />
      </Card>

      <Card className="col-span-7" title="Маблағ йўналишлари" aside={<FundsLegend />}>
        <StackedBars
          dense
          labelWidth={290}
          valueWidth={176}
          rowGap={14}
          rows={p.groups.map((row) => ({ ...row, icon: PROCESSING_ICON[row.key as keyof typeof PROCESSING_ICON] }))}
        />
      </Card>
    </div>
  )
}
