import { ArrowUpRight, Banknote, Bird } from 'lucide-react'
import { DECK, SECTIONS, SUMMARY, type Financing, type SectionView } from '../data/deck'
import { PHOTOS } from '../data/photos'
import { IconTile, PhotoSlot } from '../components/Blocks'
import { Donut, SplitBar } from '../components/Charts'
import { FUNDS, SECTION_ICON } from '../components/icons'
import { Num } from '../components/Num'

/** Total project cost splitting into bank credit and own funds. */
function KpiTree({ f }: { f: Financing }) {
  const line = 'absolute bg-[#b9c6e4]'
  return (
    <div className="w-[760px]">
      <div data-anim="rise" className="glass-strong mx-auto flex w-[470px] items-center gap-5 rounded-[24px] px-6 py-5">
        <IconTile icon={Banknote} size={56} tone="blue" />
        <div>
          <div className="text-[17px] font-semibold text-ink-2">Лойиҳа қиймати</div>
          <div className="flex items-baseline gap-2 whitespace-nowrap">
            <Num fig={f.total} className="text-[60px] font-[790] leading-none tracking-[-0.03em] text-ink" />
            <span className="text-[22px] font-semibold text-ink-2">млн $</span>
          </div>
        </div>
      </div>

      <div className="relative mx-auto h-[62px] w-[392px]" aria-hidden>
        <div data-anim="line-y" className={`${line} left-1/2 top-0 h-[24px] w-[2px] -translate-x-1/2`} />
        <div data-anim="line-x" className={`${line} left-0 right-0 top-[24px] h-[2px]`} />
        <div data-anim="line-y" className={`${line} left-0 top-[24px] h-[38px] w-[2px]`} />
        <div data-anim="line-y" className={`${line} right-0 top-[24px] h-[38px] w-[2px]`} />
        {(['bank', 'own'] as const).map((k) => (
          <span
            key={k}
            data-anim="pop"
            className={`absolute top-[24px] -translate-y-1/2 rounded-full px-3.5 py-1 text-[18px] font-[760] text-white shadow-[0_6px_14px_-6px_#123b8f99] ${
              k === 'bank' ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2'
            }`}
            style={{ background: FUNDS[k].color }}
          >
            <Num fig={k === 'bank' ? f.bankPct : f.ownPct} animate={false} />%
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {(['bank', 'own'] as const).map((k) => {
          const Icon = FUNDS[k].icon
          return (
            <div key={k} data-anim="rise" className="glass flex items-center gap-4 rounded-[22px] px-5 py-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-[14px] bg-white/85 shadow-[0_2px_8px_-3px_#123b8f40]" style={{ color: FUNDS[k].color }}>
                <Icon size={24} />
              </span>
              <div>
                <div className="text-[16px] font-semibold text-ink-2">{FUNDS[k].label}</div>
                <div className="flex items-baseline gap-2 whitespace-nowrap">
                  <Num fig={f[k]} className="text-[40px] font-[780] leading-tight tracking-[-0.02em] text-ink" />
                  <span className="text-[18px] font-semibold text-ink-2">млн $</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SectionTeaser({ s, onOpen }: { s: SectionView; onOpen: () => void }) {
  return (
    <button
      type="button"
      data-anim="rise"
      onClick={onOpen}
      className="glass group flex flex-col rounded-[24px] p-5 text-left transition-shadow duration-300 hover:shadow-[0_0_0_1px_#176bff2e,0_12px_32px_-10px_#176bff73]"
    >
      <div className="flex items-start gap-3.5">
        <IconTile icon={SECTION_ICON[s.id]} size={48} />
        <div className="min-w-0 flex-1">
          <div className="text-[24px] font-[750] leading-tight tracking-[-0.01em] text-ink">{s.title}</div>
          <div className="line-clamp-2 text-[14px] font-medium leading-snug text-ink-2">{s.subtitle}</div>
        </div>
        <ArrowUpRight size={22} className="text-ink-3 transition-colors group-hover:text-brand-blue" />
      </div>
      <div className="mt-auto flex items-baseline gap-2 whitespace-nowrap pt-3">
        <Num fig={s.output.fig} className="text-[38px] font-[780] leading-none tracking-[-0.02em] text-ink" />
        <span className="text-[19px] font-[700] text-ink">{s.output.prefix}</span>
        <span className="truncate text-[15px] font-medium text-ink-2">{s.output.unit}</span>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <SplitBar bank={s.financing.exact.bank} own={s.financing.exact.own} className="flex-1" />
        <span className="whitespace-nowrap text-[16px] font-[720] text-ink">
          <Num fig={s.financing.total} animate={false} /> <span className="text-[13px] font-semibold text-ink-2">млн $</span>
        </span>
      </div>
    </button>
  )
}

export function CoverSlide({ onJump }: { onJump: (index: number) => void }) {
  const f = SUMMARY.financing
  return (
    <div className="absolute inset-x-16 top-[124px] bottom-[76px] grid grid-cols-12 grid-rows-[minmax(0,1fr)_206px] gap-x-6 gap-y-7">
      <div className="col-span-7 flex min-h-0 flex-col">
        <div data-anim="rise" className="eyebrow mt-4">
          {DECK.plan} · {DECK.year}
        </div>
        <h1 data-anim="rise" className="mt-4 text-[100px] font-[800] leading-[1] tracking-[-0.04em]">
          <span className="block text-ink">Кегейли Барака</span>
          <span className="text-gradient block pb-2">Наслли Парранда</span>
        </h1>
        <div data-anim="rise" className="mt-2 text-[26px] font-medium text-ink-2">
          хусусий корхонаси · {DECK.district}
        </div>
        <div className="mt-auto">
          <KpiTree f={f} />
        </div>
      </div>

      <div className="relative col-span-5">
        <div className="absolute inset-y-0 right-0 left-[96px]">
          <PhotoSlot src={PHOTOS.cover} icon={Bird} alt="Кегейли фермаси: сурат" className="size-full" />
        </div>
        <div data-anim="rise" className="glass-strong absolute left-0 top-1/2 grid size-[272px] -translate-y-1/2 place-items-center rounded-full">
          <Donut
            size={236}
            thickness={26}
            parts={[
              { fund: 'bank', exact: f.exact.bank, pct: f.bankPct.value },
              { fund: 'own', exact: f.exact.own, pct: f.ownPct.value },
            ]}
          >
            <div className="grid size-[150px] place-items-center rounded-full bg-brand-deep shadow-[inset_0_0_0_6px_#ffffff26]">
              <img src="/img/logo-mark.png" alt="" className="h-[82px] w-auto" />
            </div>
          </Donut>
        </div>
      </div>

      <div className="col-span-12 grid grid-cols-4 gap-6">
        {SECTIONS.map((s) => (
          <SectionTeaser key={s.id} s={s} onOpen={() => onJump(s.slide - 1)} />
        ))}
      </div>
    </div>
  )
}
