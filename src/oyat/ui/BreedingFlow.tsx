import { Fragment } from "react";
import { motion } from "framer-motion";
import { Bird, Egg, Feather, HandCoins, Scale, Warehouse, type LucideIcon } from "lucide-react";
import { BENEFIT, BREED } from "../content";
import { fadeUp } from "../motion";
import { cn } from "../cn";
import { FlowArrow } from "./FlowArrow";

type Step = { kind: "step"; value: string; caption: string; Icon: LucideIcon; final?: boolean };
type Sale = { kind: "sale" };
type Compare = { kind: "compare" };

const ITEMS: (Step | Compare | Sale)[] = [
  { kind: "step", ...BENEFIT.chain[0], Icon: Feather },
  { kind: "step", ...BENEFIT.chain[1], Icon: Bird },
  { kind: "compare" },
  { kind: "sale" },
  { kind: "step", ...BENEFIT.chain[2], Icon: Warehouse },
  {
    kind: "step",
    value: `${BENEFIT.output.value} ${BENEFIT.output.unit}`,
    caption: "бройлер инкубацион тухум · йилига",
    Icon: Egg,
    final: true,
  },
];

/** 3 mln birds × price per bird, in mln dollars. */
const saleTotal = (pricePerHead: number) => BENEFIT.sale.headsMln * pricePerHead;

/** One price line: who buys, 3 mln × price = total, and a bar on the Europe scale so the two cards compare. */
function PriceRow({ label, price, local, poster }: { label: string; price: number; local: boolean; poster: boolean }) {
  const { headsMln, europePricePerHead, unit } = BENEFIT.sale;
  const value = saleTotal(price);
  return (
    <span aria-hidden className="flex flex-col gap-0.5">
      <span className={cn("flex flex-wrap items-baseline justify-between gap-x-2 font-bold", poster ? "text-[0.6875rem]" : "text-sm")}>
        <span className={local ? "text-navy" : "text-muted"}>{label}:</span>
        <span className="ml-auto whitespace-nowrap">
          <span className="font-semibold text-muted">
            {headsMln} млн × {price} $ ={" "}
          </span>
          <span className={cn("font-extrabold", local ? "text-grad" : "text-navy/70")}>
            {value} {unit}
          </span>
        </span>
      </span>
      <span className={cn("block overflow-hidden rounded-full bg-navy/[0.07]", poster ? "h-1.5" : "h-2")}>
        <span
          className={cn("block h-full rounded-full", local ? "bg-grad" : "bg-navy/30")}
          style={{ width: `${(value / saleTotal(europePricePerHead)) * 100}%` }}
        />
      </span>
    </span>
  );
}

function CardHeader({ Icon, title, aside, poster }: { Icon: LucideIcon; title: string; aside?: string; poster: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span className={cn("bg-grad flex shrink-0 items-center justify-center rounded-lg text-white", poster ? "size-7" : "size-9")}>
        <Icon aria-hidden className={poster ? "size-4" : "size-5"} strokeWidth={1.8} />
      </span>
      <span className={cn("font-extrabold tracking-[0.12em] text-accent uppercase", poster ? "text-[0.625rem]" : "text-[0.6875rem]")}>
        {title}
      </span>
      {aside && <span className={cn("ml-auto font-semibold whitespace-nowrap text-muted", poster ? "text-[0.625rem]" : "text-xs")}>{aside}</span>}
    </span>
  );
}

/**
 * Importing the parent birds from Europe, and the currency saving: producing them here keeps
 * the whole import bill inside the country instead of paying it abroad.
 */
function CompareCard({ poster }: { poster: boolean }) {
  const { headsMln, europePricePerHead, unit } = BENEFIT.sale;
  const europe = saleTotal(europePricePerHead);
  return (
    <motion.li
      variants={fadeUp}
      aria-label={`Таққослаш. Европадан олиб келинганда: ${headsMln} млн бош × ${europePricePerHead} $ = ${europe} ${unit}. Тежамкорлик: ${europe} ${unit}.`}
      className={cn("glass relative flex min-w-0 flex-[1.35] flex-col rounded-[1.125rem]", poster ? "gap-1 px-2.5 py-2" : "gap-2 p-4 sm:p-5")}
    >
      <CardHeader Icon={Scale} title="Таққослаш" poster={poster} />
      <PriceRow label="Европадан олиб келинганда" price={europePricePerHead} local={false} poster={poster} />
      <span aria-hidden className={cn("mt-auto flex flex-col", poster ? "text-[0.6875rem]" : "text-sm")}>
        <span className="flex items-baseline justify-between gap-2 font-bold text-navy">
          Импорт ўрнини босиш
          <span className="font-extrabold whitespace-nowrap text-accent">
            {europe} {unit}
          </span>
        </span>
        <span className="font-semibold text-muted"></span>
      </span>
    </motion.li>
  );
}

/** Selling the parent generation locally: the same 3 mln birds at the local price. */
function SaleCard({ poster }: { poster: boolean }) {
  const { headsMln, pricePerHead, unit } = BENEFIT.sale;
  return (
    <motion.li
      variants={fadeUp}
      aria-label={`Сотув. Маҳаллий корхонадан олинганда: ${headsMln} млн бош × ${pricePerHead} $ = ${saleTotal(pricePerHead)} ${unit}.`}
      className={cn(
        "relative flex min-w-0 flex-[1.35] flex-col rounded-[1.125rem] border border-dashed border-accent/45 bg-accent/[0.06]",
        poster ? "gap-1 px-2.5 py-2" : "gap-2 p-4 sm:p-5",
      )}
    >
      <CardHeader Icon={HandCoins} title="Сотув" poster={poster} />
      <PriceRow label="Маҳаллий корхонадан олинганда" price={pricePerHead} local poster={poster} />
    </motion.li>
  );
}

/**
 * The breeding chain as a step diagram: grandparent birds → parent generation → Europe vs local
 * price → sale of the parent birds → flock kept on site → yearly hatching eggs.
 * (Chick capacity and exports are shown with the results.) `poster` is the compact one-screen size.
 */
export function BreedingFlow({ poster = false }: { poster?: boolean }) {
  let stepNumber = 0;
  return (
    <ol
      aria-label={`${BREED} наслчилик занжири`}
      className={cn("flex", poster ? "items-stretch gap-1" : "flex-col items-stretch gap-1 sm:flex-row sm:gap-2")}
    >
      {ITEMS.map((item, i) => {
        if (item.kind === "step") stepNumber += 1;
        return (
          <Fragment key={item.kind === "step" ? item.value : item.kind}>
            {i > 0 && (
              <li aria-hidden className="flex items-center justify-center">
                <FlowArrow direction={poster ? "right" : "responsive"} className={poster ? "w-5 [&_svg]:w-5" : "py-1 sm:py-0"} />
              </li>
            )}
            {item.kind === "compare" ? (
              <CompareCard poster={poster} />
            ) : item.kind === "sale" ? (
              <SaleCard poster={poster} />
            ) : (
              <StepCard step={item} n={stepNumber} poster={poster} />
            )}
          </Fragment>
        );
      })}
    </ol>
  );
}

function StepCard({ step, n, poster }: { step: Step; n: number; poster: boolean }) {
  return (
    <motion.li
      variants={fadeUp}
      className={cn(
        "relative flex min-w-0 flex-1 flex-col rounded-[1.125rem]",
        poster ? "gap-1 px-2.5 py-2" : "gap-2 p-4 sm:p-5",
        step.final ? "bg-grad text-white shadow-glow" : "glass",
      )}
    >
      <span className="flex items-center gap-2">
        <span
          className={cn(
            "flex shrink-0 items-center justify-center rounded-lg",
            poster ? "size-7" : "size-9",
            step.final ? "bg-white/20 text-white" : "bg-grad text-white",
          )}
        >
          <step.Icon aria-hidden className={poster ? "size-4" : "size-5"} strokeWidth={1.8} />
        </span>
        <span
          className={cn(
            "font-extrabold tracking-[0.12em] uppercase",
            poster ? "text-[0.625rem]" : "text-[0.6875rem]",
            step.final ? "text-white/80" : "text-accent",
          )}
        >
          {n}-босқич
        </span>
      </span>
      <span
        className={cn(
          "leading-tight font-extrabold tracking-tight",
          poster ? "text-[0.9375rem]" : "text-xl lg:text-2xl",
          step.final ? "text-white" : "text-grad",
        )}
      >
        {step.value}
      </span>
      <span
        className={cn(
          "leading-snug font-semibold",
          poster ? "text-[0.6875rem]" : "text-sm",
          step.final ? "text-white/85" : "text-muted",
        )}
      >
        {step.caption}
      </span>
    </motion.li>
  );
}
