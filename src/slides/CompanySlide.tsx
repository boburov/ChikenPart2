import { ArrowRight, Drumstick, Egg, MapPin, TrendingUp, UserRound, Users, type LucideIcon } from 'lucide-react'
import { COMPANY, type ComparisonKey } from '../data/company'
import { Card, IconTile, PhotoSlot } from '../components/Blocks'
import { Donut } from '../components/Charts'
import { FUNDS } from '../components/icons'
import { Num } from '../components/Num'

const ICON: Record<ComparisonKey, LucideIcon> = { meat: Drumstick, eggs: Egg, turnover: TrendingUp, jobs: Users }
const fmt = (n: number) => String(n).replace('.', ',')

/** The whole company at a glance: financing, results after the new project, share of the region's demand. */
export function CompanySlide({ slide }: { slide: number }) {
  const c = COMPANY
  const f = c.financing
  const total = f.bank.fig.value + f.own.value
  const pct = { bank: Math.round((f.bank.fig.value / total) * 100), own: Math.round((f.own.value / total) * 100) }

  return (
    <div className="absolute inset-x-16 top-[124px] bottom-[76px] grid grid-cols-12 grid-rows-[150px_minmax(0,1fr)_186px] gap-6">
      {/* title */}
      <div className="col-span-7 flex flex-col justify-end pb-1">
        <div data-anim="rise" className="eyebrow">
          {String(slide).padStart(2, '0')} · {c.region}
        </div>
        <h1 data-anim="rise" className="mt-2 text-[76px] font-[780] leading-[0.98] tracking-[-0.035em] text-ink">
          Барака ҳамкор <span className="text-gradient">парранда</span>
        </h1>
        <div data-anim="rise" className="mt-3 flex items-center gap-5 text-[18px] font-medium text-ink-2">
          <span className="flex items-center gap-2">
            <MapPin size={19} className="text-brand-blue" /> {c.kind}
          </span>
          <span className="flex items-center gap-2">
            <UserRound size={19} className="text-brand-blue" /> Корхона раҳбари: <span className="font-semibold text-ink">{c.director}</span>
          </span>
        </div>
      </div>

      <PhotoSlot className="col-span-5 row-span-2" src={c.photo} icon={Drumstick} alt="Замонавий паррандахона ичида оқ бройлер товуқлар" />

      {/* financing */}
      <Card className="col-span-3 flex flex-col">
        <div className="text-[17px] font-semibold text-ink-2">Лойиҳа қиймати</div>
        <div className="mt-1 flex items-baseline gap-2 whitespace-nowrap">
          <Num fig={f.total} className="text-[64px] font-[780] leading-none tracking-[-0.03em] text-ink" />
          <span className="text-[18px] font-semibold text-ink-2">млн АҚШ доллари</span>
        </div>
        <div className="my-auto flex justify-center py-3">
          <Donut
            size={170}
            thickness={22}
            parts={[
              { fund: 'bank', exact: f.bank.fig.value * 1000, pct: pct.bank },
              { fund: 'own', exact: f.own.value * 1000, pct: pct.own },
            ]}
          >
            <div>
              <div className="text-[32px] font-[780] leading-none text-ink">{pct.bank}%</div>
              <div className="mt-1 text-[13px] font-semibold text-ink-2">банк кредити</div>
            </div>
          </Donut>
        </div>
        <div className="grid gap-2.5">
          {(['bank', 'own'] as const).map((k) => (
            <div key={k} className="flex items-center gap-2.5 text-[16px]">
              <i className="size-3 shrink-0 rounded-[3px]" style={{ background: FUNDS[k].color }} />
              <span className="flex-1 font-medium text-ink-2">{FUNDS[k].label}</span>
              {k === 'bank' && <img src={f.bank.logo} alt={f.bank.logoAlt} className="h-5 w-auto" />}
              <span className="whitespace-nowrap font-[720] text-ink">
                <Num fig={k === 'bank' ? f.bank.fig : f.own} /> <span className="text-[14px] font-semibold text-ink-2">млн $</span>
              </span>
              <span className="w-10 text-right font-semibold text-ink-3">{pct[k]}%</span>
            </div>
          ))}
        </div>
      </Card>

      {/* region demand vs our output: below 100% the bar is our share, above it the surplus shows in purple */}
      <Card className="col-span-4 flex flex-col" title="Андижон вилояти талаби ва бизнинг улуш">
        <div className="flex flex-1 flex-col justify-around gap-4">
          {c.market.map((m) => {
            const demand = m.demand.value
            const output = m.output.value
            const share = Math.round((output / demand) * 100)
            const scale = Math.max(demand, output)
            const surplus = output - demand
            return (
              <div key={m.key}>
                <div className="flex items-center gap-3">
                  <IconTile icon={m.key === 'eggs' ? Egg : Drumstick} size={38} tone="blue" />
                  <span className="w-20 text-[18px] font-[720] text-ink">{m.label}</span>
                  <div className="flex-1">
                    <div className="text-[13px] font-medium text-ink-3">Вилоят талаби</div>
                    <Num fig={m.demand} className="text-[24px] font-[740] text-ink" /> <span className="text-[14px] text-ink-2">{m.unit}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-medium text-ink-3">Бизнинг ишлаб чиқариш</div>
                    <Num fig={m.output} className="text-[24px] font-[740] text-brand-blue" /> <span className="text-[14px] text-ink-2">{m.unit}</span>
                  </div>
                </div>
                <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-hairline">
                  <div data-anim="bar" className="h-full bg-brand-blue" style={{ width: `${(Math.min(output, demand) / scale) * 100}%` }} />
                  {surplus > 0 && <div data-anim="bar" className="h-full bg-brand-purple" style={{ width: `${(surplus / scale) * 100}%` }} />}
                </div>
                <div className="mt-2 text-[15px] font-medium text-ink-2">
                  <b className="text-[18px] text-brand-deep">{share}%</b>{' '}
                  {surplus > 0 ? (
                    <>
                      талаб тўлиқ қопланади · <span className="font-semibold text-brand-purple">+{fmt(surplus)} {m.unit} ортиқча</span>
                    </>
                  ) : (
                    'вилоят талабини биз таъминлаймиз'
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* before → after the new project */}
      <section className="col-span-12 flex min-h-0 flex-col">
        <div data-anim="rise" className="eyebrow mb-3 px-1">Янги лойиҳа ишга тушгач</div>
        <div className="grid min-h-0 flex-1 grid-cols-4 gap-5">
          {c.comparison.map((r) => (
            <div key={r.key} data-anim="rise" className="glass flex flex-col justify-between rounded-[24px] px-6 py-4">
              <div className="flex items-center gap-3">
                <IconTile icon={ICON[r.key]} size={38} tone="blue" />
                <span className="text-[18px] font-[720] text-ink">{r.label}</span>
                {r.note && <span className="text-[14px] text-ink-3">{r.note}</span>}
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-[14px] bg-white/60 px-3.5 py-2 ring-1 ring-hairline">
                  <div className="text-[12px] font-medium text-ink-3">Ҳозир</div>
                  <Num fig={r.before} animate={false} className="text-[22px] font-[720] text-ink-2" /> <span className="text-[13px] text-ink-3">{r.unit}</span>
                </div>
                <ArrowRight size={22} className="shrink-0 text-brand-blue" />
                <div className="flex-1 rounded-[14px] bg-brand-blue/10 px-4 py-2 ring-1 ring-brand-blue/25">
                  <div className="text-[12px] font-semibold text-brand-deep">Лойиҳадан кейин</div>
                  <Num fig={r.after} className="text-[32px] font-[780] leading-tight text-brand-deep" /> <span className="text-[14px] font-semibold text-brand-deep/80">{r.afterUnit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
