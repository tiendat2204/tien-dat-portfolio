import type { CSSProperties } from 'react'

// Scroll animation of the hand-drawn project diagrams, in CSS only: the scroller writes the section's progress to
// `--p` (0..1) and every style here is a calc() of it, so no JS runs per frame and nothing re-renders.
// `a` and `b` are progress values: the effect runs from a to b, holds before a and after b.

// 0 until `a`, 1 from `b`, linear in between (a CSS number).
export const seg = (a: number, b: number) => `clamp(0, calc((var(--p) - ${a}) / ${b - a}), 1)`

// A path drawn in from its start (needs no pathLength: set by the caller via `pathLength={1}`).
export const draw = (a: number, b: number): CSSProperties => ({ strokeDasharray: 1, strokeDashoffset: `calc(1 - ${seg(a, b)})` })

export const fade = (a: number, b: number): CSSProperties => ({ opacity: seg(a, b) })

// Fades in while sliding from (dx, dy) to its place.
export const rise = (a: number, b: number, dx = 0, dy = 12): CSSProperties => ({
  opacity: seg(a, b),
  transform: `translate(calc((1 - ${seg(a, b)}) * ${dx}px), calc((1 - ${seg(a, b)}) * ${dy}px))`,
})

// Moves from the origin to (dx, dy).
export const travel = (a: number, b: number, dx: number, dy = 0): CSSProperties => ({
  transform: `translate(calc(${seg(a, b)} * ${dx}px), calc(${seg(a, b)} * ${dy}px))`,
})

// Visible only between a and b (fades in over `edge`, fades out over `edge`).
export const pulse = (a: number, b: number, edge = 0.03): CSSProperties => ({
  opacity: `calc(min(${seg(a, a + edge)}, 1 - ${seg(b - edge, b)}))`,
})
