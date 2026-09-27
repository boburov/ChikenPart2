import { motion } from "framer-motion";
import { Gauge, Globe, type LucideIcon } from "lucide-react";
import { BENEFIT } from "../content";
import { fadeUp } from "../motion";
import { cn } from "../cn";
import { AnimatedCounter } from "./AnimatedCounter";

type Tile = { Icon: LucideIcon; value: number; unit: string; caption: string; accent?: boolean };

const TILES: Tile[] = [
  { Icon: Gauge, ...BENEFIT.chicks, caption: "бройлер жўжа ишлаб чиқариш қуввати · йилига" },
  { Icon: Globe, ...BENEFIT.export, caption: "бир кунлик бройлер жўжа экспорти · йилига", accent: true },
];

/**
 * The chain's yearly output side by side: chick capacity, then day-old chick exports
 * (the highlighted one). On the poster each tile stacks icon, figure and caption; `poster` is the compact size.
 */
export function OutputTiles({ poster = false, startAfter }: { poster?: boolean; startAfter?: number }) {
  return (
    <div className={cn("grid min-w-0 gap-2.5", poster ? "grid-cols-2" : "sm:grid-cols-2")}>
      {TILES.map(({ Icon, value, unit, caption, accent }) => (
        <motion.article
          key={caption}
          variants={fadeUp}
          aria-label={`${value} ${unit}, ${caption}`}
          className={cn(
            "flex min-h-0 min-w-0 rounded-[1.125rem]",
            poster ? "flex-col justify-between gap-1.5 px-3.5 py-3" : "items-center gap-3 p-4",
            accent ? "bg-grad text-white shadow-glow" : "glass",
          )}
        >
          <span
            className={cn(
              "flex shrink-0 items-center justify-center rounded-lg",
              poster ? "size-7" : "size-10",
              accent ? "bg-white/20" : "bg-grad text-white",
            )}
          >
            <Icon aria-hidden className={poster ? "size-4" : "size-5"} strokeWidth={1.8} />
          </span>
          <span aria-hidden className="min-w-0">
            <span className="flex items-baseline gap-1 leading-none font-extrabold whitespace-nowrap">
              <AnimatedCounter
                value={value}
                startAfter={startAfter}
                gradient={!accent}
                className={cn("tracking-[-0.04em]", poster ? "text-[2rem]" : "text-3xl")}
              />
              <span className={cn("font-bold", poster ? "text-[0.75rem]" : "text-sm", accent ? "text-white/85" : "text-accent")}>
                {unit}
              </span>
            </span>
            <span
              className={cn(
                "mt-0.5 block leading-snug font-semibold",
                poster ? "text-[0.6875rem]" : "text-sm",
                accent ? "text-white/85" : "text-muted",
              )}
            >
              {caption}
            </span>
          </span>
        </motion.article>
      ))}
    </div>
  );
}
