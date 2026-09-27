import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { cn } from "../cn";

type AnimatedCounterProps = {
  value: number;
  decimals?: number;
  decimalSeparator?: string;
  duration?: number;
  /**
   * Seconds after mount at which to start counting, without waiting to be scrolled
   * into view. Used by the poster, where everything is on screen from the start and
   * the count should begin as the block fades in.
   */
  startAfter?: number;
  className?: string;
  /** Fill the digits with the brand gradient (applied per digit layer, not to the wrapper). */
  gradient?: boolean;
};

/**
 * Counts from 0 to `value` the first time it scrolls into view (or after `startAfter`).
 * The final value reserves the width up front, so neighbours never shift,
 * and the text node is written directly to avoid re-rendering on every frame.
 */
export function AnimatedCounter({
  value,
  decimals = 0,
  decimalSeparator = ".",
  duration = 2,
  startAfter,
  className,
  gradient = false,
}: AnimatedCounterProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const liveRef = useRef<HTMLSpanElement>(null);
  const seen = useInView(rootRef, { once: true, margin: "0px 0px -10% 0px" });
  const running = startAfter !== undefined || seen;
  const reduceMotion = useReducedMotion();

  const format = (n: number) => n.toFixed(decimals).replace(".", decimalSeparator);
  const finalText = format(value);

  useEffect(() => {
    const node = liveRef.current;
    if (!running || !node) return;

    if (reduceMotion) {
      node.textContent = finalText;
      return;
    }

    const controls = animate(0, value, {
      duration,
      delay: startAfter ?? 0,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        node.textContent = latest.toFixed(decimals).replace(".", decimalSeparator);
      },
    });
    return () => controls.stop();
  }, [running, reduceMotion, value, decimals, decimalSeparator, duration, startAfter, finalText]);

  return (
    <span ref={rootRef} className={cn("inline-grid tabular-nums", className)}>
      <span className="sr-only">{finalText}</span>
      <span aria-hidden className="invisible col-start-1 row-start-1">
        {finalText}
      </span>
      <span aria-hidden ref={liveRef} className={cn("col-start-1 row-start-1", gradient && "text-grad")}>
        {format(0)}
      </span>
    </span>
  );
}
