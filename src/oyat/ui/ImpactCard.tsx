import { motion } from "framer-motion";
import type { Impact } from "../results";
import { fadeUp } from "../motion";
import { cn } from "../cn";
import { AnimatedCounter } from "./AnimatedCounter";
import { FlowArrow } from "./FlowArrow";

type ImpactCardProps = Impact & {
  /** Compact one-screen size. */
  poster?: boolean;
  /** Poster only: seconds after load at which the figure starts counting. */
  startAfter?: number;
};

/** One indicator: icon and title on top, then today's figure → the figure once the project runs. */
export function ImpactCard({ Icon, label, note, before, after, poster = false, startAfter }: ImpactCardProps) {
  const afterText = after.value.toFixed(after.decimals ?? 0).replace(".", ",");

  return (
    <motion.article
      variants={fadeUp}
      aria-label={`${label}${note ? `, ${note}` : ""}: ҳозир ${before.value} ${before.unit}, лойиҳадан кейин ${afterText} ${after.unit}`}
      className={cn(
        "glass flex min-w-0 flex-col rounded-[1.25rem] transition-shadow duration-500 hover:shadow-glow",
        poster ? "gap-1.5 px-3 py-2" : "gap-4 p-5",
      )}
    >
      <div className="flex items-center gap-2.5">
        <span className={cn("bg-grad flex shrink-0 items-center justify-center rounded-xl text-white", poster ? "size-7" : "size-10")}>
          <Icon aria-hidden className={poster ? "size-4" : "size-5"} strokeWidth={1.8} />
        </span>
        <h3 className="min-w-0 leading-tight">
          <span className={cn("block font-bold text-navy", poster ? "text-[0.9375rem]" : "text-lg")}>{label}</span>
          {note && <span className={cn("block font-medium text-muted", poster ? "text-[0.6875rem]" : "text-sm")}>{note}</span>}
        </h3>
      </div>

      <div aria-hidden className={cn("flex min-h-0 flex-1 items-center", poster ? "gap-1.5" : "gap-3")}>
        <div
          className={cn(
            "flex shrink-0 flex-col justify-center rounded-xl border border-dashed border-navy/15 bg-navy/[0.03]",
            poster ? "px-2.5 py-1.5" : "px-3.5 py-2.5",
          )}
        >
          <span className={cn("font-medium text-muted", poster ? "text-[0.625rem]" : "text-xs")}>Ҳозир</span>
          <span className={cn("font-bold whitespace-nowrap text-navy/70", poster ? "text-[0.9375rem]" : "text-lg")}>
            {before.value} <span className={cn("font-semibold", poster ? "text-[0.625rem]" : "text-xs")}>{before.unit}</span>
          </span>
        </div>

        <FlowArrow className={poster ? "[&_svg]:w-6" : "[&_svg]:w-8"} />

        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col justify-center self-stretch rounded-xl border border-accent/25 bg-gradient-to-br from-accent/[0.08] to-violet/[0.12]",
            poster ? "px-2.5 py-1.5" : "px-4 py-3",
          )}
        >
          <span className={cn("font-semibold text-navy", poster ? "text-[0.625rem]" : "text-xs")}>Лойиҳадан кейин</span>
          <span className="flex items-baseline gap-1.5 leading-none font-extrabold whitespace-nowrap">
            <AnimatedCounter
              value={after.value}
              decimals={after.decimals}
              decimalSeparator=","
              startAfter={startAfter}
              gradient
              className={cn("tracking-[-0.04em]", poster ? "text-[1.75rem]" : "text-4xl")}
            />
            <span className={cn("font-semibold tracking-normal text-accent", poster ? "text-[0.6875rem]" : "text-sm")}>{after.unit}</span>
          </span>
        </div>
      </div>
    </motion.article>
  );
}
