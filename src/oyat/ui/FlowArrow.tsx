import { useId } from "react";
import { motion, type Variants } from "framer-motion";
import { EASE_OUT } from "../motion";
import { cn } from "../cn";

const draw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  show: { pathLength: 1, opacity: 1, transition: { duration: 0.9, ease: EASE_OUT } },
};

type FlowArrowProps = {
  /** Which way the arrow points. `responsive` points down on phones and right from `sm` up. */
  direction?: "right" | "down" | "responsive";
  className?: string;
};

/**
 * Blue → purple arrow that draws itself when its reveal group comes into view.
 * Used between steps of every flow on the page so each diagram reads left → right (or top → bottom).
 */
export function FlowArrow({ direction = "right", className }: FlowArrowProps) {
  // useId can contain characters that break url(#…) references, so keep it alphanumeric.
  const gradientId = `arrow-${useId().replace(/[^a-zA-Z0-9-]/g, "")}`;
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center",
        direction === "down" && "rotate-90",
        direction === "responsive" && "rotate-90 sm:rotate-0",
        className,
      )}
    >
      <svg viewBox="0 0 44 20" className="h-[1.25rem] w-[2.75rem] overflow-visible" fill="none">
        <defs>
          {/* userSpaceOnUse: a straight line has a zero-height box, which would void a bounding-box gradient */}
          <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="3" x2="39" y1="10" y2="10">
            <stop offset="0" stopColor="var(--color-accent)" />
            <stop offset="1" stopColor="var(--color-violet)" />
          </linearGradient>
        </defs>
        <motion.path
          variants={draw}
          d="M3 10 H37"
          stroke={`url(#${gradientId})`}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <motion.path
          variants={draw}
          d="M30 3 L39 10 L30 17"
          stroke="var(--color-violet)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
