import { motion } from "framer-motion";
import { Bird, ChartNoAxesCombined, DollarSign, MapPinned, Warehouse, type LucideIcon } from "lucide-react";
import { AnimatedCounter } from "./ui/AnimatedCounter";
import { FundingChart } from "./ui/FundingChart";
import { ImageCard } from "./ui/ImageCard";
import { Reveal, RevealGroup } from "./ui/Reveal";
import {
  COMPANY_SHORT,
  LOCATION,
  PARENT_STOCK,
  POULTRY_HOUSES,
  PROJECT_VALUE,
} from "./content";
import { GALLERY } from "./gallery";
import { fadeUp } from "./motion";

/** Seconds after load at which each column starts, so the panel fills left to right after the title. */
const START = { panel: 0.7, stats: 0.95, funding: 1.1, gallery: 1.3 } as const;

type StatProps = {
  icon: LucideIcon;
  badge?: LucideIcon;
  overline?: string;
  label: string;
  value: number;
  suffix?: string;
  unit: string;
};

/** Compact take on the slide's grey info card: icon left, centred label / figure / unit. */
function Stat({ icon: Icon, badge: Badge, overline, label, value, suffix, unit }: StatProps) {
  return (
    <motion.article variants={fadeUp} className="glass flex min-h-0 items-center gap-4 rounded-[1.25rem] px-5 transition-shadow duration-500 hover:shadow-glow">
      <div className="relative flex size-[3.25rem] shrink-0 items-center justify-center rounded-2xl bg-grad text-white shadow-glow">
        <Icon aria-hidden className="size-7" strokeWidth={1.6} />
        {Badge && (
          <span className="absolute -right-1.5 -bottom-1.5 flex size-6 items-center justify-center rounded-full bg-navy text-white ring-[3px] ring-white">
            <Badge aria-hidden className="size-3" strokeWidth={2.4} />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1 text-center">
        <h2 className="text-[0.6875rem] leading-tight font-bold tracking-[0.1em] text-navy uppercase">
          {overline && (
            <span className="mb-0.5 block text-[0.71875rem] font-semibold tracking-normal text-muted normal-case">
              {overline}
            </span>
          )}
          {label}
        </h2>
        <p className="mt-1.5 flex items-baseline justify-center gap-1 leading-none font-extrabold text-accent">
          <AnimatedCounter value={value} startAfter={START.stats + 0.2} gradient className="text-[2.5rem] tracking-[-0.04em]" />
          {suffix && <span className="text-lg">{suffix}</span>}
        </p>
        <p className="mt-1.5 text-[0.6875rem] leading-tight font-bold tracking-[0.08em] text-navy uppercase">{unit}</p>
      </div>
    </motion.article>
  );
}

/** The project panel: key figures · funding sources · photographs. */
export function PosterOverview() {
  return (
    <Reveal
      eager
      timing={{ notBefore: START.panel }}
      className="glass min-h-0 rounded-[1.75rem] p-4"
    >
      <section
        aria-label="Лойиҳа ҳақида асосий маълумотлар"
        className="grid h-full min-h-0 grid-cols-[minmax(0,1.1fr)_minmax(0,0.95fr)_minmax(0,1.75fr)]"
      >
        <RevealGroup
          eager
          interval={0.14}
          timing={{ notBefore: START.stats }}
          className="grid min-h-0 grid-rows-3 gap-3 border-r border-navy/10 pr-5"
        >
          <Stat
            icon={ChartNoAxesCombined}
            badge={DollarSign}
            label="Лойиҳа қиймати"
            value={PROJECT_VALUE.value}
            unit={PROJECT_VALUE.unit}
          />
          <Stat
            icon={MapPinned}
            badge={Warehouse}
            overline={LOCATION.region}
            label={`${LOCATION.district}da`}
            value={POULTRY_HOUSES.value}
            suffix={POULTRY_HOUSES.suffix}
            unit={POULTRY_HOUSES.unit}
          />
          <Stat
            icon={Bird}
            overline={COMPANY_SHORT}
            label="ОТА-ОНА АВЛОДИ"
            value={PARENT_STOCK.value}
            unit={PARENT_STOCK.unit}
          />
        </RevealGroup>

        <RevealGroup eager timing={{ notBefore: START.funding }} className="min-h-0 border-r border-navy/10 px-5">
          <FundingChart startAfter={START.funding + 0.2} />
        </RevealGroup>

        <RevealGroup
          eager
          interval={0.12}
          timing={{ notBefore: START.gallery }}
          className="grid min-h-0 grid-cols-2 grid-rows-2 gap-3 pl-5"
        >
          {GALLERY.map((image, index) => (
            <ImageCard
              key={image.label}
              {...image}
              index={index}
              sizes="(min-width: 1200px) 26vw, 46vw"
              priority
              className="min-h-0 rounded-[1.75rem_0.5rem] ring-1 ring-white"
            />
          ))}
        </RevealGroup>
      </section>
    </Reveal>
  );
}
