export type ScrollMode = 'pinned' | 'stacked' | 'static'

export const PIN_VIEWPORTS = 1.5
export const PIN_MIN_WIDTH = 1024
export const PIN_TOP_OFFSET = 96

export function scrollPlan (width: number, reducedMotion: boolean): ScrollMode {
  if (reducedMotion) return 'static'
  if (width < PIN_MIN_WIDTH) return 'stacked'
  return 'pinned'
}
