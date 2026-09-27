import { motion } from "framer-motion";
import { BreedingFlow } from "./ui/BreedingFlow";
import { RevealGroup } from "./ui/Reveal";
import { BREED } from "./content";
import { fadeUp } from "./motion";

const START = 1.75;

/** Full-width glass card: the breeding chain as arrows, ending in the yearly chick capacity. */
export function PosterBenefits() {
  return (
    <RevealGroup
      eager
      interval={0.12}
      timing={{ notBefore: START }}
      aria-label="Лойиҳа афзаллиги"
      className="glass flex flex-col gap-2 rounded-[1.5rem] px-5 py-2.5"
    >
      <motion.h2 variants={fadeUp} className="flex items-center gap-2.5 text-xs font-extrabold tracking-[0.14em] text-navy uppercase">
        <span aria-hidden className="bg-grad h-[0.1875rem] w-6 rounded-full" />
        Лойиҳа афзаллиги
        <span className="font-bold tracking-normal text-muted normal-case">· {BREED} зоти наслчилик занжири</span>
      </motion.h2>
      <BreedingFlow poster />
    </RevealGroup>
  );
}
