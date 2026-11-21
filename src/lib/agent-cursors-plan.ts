// Pure geometry for the home page's agent scene (agent-swarm.tsx).

export interface Box { x: number; y: number; w: number; h: number }
export interface Point { x: number; y: number }

interface RectLike { top: number; bottom: number; left: number; width: number }

// Room kept clear for the sticky header at the top and a little breathing space at the bottom.
const TOP_MARGIN = 72
const BOTTOM_MARGIN = 24
// A character standing on a section's top edge needs this much clear above it (below the header) and below it.
const HEADROOM = 120
const FOOTROOM = 120

/**
 * The first section whose top edge is on screen with room for a character to stand on it.
 * Returns -1 when there is no such edge (the view is in the middle of a tall section).
 */
export function edgeInView (rects: readonly RectLike[], viewportHeight: number): number {
  return rects.findIndex((r) => r.top >= HEADROOM && r.top <= viewportHeight - FOOTROOM)
}

/** The section under a viewport y, or -1. */
export function sectionAt (rects: readonly RectLike[], y: number): number {
  return rects.findIndex((r) => r.top <= y && r.bottom > y)
}

/** A viewport rect, clipped to what is on screen, in the overlay's own coordinates. */
export function toLocalBox (rect: RectLike, root: RectLike, viewportHeight: number): Box {
  const top = Math.max(rect.top, TOP_MARGIN)
  const bottom = Math.max(Math.min(rect.bottom, viewportHeight - BOTTOM_MARGIN), top)
  return { x: rect.left - root.left, y: top - root.top, w: rect.width, h: bottom - top }
}
