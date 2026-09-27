import type { CSSProperties } from 'react'
import { BadgeDollarSign, Drumstick, Egg, TrendingUp, Users, Wallet, type LucideIcon } from 'lucide-react'
import { COMPANY, type ComparisonKey } from '../data/company'
import { Num } from '../components/Num'
import './company.css'

const ICON: Record<ComparisonKey, LucideIcon> = { meat: Drumstick, eggs: Egg, turnover: TrendingUp, jobs: Users }
const fmt = (n: number) => String(n).replace('.', ',')
const tone = (t: 'blue' | 'purple') => ({ '--tone': `var(--color-brand-${t})` }) as CSSProperties

/**
 * The whole company at a glance, laid out like the «Baraka hamkor parranda» page
 * (github.com/boburov/chicken): funding flow and region share on the left, the
 * financing ring and hero photo on the right, results after the new project below.
 */
export function CompanySlide({ slide }: { slide: number }) {
  const c = COMPANY
  const f = c.financing
  const total = f.bank.fig.value + f.own.value
  const pct = { bank: Math.round((f.bank.fig.value / total) * 100), own: Math.round((f.own.value / total) * 100) }

  return (
    <div className="co">
      <div className="co-text">
        <div data-anim="rise" className="co-kicker">
          <i aria-hidden />
          {String(slide).padStart(2, '0')} · {c.region}
        </div>
        <h1 data-anim="rise" className="co-title">
          <span>Барака</span>
          <span>ҳамкор парранда</span>
        </h1>
        <div data-anim="rise" className="co-subtitle">
          Хусусий корхонаси
        </div>

        <div className="co-funding">
          <div data-anim="rise" className="co-total co-glass">
            <span className="co-icon">
              <BadgeDollarSign size={22} />
            </span>
            <div>
              <div className="co-label">Лойиҳа қиймати</div>
              <div className="co-value">
                <Num fig={f.total} />
                <small>млн АҚШ доллари</small>
              </div>
            </div>
          </div>
          <svg data-anim="rise" className="co-arrows" viewBox="0 0 400 64" preserveAspectRatio="none" aria-hidden>
            <defs>
              <marker id="co-head-blue" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0L10 5L0 10z" fill="#176BFF" />
              </marker>
              <marker id="co-head-purple" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0L10 5L0 10z" fill="#7B3FF2" />
              </marker>
            </defs>
            <path d="M200 0 V22 Q200 32 190 32 H110 Q100 32 100 42 V58" stroke="#176BFF" markerEnd="url(#co-head-blue)" vectorEffect="non-scaling-stroke" />
            <path d="M200 0 V22 Q200 32 210 32 H290 Q300 32 300 42 V58" stroke="#7B3FF2" markerEnd="url(#co-head-purple)" vectorEffect="non-scaling-stroke" />
          </svg>
          <div className="co-shares" aria-hidden>
            <span data-anim="pop" className="co-share bg-tone-blue">{pct.bank}%</span>
            <span data-anim="pop" className="co-share bg-tone-purple">{pct.own}%</span>
          </div>
          <div className="co-parts">
            <div data-anim="rise" className="co-part" style={tone('blue')}>
              <span className="co-logo">
                <img src={f.bank.logo} alt={f.bank.logoAlt} />
              </span>
              <div>
                <div className="co-label">Банк кредити</div>
                <div className="co-value">
                  <Num fig={f.bank.fig} />
                  <small>млн $</small>
                </div>
              </div>
            </div>
            <div data-anim="rise" className="co-part" style={tone('purple')}>
              <span className="co-icon">
                <Wallet size={18} />
              </span>
              <div>
                <div className="co-label">Ўз ҳисобидан</div>
                <div className="co-value">
                  <Num fig={f.own} />
                  <small>млн $</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* below 100% the bar is our share of the demand; above it the surplus shows in purple */}
        <section data-anim="rise" className="co-market co-glass">
          <h2 className="co-caps">Андижон вилояти талаби ва бизнинг улуш</h2>
          {c.market.map((m) => {
            const demand = m.demand.value
            const output = m.output.value
            const scale = Math.max(demand, output)
            const covered = (Math.min(output, demand) / scale) * 100
            const surplus = output - demand
            return (
              <div key={m.key} className="co-row">
                <div className="co-row-head">
                  <span className="co-name">
                    <span className="co-icon">{m.key === 'eggs' ? <Egg size={16} /> : <Drumstick size={16} />}</span>
                    {m.label}
                  </span>
                  <span className="co-fig">
                    <small>Вилоят талаби</small>
                    <b>
                      <Num fig={m.demand} animate={false} /> <em>{m.unit}</em>
                    </b>
                  </span>
                  <span className="co-fig is-ours">
                    <small>Бизнинг ишлаб чиқариш</small>
                    <b>
                      <Num fig={m.output} /> <em>{m.unit}</em>
                    </b>
                  </span>
                </div>
                <div className="co-meter">
                  <div className="co-bar" aria-hidden>
                    <span data-anim="bar" className="co-bar-fill" style={{ width: `${covered}%` }} />
                    {surplus > 0 && <span data-anim="bar" className="co-bar-extra" style={{ left: `${covered}%`, width: `${100 - covered}%` }} />}
                  </div>
                  <p className="co-caption">
                    <strong>{Math.round((output / demand) * 100)}%</strong>{' '}
                    {surplus > 0 ? (
                      <>
                        талаб тўлиқ қопланади · <span className="co-surplus">+{fmt(surplus)} {m.unit} ортиқча</span>
                      </>
                    ) : (
                      'вилоят талабини биз таъминлаймиз'
                    )}
                  </p>
                </div>
              </div>
            )
          })}
        </section>
      </div>

      <div className="co-stage">
        <figure data-anim="photo" className="co-photo">
          <img src={c.photo} alt="Замонавий паррандахона ичида оқ бройлер товуқлар" />
        </figure>
        <div data-anim="pop" className="co-ring-wrap">
          <svg className="co-orbits" viewBox="0 0 560 560" aria-hidden>
            <ellipse cx="280" cy="280" rx="262" ry="238" stroke="#176bff" strokeOpacity="0.28" strokeDasharray="620 1100" transform="rotate(-150 280 280)" />
            <ellipse cx="280" cy="280" rx="236" ry="262" stroke="#7b3ff2" strokeOpacity="0.22" strokeDasharray="520 1100" transform="rotate(30 280 280)" />
            <circle cx="280" cy="280" r="214" stroke="#176bff" strokeOpacity="0.16" strokeDasharray="300 1000" transform="rotate(100 280 280)" />
          </svg>
          <div className="co-ring" style={{ '--share': `${pct.bank}%` } as CSSProperties} />
          <div className="co-ring-gap" />
          <div className="co-disc">
            <img src="/img/logo-mark.png" alt="" />
          </div>
          <div className="co-ring-label" style={{ ...tone('purple'), left: -150, top: 40 }}>
            <span className="n">
              <i /> Ўз ҳисобидан
            </span>
            <span className="v">
              {f.own.value} млн $ <b>{pct.own}%</b>
            </span>
          </div>
          <div className="co-ring-label" style={{ ...tone('blue'), right: -150, bottom: 30 }}>
            <span className="n">
              <i /> Банк кредити
            </span>
            <span className="v">
              {f.bank.fig.value} млн $ <b>{pct.bank}%</b>
            </span>
          </div>
        </div>
      </div>

      <section className="co-results">
        <h2 data-anim="rise" className="co-caps">Янги лойиҳа ишга тушгач</h2>
        <div className="co-results-grid">
          {c.comparison.map((r) => {
            const Icon = ICON[r.key]
            return (
              <div key={r.key} data-anim="rise" className="co-result co-glass">
                <div className="co-result-top">
                  <span className="co-icon">
                    <Icon size={18} />
                  </span>
                  <span>
                    <strong>{r.label}</strong>
                    {r.note && <small>{r.note}</small>}
                  </span>
                </div>
                <div className="co-flow">
                  <div className="co-box is-before">
                    <span>Ҳозир</span>
                    <span>
                      <Num fig={r.before} animate={false} /> <small>{r.unit}</small>
                    </span>
                  </div>
                  <svg className="co-arrow" viewBox="0 0 30 24" width="26" height="22" aria-hidden fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12 H22" />
                    <path d="M16 5 L24 12 L16 19" />
                  </svg>
                  <div className="co-box is-after">
                    <span>Лойиҳадан кейин</span>
                    <span>
                      <Num fig={r.after} /> <small>{r.afterUnit}</small>
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
