// Pure geometry for the home page's agents (agent-swarm.tsx).

export interface Point { x: number; y: number }

interface RectLike { top: number; bottom: number }

/** The section under a viewport y, or -1. */
export function sectionAt (rects: readonly RectLike[], y: number): number {
  return rects.findIndex((r) => r.top <= y && r.bottom > y)
}

/**
 * The section with the most of itself on screen (below `top`, the bottom edge of the site header), or -1 when
 * none shows at all.
 */
export function mostVisible (rects: readonly RectLike[], viewportHeight: number, top = 0): number {
  let best = -1
  let most = 0
  rects.forEach((r, i) => {
    const shown = Math.min(r.bottom, viewportHeight) - Math.max(r.top, top)
    if (shown > most) {
      most = shown
      best = i
    }
  })
  return best
}
