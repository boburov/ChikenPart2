import { motion } from "framer-motion";
import { ImpactCard } from "./ui/ImpactCard";
import { OutputTiles } from "./ui/OutputTiles";
import { RevealGroup } from "./ui/Reveal";
import { EXPORT_COUNTRIES } from "./content";
import { IMPACTS, type Impact } from "./results";
import { fadeUp } from "./motion";

const START = 2.1;

/** Where the day-old chicks are exported: six flags in a compact 3 × 2 grid. */
function ExportCard() {
  return (
    <motion.section
      variants={fadeUp}
      aria-label="Экспорт географияси"
      className="glass flex min-w-0 flex-col gap-2 rounded-[1.25rem] px-3.5 py-3"
    >
      <h3 className="text-[0.625rem] font-extrabold tracking-[0.14em] text-accent uppercase">Экспорт географияси</h3>
      <ul className="grid min-h-0 flex-1 grid-cols-3 content-center gap-x-2 gap-y-2">
        {EXPORT_COUNTRIES.map((country) => (
          <li key={country.name} className="flex min-w-0 flex-col items-center gap-1 text-center">
            <img
              src={country.flag}
              alt={`${country.name} байроғи`}
              width={40}
              height={30}
              decoding="async"
              className="aspect-[4/3] w-8 rounded-[4px] object-cover shadow-sm ring-1 ring-navy/10"
            />
            <span className="max-w-full truncate text-[0.5625rem] leading-tight font-bold text-navy/85">{country.name}</span>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}

/** "Эришиладиган натижалар": the yearly chick output and exports, the indicators (today → after the project), with export flags before the last one. */
export function PosterResults() {
  // Export destinations go directly before the "Айланма" card (or last, if it is missing).
  const turnover = IMPACTS.findIndex((impact) => impact.label === "Айланма");
  const at = turnover === -1 ? IMPACTS.length : turnover;
  const cells: (Impact | "export")[] = [...IMPACTS.slice(0, at), "export", ...IMPACTS.slice(at)];
  const columns = ["minmax(0, 1.5fr)", ...cells.map((cell) => (cell === "export" ? "minmax(0, 0.8fr)" : "minmax(0, 1fr)"))].join(" ");

  return (
    <RevealGroup eager interval={0.08} timing={{ notBefore: START }} aria-labelledby="poster-results">
      <motion.h2
        variants={fadeUp}
        id="poster-results"
        className="flex items-center gap-2.5 text-[0.9375rem] font-extrabold tracking-[0.08em] text-navy uppercase"
      >
        <span aria-hidden className="bg-grad h-[0.1875rem] w-6 rounded-full" />
        Эришиладиган натижалар
      </motion.h2>

      <div className="mt-2 grid h-[8.5rem] items-stretch gap-2.5" style={{ gridTemplateColumns: columns }}>
        <OutputTiles poster startAfter={START + 0.3} />
        {cells.map((cell) =>
          cell === "export" ? (
            <ExportCard key="export" />
          ) : (
            <ImpactCard key={cell.label} {...cell} poster startAfter={START + 0.3} />
          ),
        )}
      </div>
    </RevealGroup>
  );
}
