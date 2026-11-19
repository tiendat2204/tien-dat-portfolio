import type { CSSProperties } from 'react'

// Animate with CSS only. A ScrollStage writes its progress (0..1) to the `--p` custom property, and every helper
// here returns a style that is a `calc()` of it: no JS runs per frame and nothing re-renders.
// `a` and `b` are progress values. An effect holds its start state before `a` and its end state after `b`.

/** Writes the progress where the helpers (and `data-progress`) read it. */
export function writeProgress (element: HTMLElement, progress: number) {
  const value = progress.toFixed(4)

  element.dataset.progress = value
  element.style.setProperty('--p', value)
}

/** 0 until `a`, 1 from `b`, linear in between (a CSS number, usable inside any calc()). */
export const seg = (a: number, b: number) => {
  // Rounded so 0.6 - 0.2 is not written as 0.39999999999999997, and never 0 so a === b cannot divide by zero.
  const span = Math.max(Number((b - a).toFixed(4)), 0.0001)

  return `clamp(0, calc((var(--p) - ${a}) / ${span}), 1)`
}

/** Draws an SVG shape in from its start. Put `pathLength={1}` on the element. */
export const draw = (a: number, b: number): CSSProperties => ({
  strokeDasharray: 1,
  strokeDashoffset: `calc(1 - ${seg(a, b)})`,
})

export const fade = (a: number, b: number): CSSProperties => ({ opacity: seg(a, b) })

/** Fades in while sliding from (dx, dy) px to its place. */
export const rise = (a: number, b: number, dx = 0, dy = 12): CSSProperties => ({
  opacity: seg(a, b),
  transform: `translate(calc((1 - ${seg(a, b)}) * ${dx}px), calc((1 - ${seg(a, b)}) * ${dy}px))`,
})

/** Moves from the origin to (dx, dy) px. */
export const travel = (a: number, b: number, dx: number, dy = 0): CSSProperties => ({
  transform: `translate(calc(${seg(a, b)} * ${dx}px), calc(${seg(a, b)} * ${dy}px))`,
})

/** Visible only between `a` and `b`, fading in and out over `edge`. */
export const pulse = (a: number, b: number, edge = 0.03): CSSProperties => ({
  opacity: `calc(min(${seg(a, a + edge)}, 1 - ${seg(b - edge, b)}))`,
})
