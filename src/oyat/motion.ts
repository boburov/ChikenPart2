import type { Variants } from "framer-motion";

/** One easing curve for the whole page keeps the motion language consistent. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Reveal once, slightly before the element is fully on screen. */
export const VIEWPORT = { once: true, margin: "0px 0px -12% 0px" } as const;

/**
 * When an animation may begin:
 * - a number is a plain delay in seconds;
 * - `{ notBefore }` holds the element back until that many seconds after page load,
 *   so above-the-fold blocks queue up behind the hero intro, while the same blocks
 *   reveal instantly if the reader only reaches them later by scrolling.
 */
export type Timing = number | { notBefore: number } | undefined;

const pageStart = performance.now();

const resolveDelay = (timing: Timing) => {
  if (typeof timing === "number") return timing;
  if (!timing) return 0;
  return Math.max(0, timing.notBefore - (performance.now() - pageStart) / 1000);
};

/**
 * A child's own `delay` replaces the delay a staggering parent hands down,
 * so it is only set when the caller explicitly asked for one.
 */
const withDelay = (timing: Timing) => {
  const delay = resolveDelay(timing);
  return delay > 0 ? { delay } : {};
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (timing: Timing) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: EASE_OUT, ...withDelay(timing) },
  }),
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: (timing: Timing) => ({
    opacity: 1,
    transition: { duration: 0.9, ease: "easeOut", ...withDelay(timing) },
  }),
};

export const drawX: Variants = {
  hidden: { scaleX: 0 },
  show: (timing: Timing) => ({
    scaleX: 1,
    transition: { duration: 1.2, ease: EASE_OUT, ...withDelay(timing) },
  }),
};

/** Parent variant that reveals its `hidden` / `show` children one after another. */
export const stagger = (staggerChildren = 0.09, timing?: Timing): Variants => ({
  hidden: {},
  show: () => ({
    transition: { staggerChildren, delayChildren: resolveDelay(timing) },
  }),
});
