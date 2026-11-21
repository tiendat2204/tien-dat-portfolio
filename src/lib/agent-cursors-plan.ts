// Pure geometry for the home page's agents (agent-swarm.tsx).

export interface Point { x: number; y: number }

interface RectLike { top: number; bottom: number }

/** The section under a viewport y, or -1. */
export function sectionAt (rects: readonly RectLike[], y: number): number {
  return rects.findIndex((r) => r.top <= y && r.bottom > y)
}

/**
 * Top-left corners for a wall of isometric bricks, `cols` wide and `rows` high, laid like masonry: every other
 * course is shifted half a brick. Slots run left to right, bottom course first, so later ones draw on top.
 * `x0` is the wall's left edge and `base` the top of the bottom course.
 */
export function wallSlots (cols: number, rows: number, brick: { w: number; rise: number }, x0: number, base: number): Point[] {
  return Array.from({ length: cols * rows }, (_, i) => {
    const row = Math.floor(i / cols)
    return { x: x0 + (i % cols) * brick.w + (row % 2) * (brick.w / 2), y: base - row * brick.rise }
  })
}
