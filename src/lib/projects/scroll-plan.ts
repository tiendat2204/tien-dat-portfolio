export type ScrollMode = 'pinned' | 'stacked' | 'static'

export const PIN_VIEWPORTS = 1.5
export const PIN_MIN_WIDTH = 768

export function scrollPlan (width: number, reducedMotion: boolean): ScrollMode {
  if (reducedMotion) return 'static'
  if (width < PIN_MIN_WIDTH) return 'stacked'
  return 'pinned'
}
