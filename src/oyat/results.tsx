import { TrendingUp, type LucideIcon } from "lucide-react";

export type Impact = {
  Icon: LucideIcon;
  label: string;
  note?: string;
  /** Today's figure, shown as plain text. */
  before: { value: string; unit: string };
  /** The figure once the project runs; counted up on screen. */
  after: { value: number; decimals?: number; unit: string };
};

/** "Эришиладиган натижалар": each indicator today → after the project. */
export const IMPACTS: Impact[] = [
 
  {
    Icon: TrendingUp,
    label: "Айланма",
    note: "ўртача йиллик",
    before: { value: "70", unit: "млрд сўм" },
    after: { value: 750, unit: "млрд сўм" },
  },
];
