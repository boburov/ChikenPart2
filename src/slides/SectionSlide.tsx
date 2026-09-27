import { Cog, MapPin } from 'lucide-react'
import { DECK, type CostRow, type SectionView } from '../data/deck'
import { PHOTOS } from '../data/photos'
import type { SectionId } from '../data/types'
import { Card, FacilityCard, GroupCard, IconTile, PhotoSlot } from '../components/Blocks'
import { Donut, FundsLegend, StackedBars } from '../components/Charts'
import { COST_META, FUNDS, SECTION_ICON } from '../components/icons'
import { Num, Src } from '../components/Num'

/** Sheet-specific names for the chickens and feed columns (L5, M5). */
function costLabel(section: SectionId, row: CostRow) {
  if (row.key === 'chickens' && section === 'broiler') return 'Жўжа'
  if (row.key === 'chickens') return 'Товуқ'
  if (row.key === 'feed' && section === 'roditel') return 'Озуқа, вакцина'
  return COST_META[row.key].label
}

export function SectionSlide({ s }: { s: SectionView }) {
  const f = s.financing
  return (
    <div className="absolute inset-x-16 top-[124px] bottom-[76px] grid grid-cols-12 grid-rows-[150px_292px_minmax(0,1fr)] gap-6">
      {/* 1. title */}
      <div className="col-span-8 flex flex-col justify-end pb-1">
        <div data-anim="rise" className="eyebrow">
          {String(s.slide).padStart(2, '0')} · {s.subtitle}
        </div>
        <h1 data-anim="rise" className="mt-2 text-[88px] font-[780] leading-[0.98] tracking-[-0.035em] text-ink">
          {s.title}
        </h1>
        <div data-anim="rise" className="mt-3 flex items-center gap-5 text-[18px] font-medium text-ink-2">
          <span className="flex items-center gap-2">
            <MapPin size={19} className="text-brand-blue" /> {DECK.district}
          </span>
          <span className="flex items-center gap-2">
            <Cog size={19} className="text-brand-blue" /> Дастгоҳлар: {s.country}
            <Src refs={s.countrySrc} />
          </span>
        </div>
      </div>

      <PhotoSlot className="col-span-4 row-span-2" src={PHOTOS[s.id]} icon={SECTION_ICON[s.id]} alt={`${s.title}: сурат`} />

      {/* 2. what the district gets */}
      <Card className="col-span-4 flex flex-col">
        <div className="flex items-center gap-3 text-[17px] font-semibold text-ink-2">
          <IconTile icon={SECTION_ICON[s.id]} size={40} tone="blue" />
          {s.output.label}
        </div>
        <div className="mt-3 flex items-baseline gap-3">
          <Num fig={s.output.fig} className="text-[84px] font-[780] leading-none tracking-[-0.03em] text-ink" />
          <span className="text-[38px] font-[720] tracking-[-0.02em] text-ink">{s.output.prefix}</span>
        </div>
        <div className="mt-1.5 text-[18px] font-medium text-ink-2">{s.output.unit}</div>
        <div className="mt-auto grid grid-cols-3 gap-4 border-t border-hairline pt-3.5">
          {s.stats.map((st) => (
            <div key={st.key} className="min-w-0">
              <div className="truncate text-[14px] font-medium text-ink-2">{st.label}</div>
              <div className="mt-0.5 whitespace-nowrap">
                <Num fig={st.fig} className="text-[25px] font-[740] tracking-[-0.01em] text-ink" />{' '}
                <span className="text-[15px] font-semibold text-ink-2">
                  {st.prefix ? `${st.prefix} ` : ''}
                  {st.unit}
                </span>
              </div>
              {st.hint && <div className="truncate text-[13px] text-ink-3">{st.hint}</div>}
            </div>
          ))}
        </div>
      </Card>

      {/* 3. project cost: bank credit vs own funds */}
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

      {/* 4. where the money goes */}
      <Card className="col-span-5" title="Харажатлар таркиби" aside={<FundsLegend />}>
        <StackedBars
          labelWidth={196}
          valueWidth={176}
          rowGap={20}
          rows={s.costs.map((row) => ({
            key: row.key,
            icon: COST_META[row.key].icon,
            label: costLabel(s.id, row),
            total: row.total,
            share: row.share,
            exact: row.exact,
          }))}
        />
      </Card>

      {/* 5. facilities */}
      <section className="col-span-7 flex min-h-0 flex-col">
        <div data-anim="rise" className="mb-3 flex items-baseline gap-3 px-1">
          <h3 className="text-[21px] font-[720] tracking-[-0.01em] text-ink">Объектлар</h3>
          <span className="text-[15px] font-medium text-ink-3">
            {s.group ? `${s.group.count} та фабрика` : `${s.facilities.length} та`} · суммалар минг $ да
          </span>
        </div>
        {s.group ? (
          <GroupCard g={s.group} />
        ) : (
          <div className="grid min-h-0 flex-1 gap-4" style={{ gridTemplateColumns: `repeat(${s.facilities.length}, minmax(0, 1fr))` }}>
            {s.facilities.map((fac) => (
              <FacilityCard key={fac.nameSrc[0]} f={fac} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
