import af from "./assets/flags/af.svg";
import by from "./assets/flags/by.svg";
import kg from "./assets/flags/kg.svg";
import kz from "./assets/flags/kz.svg";
import ru from "./assets/flags/ru.svg";
import tj from "./assets/flags/tj.svg";
import mkbank from "./assets/mkbank.svg";

/**
 * Every figure and label shown on the page lives here,
 * so the presentation can be updated without touching the components.
 */

export const PARTNER_NAME = "BEIJING HUA DU YOUKOU POULTRY CO., LTD";
/** Short legal form for tight spots: ХК = хусусий корхона (private enterprise). */
export const COMPANY_SHORT = "“Барака Наслли Парранда” ХК";
export const BREED = "WOD-188-2";

export const LOCATION = {
  region: "Қорақалпоғистон Республикаси",
  district: "Кегейли тумани",
} as const;

export const PROJECT_VALUE = { value: 30, unit: "млн долл." } as const;
export const POULTRY_HOUSES = { value: 45, suffix: "та", unit: "замонавий паррандахона қурилади" } as const;

/** Where the 30 mln dollars come from; the parts add up to PROJECT_VALUE. */
export const FUNDING: { label: string; value: number; logo?: { src: string; alt: string } }[] = [
  { label: "Хорижий инвестиция", value: 12 },
  { label: "Тадбиркор маблағи", value: 3 },
  { label: "Банк кредити", value: 15, logo: { src: mkbank, alt: "Микрокредитбанк логотипи" } },
];

export const PARENT_STOCK = { value: 500, unit: "минг бош / йил" } as const;

export const BENEFIT = {
  chain: [
    { value: "60 минг бош", caption: "прародитель паррандалар" },
    { value: "3 млн бошгача", caption: "ота-она авлоди етиштирилади" },
    { value: "500 минг бош", caption: "ота-она авлоди корхонада сақланади" },
  ],
  output: { value: 85, unit: "млн дона" },
  chicks: { value: 72, unit: "млн дона" },
  export: { value: 43, unit: "млн долл." },
  /** The parent generation is sold on: our price per bird against importing the same birds from Europe. */
  sale: { headsMln: 3, pricePerHead: 7, europePricePerHead: 12, unit: "млн долл." },
} as const;

export const EXPORT_COUNTRIES = [
  { name: "Афғонистон", flag: af },
  { name: "Қозоғистон", flag: kz },
  { name: "Қирғизистон", flag: kg },
  { name: "Тожикистон", flag: tj },
  { name: "Россия", flag: ru },
  { name: "Беларусь", flag: by },
] as const;
