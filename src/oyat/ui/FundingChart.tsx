import { motion, type Variants } from "framer-motion";
import { Landmark } from "lucide-react";
import { FUNDING, PROJECT_VALUE } from "../content";
import { EASE_OUT, fadeUp } from "../motion";
import { cn } from "../cn";

/**
 * One hue per source, in fixed order. Brand blue and violet are too close to tell apart
 * side by side, so teal sits between them (validated: CVD ΔE ≥ 25, normal-vision ΔE ≥ 27).
 */
const COLORS = ["#176bff", "#14b8a6", "#7b3ff2"] as const;

const grow: Variants = {
  hidden: { scaleX: 0 },
  show: (delay: number) => ({ scaleX: 1, transition: { duration: 1, ease: EASE_OUT, delay } }),
};

const total = FUNDING.reduce((sum, source) => sum + source.value, 0);
const pct = (value: number) => Math.round((value / total) * 100);

/**
 * "Молиялаштириш манбалари": the 30 mln dollars as one stacked bar, then each source
 * with its own progress bar and amount. Every value is written out, so colour is
 * never the only cue.
 */
export function FundingChart({ startAfter = 0 }: { startAfter?: number }) {
  return (
    <motion.section
      variants={fadeUp}
      aria-labelledby="funding-title"
      className="glass flex h-full min-h-0 flex-col justify-center gap-4 rounded-[1.25rem] px-5 py-4"
    >
      <div className="flex items-center gap-3">
        <span className="bg-grad flex size-10 shrink-0 items-center justify-center rounded-xl text-white">
          <Landmark aria-hidden className="size-5" strokeWidth={1.7} />
        </span>
        <div className="min-w-0">
          <h2 id="funding-title" className="text-[0.75rem] leading-tight font-extrabold tracking-[0.12em] text-navy uppercase">
            Молиялаштириш манбалари
          </h2>
          <p className="mt-0.5 text-[0.75rem] font-semibold text-muted">
            Жами <span className="font-extrabold text-navy">{total} {PROJECT_VALUE.unit}</span>
          </p>
        </div>
      </div>

      {/* Whole: one bar, segments in source order with a 2px surface gap between them. */}
      <div aria-hidden className="flex h-3.5 gap-[2px] overflow-hidden rounded-full">
        {FUNDING.map((source, i) => (
          <motion.span
            key={source.label}
            variants={grow}
            custom={startAfter + i * 0.25}
            title={`${source.label}: ${source.value} ${PROJECT_VALUE.unit}`}
            style={{ flexGrow: source.value, backgroundColor: COLORS[i] }}
            className="origin-left basis-0"
          />
        ))}
      </div>

      {/* Parts: each source as a labelled progress row. */}
      <ul className="flex flex-col gap-3">
        {FUNDING.map((source, i) => (
          <li key={source.label} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2 text-[0.8125rem] font-bold text-navy">
                {/* A source with a logo shows it in place of the colour swatch. */}
                {source.logo ? (
                  <img
                    src={source.logo.src}
                    alt={source.logo.alt}
                    width={20}
                    height={20}
                    decoding="async"
                    className="size-5 shrink-0 rounded-md bg-white p-0.5 shadow-sm ring-1 ring-navy/10"
                  />
                ) : (
                  <span aria-hidden className="size-2.5 shrink-0 rounded-[3px]" style={{ backgroundColor: COLORS[i] }} />
                )}
                {source.label}
              </span>
              <span className="shrink-0 whitespace-nowrap">
                <span className="text-[1.125rem] font-extrabold tracking-tight text-navy">{source.value}</span>{" "}
                <span className="text-[0.6875rem] font-bold text-muted">{PROJECT_VALUE.unit}</span>
              </span>
            </div>
            <div
              role="progressbar"
              aria-label={source.label}
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={source.value}
              aria-valuetext={`${source.value} ${PROJECT_VALUE.unit}`}
              className="h-2 overflow-hidden rounded-full bg-navy/[0.07]"
            >
              <motion.span
                variants={grow}
                custom={startAfter + 0.4 + i * 0.15}
                style={{ width: `${pct(source.value)}%`, backgroundColor: COLORS[i] }}
                className={cn("block h-full origin-left rounded-full")}
              />
            </div>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}
