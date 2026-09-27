import { motion, type Variants } from "framer-motion";
import { EASE_OUT } from "../motion";
import { cn } from "../cn";

export type GalleryImage = {
  /** JPEG fallback. */
  src: string;
  /** WebP candidates, `url width` pairs. */
  webpSrcSet: string;
  alt: string;
  label: string;
  /** CSS object-position that keeps the subject in frame when cropped. */
  focus?: string;
};

const frame: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_OUT } },
};

/**
 * Navy curtain lifts away while the photo settles from a slight zoom.
 * No explicit delays here: they would cancel the gallery's stagger.
 */
const curtain: Variants = {
  hidden: { scaleY: 1 },
  show: { scaleY: 0, transition: { duration: 1.2, ease: EASE_OUT } },
};

const settle: Variants = {
  hidden: { scale: 1.18 },
  show: { scale: 1, transition: { duration: 1.7, ease: EASE_OUT } },
};

type ImageCardProps = GalleryImage & {
  index: number;
  sizes: string;
  /** Load immediately: the image is on screen from the first paint (poster). */
  priority?: boolean;
  className?: string;
};

export function ImageCard({ src, webpSrcSet, alt, label, focus, index, sizes, priority, className }: ImageCardProps) {
  return (
    <motion.figure
      variants={frame}
      className={cn(
        "group relative isolate overflow-hidden rounded-2xl bg-mist shadow-card",
        className,
      )}
    >
      <motion.div variants={settle} className="absolute inset-0">
        <picture>
          <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
          <img
            src={src}
            alt={alt}
            width={1400}
            height={1050}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            style={{ objectPosition: focus }}
            className="size-full object-cover transition-[scale] duration-[1200ms] ease-out-expo group-hover:scale-[1.07]"
          />
        </picture>
      </motion.div>

      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-navy-deep/85 via-navy-deep/15 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-navy-deep/35 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
      />

      <figcaption className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-4 text-white sm:p-5">
        <span aria-hidden className="text-[0.6875rem] font-extrabold tracking-[0.18em] text-white/70 tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="relative pb-1.5 text-sm leading-tight font-bold tracking-wide">
          {label}
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-accent transition-[scale] duration-700 ease-out-expo group-hover:scale-x-100"
          />
        </span>
      </figcaption>

      <motion.span
        aria-hidden
        variants={curtain}
        className="absolute inset-0 z-10 origin-top bg-navy"
      />
    </motion.figure>
  );
}
