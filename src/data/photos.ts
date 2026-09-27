import type { SectionId } from './types'

/**
 * Photo for each slide. Paste an image URL (or a path under public/, e.g. "/photos/cover.jpg").
 * Leave it empty and the slide shows a branded placeholder in the same spot.
 */
export const PHOTOS: Record<'cover' | SectionId | 'processing', string> = {
  cover: '',
  processing: '',
  praroditel: '',
  roditel: '',
  broiler: '',
  nesushka: '',
}
