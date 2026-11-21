// Pure geometry for the home page's agent scene (agent-swarm.tsx).

export interface Box { x: number; y: number; w: number; h: number }
export interface Point { x: number; y: number }

interface RectLike { top: number; bottom: number; left: number; width: number }

// Room kept clear for the sticky header at the top and a little breathing space at the bottom.
const TOP_MARGIN = 72
const BOTTOM_MARGIN = 24
const MIN_VISIBLE = 80

const visibleSpan = (rect: RectLike, viewportHeight: number) =>
  Math.min(rect.bottom, viewportHeight - BOTTOM_MARGIN) - Math.max(rect.top, TOP_MARGIN)

/**
 * The next section worth working on: the first one after `last` (wrapping around) with enough of it on screen.
 * Returns -1 when nothing is on screen.
 */
export function nextVisible (rects: readonly RectLike[], viewportHeight: number, last: number): number {
  for (let step = 1; step <= rects.length; step++) {
    const index = (last + step + rects.length) % rects.length
    if (visibleSpan(rects[index], viewportHeight) >= MIN_VISIBLE) return index
  }
  return -1
}

/** A viewport rect, clipped to what is on screen, in the overlay's own coordinates. */
export function toLocalBox (rect: RectLike, root: RectLike, viewportHeight: number): Box {
  const top = Math.max(rect.top, TOP_MARGIN)
  const bottom = Math.max(Math.min(rect.bottom, viewportHeight - BOTTOM_MARGIN), top)
  return { x: rect.left - root.left, y: top - root.top, w: rect.width, h: bottom - top }
}

/** `count` points in a horizontal row at height `y`, across the part of the box between two fractions of its width. */
export function rowPoints (box: Box, y: number, count: number, from = 0, to = 1): Point[] {
  const start = box.x + box.w * from
  const span = box.w * (to - from)
  return Array.from({ length: count }, (_, i) => ({ x: start + (count === 1 ? span / 2 : (i / (count - 1)) * span), y }))
}
