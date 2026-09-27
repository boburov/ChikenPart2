import type { ReactNode } from 'react'
import { MapPin, Truck, type LucideIcon } from 'lucide-react'
import type { FacilityView, GroupRow, GroupView } from '../data/deck'
import { SplitBar } from './Charts'
import { FACILITY_ICON } from './icons'
import { Num, Src } from './Num'

export function Card({ title, aside, className = '', children }: { title?: ReactNode; aside?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <section data-anim="rise" className={`glass rounded-[26px] p-7 ${className}`}>
      {(title || aside) && (
        <div className="mb-5 flex items-center justify-between gap-4">
          <h3 className="text-[21px] font-[720] tracking-[-0.01em] text-ink">{title}</h3>
          {aside}
        </div>
      )}
      {children}
    </section>
  )
}

export function IconTile({ icon: Icon, size = 44, tone = 'deep' }: { icon: LucideIcon; size?: number; tone?: 'deep' | 'blue' | 'soft' }) {
  const tones = {
    deep: 'bg-brand-deep text-white shadow-[0_8px_18px_-8px_#123b8fb0]',
    blue: 'bg-brand-blue text-white shadow-[0_8px_18px_-8px_#176bffb0]',
    soft: 'bg-white/85 text-brand-deep shadow-[0_2px_8px_-3px_#123b8f40]',
  }
  return (
    <span className={`grid shrink-0 place-items-center rounded-[14px] ${tones[tone]}`} style={{ width: size, height: size }}>
      <Icon size={Math.round(size * 0.48)} strokeWidth={2} />
    </span>
  )
}

/** A photo, or until a URL is set in src/data/photos.ts, a branded tile in the same spot. */
export function PhotoSlot({ src, icon: Icon, alt, className = '' }: { src: string; icon: LucideIcon; alt: string; className?: string }) {
  return (
    <div data-anim="photo" className={`relative overflow-hidden rounded-[30px] shadow-[0_24px_60px_-28px_#123b8f80] ${className}`}>
      {src ? (
        <img src={src} alt={alt} className="absolute inset-0 size-full object-cover" />
      ) : (
        <div aria-label={alt} role="img" className="absolute inset-0 bg-[linear-gradient(135deg,#123b8f_0%,#176bff_58%,#7b3ff2_100%)]">
          <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(#ffffff 1.2px, transparent 1.2px)', backgroundSize: '24px 24px' }} />
          <div className="absolute -right-10 -bottom-12 text-white/15">
            <Icon size={380} strokeWidth={1.1} />
          </div>
          <img src="/img/logo-mark.png" alt="" className="absolute left-8 top-8 h-14 w-auto opacity-95" />
        </div>
      )}
    </div>
  )
}

/** One farm or incubator. Money is exact, in thousand $, like the spreadsheet. */
export function FacilityCard({ f }: { f: FacilityView }) {
  return (
    <article data-anim="rise" className="glass-strong flex min-h-0 flex-col rounded-[22px] p-5">
      <div className="flex items-start gap-3">
        <IconTile icon={FACILITY_ICON[f.kind]} size={42} />
        <div className="min-w-0">
          <h4 className="text-[18px] font-[720] leading-[1.2] text-ink">
            {f.name}
            <Src refs={f.nameSrc} />
          </h4>
          <div className="mt-1 text-[14px] font-medium text-ink-2">
            <Num fig={f.buildings} animate={false} /> та бино{f.size && ` · ${f.size}`}
          </div>
        </div>
      </div>

      {f.capacity && <div className="mt-3 rounded-[10px] bg-brand-blue/10 px-3 py-1.5 text-[15px] font-semibold text-brand-deep">{f.capacity}</div>}

      {f.rows.length > 0 && (
        <dl className="mt-3 grid gap-1.5">
          {f.rows.map((r) => (
            <div key={r.label} className="flex items-baseline justify-between gap-3 border-b border-hairline pb-1.5">
              <dt className="text-[14px] text-ink-2">
                {r.label}
                {r.hint && <span className="text-ink-3"> · {r.hint}</span>}
              </dt>
              <dd className="whitespace-nowrap text-right">
                <Num fig={r.fig} className="text-[18px] font-[680] tabular-nums text-ink" />{' '}
                <span className="text-[13px] text-ink-2">{r.unit}</span>
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-auto pt-3">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[14px] font-medium text-ink-2">Лойиҳа қиймати</span>
          <span className="whitespace-nowrap">
            <Num fig={f.cost.total} className="text-[21px] font-[760] tabular-nums text-ink" />{' '}
            <span className="text-[13px] text-ink-2">минг $</span>
          </span>
        </div>
        <SplitBar bank={f.cost.bank.value} own={f.cost.own.value} className="mt-2" />
        <div className="mt-1.5 flex justify-between text-[13px] tabular-nums text-ink-2">
          <span>
            банк <Num fig={f.cost.bank} animate={false} className="font-semibold text-ink" />
          </span>
          <span>
            ўз <Num fig={f.cost.own} animate={false} className="font-semibold text-ink" />
          </span>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-[13px] font-medium text-ink-2">
          <Truck size={15} className="shrink-0 text-ink-3" />
          <span className="truncate">{f.supplier}</span>
          <Src refs={f.supplierSrc} />
        </div>
      </div>
    </article>
  )
}

function GroupTable({ rows, count }: { rows: GroupRow[]; count: number }) {
  return (
    <table className="w-full border-collapse text-[16px] tabular-nums">
      <thead>
        <tr className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-3">
          <th className="pb-1.5 text-left font-semibold" />
          <th className="pb-1.5 text-right font-semibold">1 та фабрика</th>
          <th className="pb-1.5 text-right font-semibold">Жами, {count} та</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.label} className={`border-t border-hairline ${r.strong ? 'font-[740]' : ''} text-ink`}>
            <td className="py-[4px] pr-2 text-[15px] leading-tight text-ink-2">
              {r.label}
              <span className="block text-[12px] leading-none text-ink-3">{r.unit}</span>
            </td>
            <td className="py-[4px] text-right">
              <Num fig={r.each} animate={false} />
            </td>
            <td className="py-[4px] text-right">
              <Num fig={r.total} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** Identical factories as one card: one factory next to all of them. */
export function GroupCard({ g }: { g: GroupView }) {
  return (
    <article data-anim="rise" className="glass-strong flex min-h-0 flex-1 flex-col rounded-[22px] px-6 pt-5 pb-5">
      <div className="flex items-center gap-3.5">
        <IconTile icon={FACILITY_ICON.farm} size={44} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h4 className="text-[20px] font-[740] text-ink">{g.label}</h4>
            <span className="rounded-full bg-brand-blue/10 px-3 py-1 text-[14px] font-semibold text-brand-deep">{g.count} та бир хил фабрика</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[14px] font-medium text-ink-2">
            {g.size} · <MapPin size={14} className="text-ink-3" /> {g.district} · <Truck size={14} className="text-ink-3" /> {g.supplier}
            <Src refs={g.supplierSrc} />
          </div>
        </div>
      </div>

      <div className="mt-3 grid min-h-0 flex-1 grid-cols-2 gap-8">
        <GroupTable rows={g.production} count={g.count} />
        <div className="flex flex-col">
          <GroupTable rows={g.money} count={g.count} />
          <div className="mt-auto">
            <SplitBar bank={g.exact.bank} own={g.exact.own} />
            <div className="mt-1.5 flex justify-between text-[13px] font-medium text-ink-2">
              <span>банк кредити</span>
              <span>ўз маблағи</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
