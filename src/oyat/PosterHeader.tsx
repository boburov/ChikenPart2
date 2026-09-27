import { Fragment } from "react";
import { motion, type Variants } from "framer-motion";
import { Handshake } from "lucide-react";
import cnFlag from "./assets/flags/cn.svg";
import uzFlag from "./assets/flags/uz.svg";
import { DotPattern } from "./ui/DotPattern";
import { BREED, PARTNER_NAME } from "./content";
import { EASE_OUT, fadeUp, stagger } from "./motion";

const HEADLINE = [BREED, "ТОВУҚ", "ЗОТИ"];

const word: Variants = {
  hidden: { y: "110%" },
  show: { y: 0, transition: { duration: 1, ease: EASE_OUT } },
};

const ornament: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { duration: 1.2, ease: EASE_OUT } },
};

const intro = stagger(0.11, 0.15);

/** One side of the alliance: flag and company name. */
function Party({ flag, flagAlt, name }: { flag: string; flagAlt: string; name: string }) {
  return (
    <span className="glass flex items-center gap-2.5 rounded-2xl py-1.5 pr-4 pl-2">
      <img
        src={flag}
        alt={flagAlt}
        width={48}
        height={36}
        decoding="async"
        className="h-7 w-[2.3125rem] shrink-0 rounded-md object-cover shadow-sm ring-1 ring-navy/10"
      />
      <span className="text-[1.125rem] leading-tight font-extrabold tracking-[0.01em] whitespace-nowrap text-navy">{name}</span>
    </span>
  );
}

/**
 * The header leads with the alliance itself — the Uzbek company and the Chinese partner,
 * each with its flag — and names the breed and the project underneath, smaller.
 */
export function PosterHeader() {
  return (
    <motion.header variants={intro} initial="hidden" animate="show" className="relative text-center">
      <h1 className="mx-auto max-w-[80rem]">
        <motion.span variants={fadeUp} className="block text-[0.9375rem] font-extrabold tracking-[0.2em] text-accent uppercase">
          Қўшма корхона
        </motion.span>

        <motion.span variants={fadeUp} className="mt-1.5 flex items-center justify-center gap-3 uppercase">
          <Party flag={uzFlag} flagAlt="Ўзбекистон байроғи" name="“Kegeyli Baraka Naslli Parranda” H.K" />
          <span aria-hidden className="bg-grad flex size-8 shrink-0 items-center justify-center rounded-full text-white shadow-glow">
            <Handshake className="size-4" strokeWidth={2} />
          </span>
          <span className="sr-only"> ва </span>
          <Party flag={cnFlag} flagAlt="Хитой байроғи" name={`“${PARTNER_NAME}”`} />
        </motion.span>

        <span className="mt-2.5 block text-[2.125rem] leading-[1.05] font-extrabold tracking-[-0.03em] uppercase">
          {HEADLINE.map((text, i) => (
            <Fragment key={text}>
              <span className="inline-block overflow-hidden pb-[0.06em] align-bottom">
                <motion.span variants={word} className="inline-block text-grad">
                  {text}
                </motion.span>
              </span>
              {i < HEADLINE.length - 1 && " "}
            </Fragment>
          ))}
        </span>

        <motion.span
          variants={fadeUp}
          className="block text-[0.9375rem] leading-snug font-bold tracking-[0.06em] text-navy/80 uppercase"
        >
          Тўлиқ наслчилик занжирини маҳаллийлаштириш лойиҳаси
        </motion.span>
      </h1>

      <motion.div variants={ornament} aria-hidden className="absolute top-[72%] left-0 -translate-y-1/2">
        <DotPattern className="animate-float" />
      </motion.div>
      <motion.div variants={ornament} aria-hidden className="absolute top-[72%] right-0 -translate-y-1/2">
        <DotPattern className="animate-float [animation-delay:-5s]" />
      </motion.div>
    </motion.header>
  );
}
