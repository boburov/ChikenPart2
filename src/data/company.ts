// The company-wide overview slide, taken from the «Baraka hamkor parranda» page
// (github.com/boburov/chicken, src/data/slides.ts) and put into Cyrillic.
// These are the company's own figures, not the Кегейли sheet's, so every value's
// source reads «корхона маълумоти».
import type { Fig } from './deck'

const SOURCE = ['корхона маълумоти (github.com/boburov/chicken)']
const fig = (value: number, decimals = 0): Fig => ({ value, decimals, trim: true, src: SOURCE })

export const COMPANY = {
  region: 'Андижон вилояти',
  name: '«Барака ҳамкор парранда»',
  kind: 'хусусий корхонаси',
  director: 'Алиев Шуҳратбек Эркинович',
  photo: '/img/cover-hens.webp',
  financing: {
    total: fig(50),
    bank: { fig: fig(35), logo: '/img/mkbank.svg', logoAlt: 'Микрокредитбанк' },
    own: fig(15),
  },
  comparison: [
    { key: 'meat', label: 'Товуқ гўшти', note: '', unit: 'минг тонна', before: fig(10), after: fig(60), afterUnit: 'минг тонна' },
    { key: 'eggs', label: 'Тухум', note: 'йиллик', unit: 'млн дона', before: fig(90), after: fig(418), afterUnit: 'млн дона' },
    { key: 'turnover', label: 'Айланма', note: 'ўртача йиллик', unit: 'млрд сўм', before: fig(300), after: fig(1.4, 1), afterUnit: 'трлн сўм' },
    { key: 'jobs', label: 'Иш ўринлари', note: '', unit: 'нафар', before: fig(305), after: fig(705), afterUnit: 'нафар' },
  ],
  market: [
    { key: 'eggs', label: 'Тухум', unit: 'млн дона', demand: fig(720), output: fig(418) },
    { key: 'meat', label: 'Гўшт', unit: 'минг тонна', demand: fig(52), output: fig(60) },
  ],
} as const

export type ComparisonKey = (typeof COMPANY.comparison)[number]['key']
