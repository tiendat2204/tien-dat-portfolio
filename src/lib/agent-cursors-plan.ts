// Pure geometry for the home page's agents (agent-swarm.tsx).

export interface Point { x: number; y: number }

interface RectLike { top: number; bottom: number }

/** The section under a viewport y, or -1. */
export function sectionAt (rects: readonly RectLike[], y: number): number {
  return rects.findIndex((r) => r.top <= y && r.bottom > y)
}
