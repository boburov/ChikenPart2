import { useMemo } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { fadeUp, stagger, VIEWPORT, type Timing } from "../motion";

type Trigger = {
  timing?: Timing;
  /**
   * Reveal on mount instead of on scroll. The poster never scrolls, so blocks near
   * the bottom edge would otherwise sit outside the in-view margin forever.
   */
  eager?: boolean;
};

const triggerProps = (eager?: boolean) =>
  eager
    ? ({ initial: "hidden", animate: "show" } as const)
    : ({ initial: "hidden", whileInView: "show", viewport: VIEWPORT } as const);

type RevealProps = HTMLMotionProps<"div"> & Trigger;

/** Fades a single block up into place when it scrolls into view. */
export function Reveal({ timing, eager, ...props }: RevealProps) {
  return <motion.div variants={fadeUp} custom={timing} {...triggerProps(eager)} {...props} />;
}

type RevealGroupProps = HTMLMotionProps<"div"> & Trigger & { interval?: number };

/**
 * Orchestrates its children: any descendant `motion` element with
 * `hidden` / `show` variants is revealed in sequence.
 */
export function RevealGroup({ interval = 0.09, timing, eager, ...props }: RevealGroupProps) {
  const notBefore = typeof timing === "object" ? timing.notBefore : undefined;
  const delay = typeof timing === "number" ? timing : undefined;
  const variants = useMemo(
    () => stagger(interval, notBefore !== undefined ? { notBefore } : delay),
    [interval, notBefore, delay],
  );

  return <motion.div variants={variants} {...triggerProps(eager)} {...props} />;
}
