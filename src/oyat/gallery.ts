import broiler800 from "./assets/gallery/broiler-house-800.webp";
import broiler1400 from "./assets/gallery/broiler-house-1400.webp";
import broilerJpg from "./assets/gallery/broiler-house-1400.jpg";
import chicks800 from "./assets/gallery/chicks-800.webp";
import chicks1400 from "./assets/gallery/chicks-1400.webp";
import chicksJpg from "./assets/gallery/chicks-1400.jpg";
import cageWebp from "./assets/gallery/cage-house-640.webp";
import cageJpg from "./assets/gallery/cage-house-640.jpg";
import incubatorWebp from "./assets/gallery/incubator-hall.webp";
import incubatorJpg from "./assets/gallery/incubator-hall.jpg";
import type { GalleryImage } from "./ui/ImageCard";

/** The four photographs shared by the scrolling page and the poster. */
export const GALLERY: GalleryImage[] = [
  {
    src: broilerJpg,
    webpSrcSet: `${broiler800} 800w, ${broiler1400} 1400w`,
    alt: "Паррандачилик мажмуасидаги бройлер паррандахонаси: озиқлантириш ва суғориш линиялари орасида оқ товуқлар",
    label: "Паррандачилик мажмуаси",
  },
  {
    src: cageJpg,
    webpSrcSet: `${cageWebp} 640w`,
    alt: "Замонавий паррандахона: кўп қаватли катакларда оқ товуқлар",
    label: "Замонавий паррандахона",
  },
  {
    src: incubatorJpg,
    webpSrcSet: `${incubatorWebp} 550w`,
    alt: "Инкубация цехи: икки томонида инкубатор шкафлари жойлашган ёруғ йўлак",
    label: "Инкубация цехи",
  },
  {
    src: chicksJpg,
    webpSrcSet: `${chicks800} 800w, ${chicks1400} 1400w`,
    alt: "Инкубатордан чиққан бир кунлик жўжалар",
    label: "Бир кунлик жўжалар",
  },
];
