import { ImageCard } from "./ui/ImageCard";
import { Reveal, RevealGroup } from "./ui/Reveal";
import { GALLERY } from "./gallery";

/** Seconds after load at which the panel and its photos start, so they follow the title. */
const START = { panel: 0.7, gallery: 0.95 } as const;

/** The project panel: the four photographs in one row. */
export function PosterOverview() {
  return (
    <Reveal eager timing={{ notBefore: START.panel }} className="glass min-h-0 rounded-[1.75rem] p-4">
      <RevealGroup
        eager
        interval={0.12}
        timing={{ notBefore: START.gallery }}
        aria-label="Лойиҳа суратлари"
        className="grid h-full min-h-0 grid-cols-4 gap-3"
      >
        {GALLERY.map((image, index) => (
          <ImageCard
            key={image.label}
            {...image}
            index={index}
            sizes="(min-width: 1200px) 24vw, 46vw"
            priority
            className="min-h-0 rounded-[1.75rem_0.5rem] ring-1 ring-white"
          />
        ))}
      </RevealGroup>
    </Reveal>
  );
}
