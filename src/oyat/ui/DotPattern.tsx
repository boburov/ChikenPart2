import type { CSSProperties } from "react";
import { cn } from "../cn";

type DotPatternProps = {
  columns?: number;
  rows?: number;
  /** Distance between dot centres, in px at the 16px base (converted to rem so it scales in deck mode). */
  gap?: number;
  /** Any CSS colour; defaults to the brand navy. */
  color?: string;
  className?: string;
};

/** The dotted ornament from the original slide, rendered purely in CSS. */
export function DotPattern({ columns = 11, rows = 3, gap = 16, color, className }: DotPatternProps) {
  const style = {
    width: `${(columns * gap) / 16}rem`,
    height: `${(rows * gap) / 16}rem`,
    "--dot-gap": `${gap / 16}rem`,
    ...(color ? { "--dot-color": color } : {}),
  } as CSSProperties;

  return <span aria-hidden className={cn("dot-pattern block shrink-0", className)} style={style} />;
}
