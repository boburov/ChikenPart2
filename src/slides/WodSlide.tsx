import { PosterBenefits } from '../oyat/PosterBenefits'
import { PosterHeader } from '../oyat/PosterHeader'
import { PosterOverview } from '../oyat/PosterOverview'
import { PosterResults } from '../oyat/PosterResults'

/**
 * The WOD-188-2 poster from github.com/boburov/chicken-oyatbek, in Cyrillic: the joint
 * venture, project value and funding, the breeding chain and the results. Its parts
 * live in src/oyat and are sized in rem, so at this deck's 16px root the poster fills
 * the space between the header and the footer.
 *
 * It mounts only while its slide is open, so the entrance animation plays every time.
 */
export function WodSlide({ active }: { active: boolean }) {
  return (
    <div className="absolute inset-x-16 top-[108px] bottom-[70px]">
      {active && (
        <div className="grid h-full grid-rows-[auto_minmax(0,1fr)_auto_auto] gap-2.5">
          <PosterHeader />
          <PosterOverview />
          <PosterBenefits />
          <PosterResults />
        </div>
      )}
    </div>
  )
}
