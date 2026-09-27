import { Fragment } from 'react'
import { Info } from 'lucide-react'
import { PROCESSING, type Fig } from '../data/deck'
import { PROCESSING_ICON } from '../components/icons'
import { Num, Src } from '../components/Num'

const MONEY_COLUMNS = ['Қурилиш', 'Дастгоҳ', 'Қиймати', 'Банк', 'Ўз маблағи']

function Money({ fig, strong = false }: { fig: Fig; strong?: boolean }) {
  return fig.value ? <Num fig={fig} animate={false} className={strong ? 'font-[780]' : ''} /> : <span className="text-ink-3">0</span>
}

/** Every item of the дастгох sheet, grouped, in thousand $ exactly as the sheet has them. */
export function ProcessingTableSlide({ slide }: { slide: number }) {
  const p = PROCESSING
  const gen = p.generator
  const cell = 'py-[9px] pl-5 whitespace-nowrap'
  return (
    <div className="absolute inset-x-16 top-[124px] bottom-[76px] flex flex-col gap-5">
      <div className="flex items-end justify-between">
        <div>
          <div data-anim="rise" className="eyebrow">
            {String(slide).padStart(2, '0')} · {p.subtitle}
          </div>
          <h1 data-anim="rise" className="mt-2 text-[64px] font-[780] leading-[0.98] tracking-[-0.035em] text-ink">
            Дастгоҳ ва транспорт
          </h1>
        </div>
        <div data-anim="rise" className="pb-2 text-[17px] font-medium text-ink-2">
          Пул — минг $ · «дастгох» варағи
        </div>
      </div>

      <div data-anim="rise" className="glass-strong min-h-0 rounded-[26px] px-8 pt-5 pb-4">
        <table className="w-full border-collapse text-[17px] tabular-nums">
          <thead>
            <tr className="align-bottom text-[13px] font-[750] uppercase tracking-[0.08em] text-brand-deep">
              <th className="pb-3 text-left">Объект</th>
              <th className="pb-3 pl-5 text-right">
                Сони<span className="block text-[12px] font-medium normal-case tracking-normal text-ink-3">та</span>
              </th>
              <th className="pb-3 pl-5 text-left">Қуввати</th>
              <th className="pb-3 pl-5 text-left">Давлат</th>
              {MONEY_COLUMNS.map((c) => (
                <th key={c} className="pb-3 pl-5 text-right">
                  {c}
                  <span className="block text-[12px] font-medium normal-case tracking-normal text-ink-3">минг $</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {p.table.map((g) => {
              const Icon = PROCESSING_ICON[g.key]
              return (
                <Fragment key={g.key}>
                  <tr className="border-t border-hairline bg-brand-blue/[0.06] font-[760] text-brand-deep">
                    <td className="py-[9px] pl-3 pr-3">
                      <span className="flex items-center gap-2.5">
                        <Icon size={18} className="shrink-0" />
                        {g.label}
                      </span>
                    </td>
                    <td colSpan={3} />
                    {g.subtotal.map((fig, i) => (
                      <td key={i} className={`${cell} text-right`}>
                        <Money fig={fig} />
                      </td>
                    ))}
                  </tr>
                  {g.rows.map((r) => (
                    <tr key={r.key} className="border-t border-hairline">
                      <td className="py-[9px] pl-10 pr-3 font-[650] text-ink">
                        {r.name}
                        <Src refs={r.nameSrc} />
                      </td>
                      <td className={`${cell} text-right`}>
                        <Num fig={r.count} animate={false} />
                      </td>
                      <td className={`${cell} text-ink-2`}>
                        {r.capacity ? (
                          <>
                            {r.capacity.text}
                            <Src refs={r.capacity.src} />
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className={`${cell} text-ink-2`}>
                        <span className="inline-flex items-center gap-2">
                          <img src="/img/flags/cn.svg" alt="" className="h-4 w-[22px] rounded-[3px] object-cover ring-1 ring-brand-deep/10" />
                          {r.country.text}
                          <Src refs={r.country.src} />
                        </span>
                      </td>
                      {r.money.map((fig, i) => (
                        <td key={i} className={`${cell} text-right text-ink`}>
                          <Money fig={fig} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-brand-deep/25">
              <td className="py-[11px] text-[13px] font-[800] uppercase tracking-[0.1em] text-brand-deep">Жами</td>
              <td colSpan={3} />
              {p.total.map((fig, i) => (
                <td key={i} className={`py-[11px] pl-5 whitespace-nowrap text-right text-ink`}>
                  <Money fig={fig} strong />
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
        {gen && (
          <p className="mt-2 flex items-center gap-2 border-t border-hairline pt-3 text-[15px] font-medium text-ink-2">
            <Info size={17} className="shrink-0 text-brand-blue" />
            Генератор ({gen.count?.value} дона, {String(gen.cost.total.value).replace('.', ',')} минг $, банк кредити) бу варақда йўқ: Жами слайдида алоҳида қатор.
            <Src refs={[gen.cost.total.ref]} />
          </p>
        )}
      </div>
    </div>
  )
}
